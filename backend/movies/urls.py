from django.urls import path
from . import views

urlpatterns = [
    # Фильмы
    path('movies/', views.MovieListView.as_view(), name='movie-list'),
    path('movies/<int:pk>/', views.MovieDetailView.as_view(), name='movie-detail'),
    path('movies/<int:pk>/streams/', views.movie_streams, name='movie-streams'),
    path('movies/<int:pk>/favorite/', views.toggle_favorite, name='toggle-favorite'),
    path('movies/<int:pk>/rate/', views.rate_movie, name='rate-movie'),
    path('movies/<int:pk>/watch/', views.update_watch_progress, name='update-watch-progress'),
    path('movies/<int:pk>/watch-later/', views.add_to_watch_later, name='add-to-watch-later'),
    path('movies/<int:pk>/reviews/', views.MovieReviewListCreateView.as_view(), name='movie-reviews'),
    
    # Отзывы
    path('reviews/<int:review_id>/like/', views.like_review, name='like-review'),
    
    # Поиск
    path('movies/search/', views.SearchMoviesView.as_view(), name='search-movies'),
    
    # Жанры
    path('genres/', views.GenreListView.as_view(), name='genre-list'),
    
    # Коллекции
    path('collections/', views.MovieCollectionListView.as_view(), name='collection-list'),
    path('collections/<int:pk>/', views.movie_collection_detail, name='collection-detail'),
    
    # Пользовательские данные
    path('user/favorites/', views.UserFavoritesView.as_view(), name='user-favorites'),
    path('user/watch-later/', views.UserWatchLaterView.as_view(), name='user-watch-later'),
    path('user/history/', views.UserWatchHistoryView.as_view(), name='user-history'),
    path('user/recommendations/', views.user_recommendations, name='user-recommendations'),
    path('user/stats/', views.user_stats, name='user-stats'),
]