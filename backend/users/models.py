from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Расширенная модель пользователя для Telegram интеграции"""
    
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True)
    telegram_username = models.CharField(max_length=255, null=True, blank=True)
    telegram_first_name = models.CharField(max_length=255, null=True, blank=True)
    telegram_last_name = models.CharField(max_length=255, null=True, blank=True)
    telegram_photo_url = models.URLField(null=True, blank=True)
    telegram_is_premium = models.BooleanField(default=False)
    
    # Пользовательские настройки
    preferred_quality = models.CharField(
        max_length=10,
        choices=[
            ('360p', '360p'),
            ('480p', '480p'),
            ('720p', '720p'),
            ('1080p', '1080p'),
        ],
        default='720p'
    )
    
    auto_play = models.BooleanField(default=True)
    notifications_enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_user'
    
    def __str__(self):
        return f"{self.username} ({self.telegram_id})"


class UserWatchHistory(models.Model):
    """История просмотров пользователя"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history')
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE)
    progress = models.PositiveIntegerField(default=0)  # Прогресс в секундах
    watched_at = models.DateTimeField(auto_now=True)
    completed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'users_watch_history'
        unique_together = ['user', 'movie']
        ordering = ['-watched_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"


class UserFavorite(models.Model):
    """Избранные фильмы пользователя"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users_favorites'
        unique_together = ['user', 'movie']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"