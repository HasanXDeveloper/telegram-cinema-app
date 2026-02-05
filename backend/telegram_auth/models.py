from django.db import models
from django.contrib.auth.models import User


class TelegramUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='telegram_profile')
    telegram_id = models.BigIntegerField(unique=True, verbose_name='Telegram ID')
    username = models.CharField(max_length=255, blank=True, verbose_name='Username')
    language_code = models.CharField(max_length=10, default='ru', verbose_name='Язык')
    is_premium = models.BooleanField(default=False, verbose_name='Telegram Premium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"@{self.username or self.telegram_id} ({self.user.get_full_name()})"
    
    class Meta:
        verbose_name = 'Telegram пользователь'
        verbose_name_plural = 'Telegram пользователи'