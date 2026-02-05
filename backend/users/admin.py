from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserWatchHistory, UserFavorite


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'telegram_id', 'telegram_username', 'telegram_first_name', 'is_active', 'created_at')
    list_filter = ('is_active', 'telegram_is_premium', 'created_at')
    search_fields = ('username', 'telegram_username', 'telegram_first_name', 'telegram_id')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Telegram Info', {
            'fields': ('telegram_id', 'telegram_username', 'telegram_first_name', 
                      'telegram_last_name', 'telegram_photo_url', 'telegram_is_premium')
        }),
        ('Preferences', {
            'fields': ('preferred_quality', 'auto_play', 'notifications_enabled')
        }),
    )


@admin.register(UserWatchHistory)
class UserWatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'progress', 'completed', 'watched_at')
    list_filter = ('completed', 'watched_at')
    search_fields = ('user__username', 'movie__title')
    raw_id_fields = ('user', 'movie')


@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__username', 'movie__title')
    raw_id_fields = ('user', 'movie')