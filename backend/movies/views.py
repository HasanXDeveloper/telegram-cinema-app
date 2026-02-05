from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, F
from django.db import transaction
from .models import (
    Movie, Genre, UserFavorite, WatchHistory, Review, MovieStream,
    MovieRating, WatchLater, UserMovieStatus, MovieCollection, ReviewLike
)
from .serializers import (
    MovieListSerializer, MovieDetailSerializer, GenreSerializer,
    ReviewSerializer, WatchHistorySerializer, FavoriteSerializer,
    MovieRatingSerializer, WatchLaterSerializer, MovieCollectionSerializer,
    ReviewDetailSerializer
)


class MovieListView(generics.ListAPIView):
    serializer_class = MovieListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movie_type', 'year', 'genres', 'available_quality']
    search_fields = ['title', 'original_title', 'description', 'director', 'cast']
    ordering_fields = ['year', 'created_at', 'our_rating', 'views_count', 'favorites_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Movie.objects.filter(is_active=True).prefetch_related('genres')
        category = self.request.query_params.get('category')
        
        if category == 'featured':
            queryset = queryset.filter(is_featured=True)
        elif category == 'new':
            queryset = queryset.order_by('-created_at')
        elif category == 'popular':
            queryset = queryset.order_by('-views_count', '-our_rating')
        elif category == 'top_rated':
            queryset = queryset.filter(our_rating__gte=8.0).order_by('-our_rating')
        elif category == 'trending':
            # Трендовые - популярные за последнюю неделю
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago).order_by('-views_count')
        
        return queryset


class MovieDetailView(generics.RetrieveAPIView):
    queryset = Movie.objects.filter(is_active=True)
    serializer_class = MovieDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Увеличиваем счетчик просмотров
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def movie_streams(request, pk):
    """Получение ссылок для просмотра фильма"""
    try:
        movie = Movie.objects.get(pk=pk, is_active=True)
        streams = MovieStream.objects.filter(movie=movie, is_active=True).order_by('-priority', 'quality')
        
        # Группируем по качеству и сезонам/эпизодам
        streams_data = {}
        for stream in streams:
            if stream.season and stream.episode:
                # Для сериалов
                season_key = f"season_{stream.season}"
                if season_key not in streams_data:
                    streams_data[season_key] = {}
                
                episode_key = f"episode_{stream.episode}"
                if episode_key not in streams_data[season_key]:
                    streams_data[season_key][episode_key] = {}
                
                streams_data[season_key][episode_key][stream.quality] = stream.url
            else:
                # Для фильмов
                if "movie" not in streams_data:
                    streams_data["movie"] = {}
                streams_data["movie"][stream.quality] = stream.url
        
        return Response(streams_data)
    except Movie.DoesNotExist:
        return Response({'error': 'Фильм не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, pk):
    """Добавление/удаление из избранного"""
    try:
        movie = Movie.objects.get(pk=pk, is_active=True)
        favorite, created = UserFavorite.objects.get_or_create(
            user=request.user,
            movie=movie
        )
        
        if not created:
            favorite.delete()
            # Уменьшаем счетчик
            movie.favorites_count = F('favorites_count') - 1
            movie.save(update_fields=['favorites_count'])
            return Response({'is_favorite': False})
        else:
            # Увеличиваем счетчик
            movie.favorites_count = F('favorites_count') + 1
            movie.save(update_fields=['favorites_count'])
            return Response({'is_favorite': True})
            
    except Movie.DoesNotExist:
        return Response({'error': 'Фильм не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_movie(request, pk):
    """Оценка фильма (без обязательного отзыва)"""
    try:
        movie = Movie.objects.get(pk=pk, is_active=True)
        rating_value = request.data.get('rating')
        
        if not rating_value or not (1 <= int(rating_value) <= 10):
            return Response({'error': 'Рейтинг должен быть от 1 до 10'}, status=status.HTTP_400_BAD_REQUEST)
        
        rating, created = MovieRating.objects.update_or_create(
            user=request.user,
            movie=movie,
            defaults={'rating': rating_value}
        )
        
        # Обновляем средний рейтинг фильма
        movie.update_our_rating()
        
        return Response({
            'rating': rating.rating,
            'movie_rating': movie.our_rating,
            'ratings_count': movie.ratings_count
        })
        
    except Movie.DoesNotExist:
        return Response({'error': 'Фильм не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_watch_progress(request, pk):
    """Обновление прогресса просмотра"""
    try:
        movie = Movie.objects.get(pk=pk, is_active=True)
        progress = request.data.get('progress', 0)
        season = request.data.get('season')
        episode = request.data.get('episode')
        
        watch_history, created = WatchHistory.objects.update_or_create(
            user=request.user,
            movie=movie,
            season=season,
            episode=episode,
            defaults={'progress': progress}
        )
        
        # Обновляем статус просмотра
        if progress > 0:
            status_value = 'watching'
            # Если просмотрено больше 90%, считаем просмотренным
            if movie.duration and progress >= (movie.duration * 60 * 0.9):
                status_value = 'watched'
            
            UserMovieStatus.objects.update_or_create(
                user=request.user,
                movie=movie,
                defaults={'status': status_value}
            )
        
        return Response({'success': True})
    except Movie.DoesNotExist:
        return Response({'error': 'Фильм не найден'}, status=status.HTTP_404_NOT_FOUND)


class MovieReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        movie_id = self.kwargs['pk']
        return Review.objects.filter(movie_id=movie_id).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        movie_id = self.kwargs['pk']
        movie = Movie.objects.get(pk=movie_id, is_active=True)
        
        with transaction.atomic():
            review = serializer.save(user=self.request.user, movie=movie)
            
            # Если в отзыве есть рейтинг, создаем/обновляем MovieRating
            if review.rating:
                MovieRating.objects.update_or_create(
                    user=self.request.user,
                    movie=movie,
                    defaults={'rating': review.rating}
                )
                
                # Обновляем средний рейтинг
                movie.update_our_rating()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_review(request, review_id):
    """Лайк/дизлайк отзыва"""
    try:
        review = Review.objects.get(pk=review_id)
        is_like = request.data.get('is_like', True)
        
        # Проверяем, не лайкает ли пользователь свой отзыв
        if review.user == request.user:
            return Response({'error': 'Нельзя оценивать свой отзыв'}, status=status.HTTP_400_BAD_REQUEST)
        
        vote, created = ReviewLike.objects.update_or_create(
            user=request.user,
            review=review,
            defaults={'is_like': is_like}
        )
        
        # Пересчитываем лайки/дизлайки
        likes_count = ReviewLike.objects.filter(review=review, is_like=True).count()
        dislikes_count = ReviewLike.objects.filter(review=review, is_like=False).count()
        
        review.likes_count = likes_count
        review.dislikes_count = dislikes_count
        review.save(update_fields=['likes_count', 'dislikes_count'])
        
        return Response({
            'likes_count': likes_count,
            'dislikes_count': dislikes_count,
            'user_vote': is_like
        })
        
    except Review.DoesNotExist:
        return Response({'error': 'Отзыв не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_watch_later(request, pk):
    """Добавить в список 'Смотреть позже' """
    try:
        movie = Movie.objects.get(pk=pk, is_active=True)
        watch_later, created = WatchLater.objects.get_or_create(
            user=request.user,
            movie=movie
        )
        
        if not created:
            watch_later.delete()
            return Response({'in_watch_later': False})
        
        return Response({'in_watch_later': True})
        
    except Movie.DoesNotExist:
        return Response({'error': 'Фильм не найден'}, status=status.HTTP_404_NOT_FOUND)


class GenreListView(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer


class SearchMoviesView(generics.ListAPIView):
    serializer_class = MovieListSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if len(query) < 2:
            return Movie.objects.none()
        
        return Movie.objects.filter(
            Q(title__icontains=query) |
            Q(original_title__icontains=query) |
            Q(description__icontains=query) |
            Q(director__icontains=query) |
            Q(cast__icontains=query),
            is_active=True
        ).distinct().order_by('-our_rating', '-views_count')


# Пользовательские данные
class UserFavoritesView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user).select_related('movie')


class UserWatchHistoryView(generics.ListAPIView):
    serializer_class = WatchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WatchHistory.objects.filter(user=self.request.user).select_related('movie').order_by('-watched_at')


class UserWatchLaterView(generics.ListAPIView):
    serializer_class = WatchLaterSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WatchLater.objects.filter(user=self.request.user).select_related('movie')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_recommendations(request):
    """Персональные рекомендации на основе истории просмотров и рейтингов"""
    user = request.user
    
    # Получаем жанры из истории просмотров и высоких оценок
    user_genres = Genre.objects.filter(
        Q(movie__watchhistory__user=user) |
        Q(movie__user_ratings__user=user, movie__user_ratings__rating__gte=7)
    ).annotate(
        weight=Count('movie__watchhistory') + Count('movie__user_ratings')
    ).distinct().order_by('-weight')[:5]
    
    if not user_genres.exists():
        # Если истории нет, показываем популярные фильмы
        recommended_movies = Movie.objects.filter(
            is_active=True,
            our_rating__gte=7.0
        ).order_by('-our_rating', '-views_count')[:20]
    else:
        # Рекомендуем фильмы с похожими жанрами, исключая уже просмотренные
        recommended_movies = Movie.objects.filter(
            genres__in=user_genres,
            is_active=True,
            our_rating__gte=6.0
        ).exclude(
            Q(watchhistory__user=user) |
            Q(userfavorite__user=user)
        ).distinct().order_by('-our_rating', '-views_count')[:20]
    
    serializer = MovieListSerializer(recommended_movies, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Статистика пользователя"""
    user = request.user
    
    # Подсчитываем статистику
    total_watched = WatchHistory.objects.filter(user=user).count()
    total_favorites = UserFavorite.objects.filter(user=user).count()
    total_ratings = MovieRating.objects.filter(user=user).count()
    avg_rating = MovieRating.objects.filter(user=user).aggregate(avg=Avg('rating'))['avg']
    
    # Любимые жанры
    favorite_genres = Genre.objects.filter(
        movie__user_ratings__user=user,
        movie__user_ratings__rating__gte=7
    ).annotate(
        count=Count('movie__user_ratings')
    ).order_by('-count')[:5]
    
    # Время просмотра (приблизительно)
    total_watch_time = WatchHistory.objects.filter(user=user).aggregate(
        total_time=models.Sum('progress')
    )['total_time'] or 0
    
    return Response({
        'total_watched': total_watched,
        'total_favorites': total_favorites,
        'total_ratings': total_ratings,
        'average_rating': round(avg_rating, 1) if avg_rating else 0,
        'total_watch_time_minutes': total_watch_time // 60,
        'favorite_genres': [{'name': g.name, 'count': g.count} for g in favorite_genres]
    })


class MovieCollectionListView(generics.ListAPIView):
    serializer_class = MovieCollectionSerializer
    queryset = MovieCollection.objects.filter(is_featured=True)


@api_view(['GET'])
def movie_collection_detail(request, pk):
    """Детали коллекции с фильмами"""
    try:
        collection = MovieCollection.objects.get(pk=pk)
        movies = collection.movies.filter(is_active=True)
        
        collection_data = MovieCollectionSerializer(collection).data
        movies_data = MovieListSerializer(movies, many=True, context={'request': request}).data
        
        return Response({
            'collection': collection_data,
            'movies': movies_data
        })
        
    except MovieCollection.DoesNotExist:
        return Response({'error': 'Коллекция не найдена'}, status=status.HTTP_404_NOT_FOUND)