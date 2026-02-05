from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Жанр'
        verbose_name_plural = 'Жанры'


class Movie(models.Model):
    MOVIE_TYPES = [
        ('movie', 'Фильм'),
        ('series', 'Сериал'),
        ('anime', 'Аниме'),
        ('documentary', 'Документальный'),
        ('cartoon', 'Мультфильм'),
        ('show', 'Шоу'),
    ]
    
    QUALITY_CHOICES = [
        ('cam', 'CAMRip'),
        ('ts', 'TS'),
        ('dvd', 'DVDRip'),
        ('hd', 'HDRip'),
        ('fullhd', 'Full HD'),
        ('4k', '4K UHD'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Название')
    original_title = models.CharField(max_length=255, blank=True, verbose_name='Оригинальное название')
    description = models.TextField(blank=True, verbose_name='Описание')
    short_description = models.CharField(max_length=500, blank=True, verbose_name='Краткое описание')
    year = models.PositiveIntegerField(verbose_name='Год выпуска')
    duration = models.PositiveIntegerField(null=True, blank=True, verbose_name='Длительность (мин)')
    
    movie_type = models.CharField(max_length=20, choices=MOVIE_TYPES, default='movie', verbose_name='Тип')
    genres = models.ManyToManyField(Genre, blank=True, verbose_name='Жанры')
    
    # Рейтинги
    imdb_rating = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(10)])
    kinopoisk_rating = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(10)])
    our_rating = models.FloatField(null=True, blank=True, verbose_name='Наш рейтинг')
    ratings_count = models.PositiveIntegerField(default=0, verbose_name='Количество оценок')
    
    # Изображения
    poster_url = models.URLField(blank=True, verbose_name='Постер')
    backdrop_url = models.URLField(blank=True, verbose_name='Фон')
    trailer_url = models.URLField(blank=True, verbose_name='Трейлер')
    
    # Метаданные
    director = models.CharField(max_length=255, blank=True, verbose_name='Режиссер')
    cast = models.JSONField(default=list, blank=True, verbose_name='Актеры')
    countries = models.JSONField(default=list, blank=True, verbose_name='Страны')
    studios = models.JSONField(default=list, blank=True, verbose_name='Студии')
    
    # Дополнительная информация
    age_rating = models.CharField(max_length=10, blank=True, verbose_name='Возрастной рейтинг')
    budget = models.BigIntegerField(null=True, blank=True, verbose_name='Бюджет')
    box_office = models.BigIntegerField(null=True, blank=True, verbose_name='Сборы')
    awards = models.JSONField(default=list, blank=True, verbose_name='Награды')
    
    # Качество и доступность
    available_quality = models.CharField(max_length=20, choices=QUALITY_CHOICES, default='hd', verbose_name='Доступное качество')
    has_subtitles = models.BooleanField(default=False, verbose_name='Есть субтитры')
    subtitle_languages = models.JSONField(default=list, blank=True, verbose_name='Языки субтитров')
    audio_languages = models.JSONField(default=list, blank=True, verbose_name='Языки озвучки')
    
    # Внешние ID
    tmdb_id = models.PositiveIntegerField(null=True, blank=True, unique=True)
    kinopoisk_id = models.PositiveIntegerField(null=True, blank=True, unique=True)
    imdb_id = models.CharField(max_length=20, blank=True, verbose_name='IMDB ID')
    
    # Статистика
    views_count = models.PositiveIntegerField(default=0, verbose_name='Количество просмотров')
    favorites_count = models.PositiveIntegerField(default=0, verbose_name='Добавлений в избранное')
    
    # Системные поля
    is_featured = models.BooleanField(default=False, verbose_name='Рекомендуемый')
    is_active = models.BooleanField(default=True, verbose_name='Активный')
    is_premium = models.BooleanField(default=False, verbose_name='Премиум контент')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} ({self.year})"
    
    @property
    def rating(self):
        """Возвращает лучший доступный рейтинг"""
        if self.our_rating:
            return self.our_rating
        return self.kinopoisk_rating or self.imdb_rating
    
    @property
    def average_user_rating(self):
        """Средний рейтинг пользователей"""
        ratings = self.user_ratings.all()
        if ratings:
            return sum(r.rating for r in ratings) / len(ratings)
        return None
    
    def update_our_rating(self):
        """Обновляет наш рейтинг на основе пользовательских оценок"""
        user_ratings = self.user_ratings.all()
        if user_ratings.count() >= 5:  # Минимум 5 оценок
            avg_rating = sum(r.rating for r in user_ratings) / user_ratings.count()
            self.our_rating = round(avg_rating, 1)
            self.ratings_count = user_ratings.count()
            self.save(update_fields=['our_rating', 'ratings_count'])
    
    def increment_views(self):
        """Увеличить счетчик просмотров"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    class Meta:
        verbose_name = 'Фильм'
        verbose_name_plural = 'Фильмы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['year']),
            models.Index(fields=['our_rating']),
            models.Index(fields=['views_count']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['movie_type']),
        ]


class MovieStream(models.Model):
    QUALITY_CHOICES = [
        ('360p', '360p'),
        ('480p', '480p'),
        ('720p', '720p'),
        ('1080p', '1080p'),
        ('4K', '4K'),
    ]
    
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='streams')
    url = models.URLField(verbose_name='Ссылка на видео')
    quality = models.CharField(max_length=10, choices=QUALITY_CHOICES, verbose_name='Качество')
    is_active = models.BooleanField(default=True, verbose_name='Активная')
    priority = models.PositiveIntegerField(default=0, verbose_name='Приоритет')
    
    # Для сериалов
    season = models.PositiveIntegerField(null=True, blank=True, verbose_name='Сезон')
    episode = models.PositiveIntegerField(null=True, blank=True, verbose_name='Эпизод')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.season and self.episode:
            return f"{self.movie.title} S{self.season}E{self.episode} ({self.quality})"
        return f"{self.movie.title} ({self.quality})"
    
    class Meta:
        verbose_name = 'Поток'
        verbose_name_plural = 'Потоки'
        ordering = ['-priority', 'quality']


class UserFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'


class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    progress = models.PositiveIntegerField(default=0, verbose_name='Прогресс (секунды)')
    season = models.PositiveIntegerField(null=True, blank=True)
    episode = models.PositiveIntegerField(null=True, blank=True)
    watched_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'movie', 'season', 'episode']
        verbose_name = 'История просмотров'
        verbose_name_plural = 'История просмотров'
        ordering = ['-watched_at']


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    title = models.CharField(max_length=200, verbose_name='Заголовок отзыва')
    comment = models.TextField(verbose_name='Текст отзыва')
    is_spoiler = models.BooleanField(default=False, verbose_name='Содержит спойлеры')
    likes_count = models.PositiveIntegerField(default=0, verbose_name='Лайки')
    dislikes_count = models.PositiveIntegerField(default=0, verbose_name='Дизлайки')
    is_verified = models.BooleanField(default=False, verbose_name='Проверенный отзыв')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name}: {self.title} ({self.rating}/10)"
    
    @property
    def helpful_score(self):
        """Полезность отзыва"""
        total_votes = self.likes_count + self.dislikes_count
        if total_votes == 0:
            return 0
        return (self.likes_count / total_votes) * 100
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']


class ReviewLike(models.Model):
    """Лайки/дизлайки отзывов"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='votes')
    is_like = models.BooleanField()  # True = лайк, False = дизлайк
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'review']
        verbose_name = 'Оценка отзыва'
        verbose_name_plural = 'Оценки отзывов'


class MovieRating(models.Model):
    """Отдельная модель для рейтингов (без обязательного отзыва)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='user_ratings')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Рейтинг пользователя'
        verbose_name_plural = 'Рейтинги пользователей'


class WatchLater(models.Model):
    """Список "Смотреть позже" """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Смотреть позже'
        verbose_name_plural = 'Смотреть позже'
        ordering = ['-created_at']


class MovieCollection(models.Model):
    """Коллекции фильмов"""
    name = models.CharField(max_length=200, verbose_name='Название коллекции')
    description = models.TextField(blank=True, verbose_name='Описание')
    movies = models.ManyToManyField(Movie, blank=True, verbose_name='Фильмы')
    is_featured = models.BooleanField(default=False, verbose_name='Рекомендуемая')
    poster_url = models.URLField(blank=True, verbose_name='Постер коллекции')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Коллекция'
        verbose_name_plural = 'Коллекции'
        ordering = ['-created_at']


class UserMovieStatus(models.Model):
    """Статус просмотра фильма пользователем"""
    STATUS_CHOICES = [
        ('want_to_watch', 'Хочу посмотреть'),
        ('watching', 'Смотрю'),
        ('watched', 'Просмотрено'),
        ('dropped', 'Брошено'),
        ('on_hold', 'Отложено'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Статус просмотра'
        verbose_name_plural = 'Статусы просмотра'


class MovieRecommendation(models.Model):
    """Персональные рекомендации"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    score = models.FloatField(verbose_name='Оценка рекомендации')
    reason = models.CharField(max_length=200, verbose_name='Причина рекомендации')
    created_at = models.DateTimeField(auto_now_add=True)
    is_shown = models.BooleanField(default=False, verbose_name='Показано пользователю')
    
    class Meta:
        unique_together = ['user', 'movie']
        verbose_name = 'Рекомендация'
        verbose_name_plural = 'Рекомендации'
        ordering = ['-score', '-created_at']