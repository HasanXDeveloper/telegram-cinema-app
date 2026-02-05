from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Movie, Genre, MovieStream, UserFavorite, WatchHistory, Review,
    MovieRating, WatchLater, MovieCollection, ReviewLike, UserMovieStatus
)


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class MovieStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieStream
        fields = ['id', 'url', 'quality', 'season', 'episode', 'priority']


class MovieListSerializer(serializers.ModelSerializer):
    genres = serializers.StringRelatedField(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    watch_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'year', 'poster_url', 'backdrop_url', 'trailer_url',
            'movie_type', 'genres', 'our_rating', 'imdb_rating', 'kinopoisk_rating',
            'duration', 'available_quality', 'views_count', 'favorites_count',
            'is_favorite', 'user_rating', 'watch_progress', 'age_rating'
        ]
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, movie=obj).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = MovieRating.objects.get(user=request.user, movie=obj)
                return rating.rating
            except MovieRating.DoesNotExist:
                pass
        return None
    
    def get_watch_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                history = WatchHistory.objects.filter(user=request.user, movie=obj).first()
                if history:
                    return {
                        'progress': history.progress,
                        'season': history.season,
                        'episode': history.episode,
                        'percentage': (history.progress / (obj.duration * 60) * 100) if obj.duration else 0
                    }
            except WatchHistory.DoesNotExist:
                pass
        return None


class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    streams = MovieStreamSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    user_status = serializers.SerializerMethodField()
    similar = serializers.SerializerMethodField()
    reviews_stats = serializers.SerializerMethodField()
    in_watch_later = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'original_title', 'description', 'short_description',
            'year', 'duration', 'movie_type', 'genres', 'imdb_rating', 
            'kinopoisk_rating', 'our_rating', 'ratings_count', 'poster_url', 
            'backdrop_url', 'trailer_url', 'director', 'cast', 'countries', 
            'studios', 'age_rating', 'budget', 'box_office', 'awards',
            'available_quality', 'has_subtitles', 'subtitle_languages', 
            'audio_languages', 'views_count', 'favorites_count', 'streams',
            'is_favorite', 'user_rating', 'user_status', 'similar', 
            'reviews_stats', 'in_watch_later'
        ]
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, movie=obj).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = MovieRating.objects.get(user=request.user, movie=obj)
                return rating.rating
            except MovieRating.DoesNotExist:
                pass
        return None
    
    def get_user_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                status = UserMovieStatus.objects.get(user=request.user, movie=obj)
                return status.status
            except UserMovieStatus.DoesNotExist:
                pass
        return None
    
    def get_in_watch_later(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return WatchLater.objects.filter(user=request.user, movie=obj).exists()
        return False
    
    def get_similar(self, obj):
        # Улучшенный алгоритм поиска похожих фильмов
        similar_movies = Movie.objects.filter(
            genres__in=obj.genres.all(),
            is_active=True,
            year__range=(obj.year - 5, obj.year + 5)  # Похожие по году
        ).exclude(id=obj.id).distinct().order_by('-our_rating')[:8]
        
        return MovieListSerializer(similar_movies, many=True, context=self.context).data
    
    def get_reviews_stats(self, obj):
        reviews = obj.reviews.all()
        total_reviews = reviews.count()
        
        if total_reviews == 0:
            return {'total': 0, 'average_rating': 0, 'rating_distribution': {}}
        
        # Распределение оценок
        rating_distribution = {}
        for i in range(1, 11):
            rating_distribution[str(i)] = reviews.filter(rating=i).count()
        
        average_rating = sum(r.rating for r in reviews) / total_reviews
        
        return {
            'total': total_reviews,
            'average_rating': round(average_rating, 1),
            'rating_distribution': rating_distribution
        }


class ReviewDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    helpful_score = serializers.ReadOnlyField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'user_name', 'user_avatar', 'rating', 'title', 'comment',
            'is_spoiler', 'likes_count', 'dislikes_count', 'helpful_score',
            'is_verified', 'created_at', 'updated_at', 'user_vote'
        ]
        read_only_fields = ['user_name', 'user_avatar', 'helpful_score', 'created_at', 'updated_at']
    
    def get_user_avatar(self, obj):
        # Генерируем аватар на основе имени пользователя
        return f"https://ui-avatars.com/api/?name={obj.user.first_name}&background=e50914&color=fff"
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = ReviewLike.objects.get(user=request.user, review=obj)
                return vote.is_like
            except ReviewLike.DoesNotExist:
                pass
        return None


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment', 'is_spoiler']


class MovieRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieRating
        fields = ['rating']


class WatchHistorySerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    watch_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = WatchHistory
        fields = ['id', 'movie', 'progress', 'season', 'episode', 'watched_at', 'watch_percentage']
    
    def get_watch_percentage(self, obj):
        if obj.movie.duration and obj.progress:
            return min((obj.progress / (obj.movie.duration * 60)) * 100, 100)
        return 0


class FavoriteSerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'movie', 'created_at']


class WatchLaterSerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    
    class Meta:
        model = WatchLater
        fields = ['id', 'movie', 'created_at']


class MovieCollectionSerializer(serializers.ModelSerializer):
    movies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MovieCollection
        fields = ['id', 'name', 'description', 'poster_url', 'movies_count', 'created_at']
    
    def get_movies_count(self, obj):
        return obj.movies.filter(is_active=True).count()