import hashlib
import hmac
import json
from urllib.parse import unquote
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class TelegramAuthentication(BaseAuthentication):
    """
    Аутентификация через Telegram Web App initData
    """
    
    def authenticate(self, request):
        init_data = request.META.get('HTTP_X_TELEGRAM_INIT_DATA')
        if not init_data:
            return None
        
        try:
            user_data = self.validate_telegram_data(init_data)
            user = self.get_or_create_user(user_data)
            return (user, None)
        except Exception as e:
            raise AuthenticationFailed(f'Ошибка аутентификации Telegram: {str(e)}')
    
    def validate_telegram_data(self, init_data):
        """
        Валидация данных от Telegram Web App
        """
        if not settings.TELEGRAM_BOT_TOKEN:
            raise AuthenticationFailed('Telegram Bot Token не настроен')
        
        # Парсим данные
        data_pairs = []
        user_data = None
        
        for item in init_data.split('&'):
            key, value = item.split('=', 1)
            if key == 'user':
                user_data = json.loads(unquote(value))
            elif key != 'hash':
                data_pairs.append(f"{key}={value}")
        
        if not user_data:
            raise AuthenticationFailed('Данные пользователя не найдены')
        
        # Проверяем подпись
        data_pairs.sort()
        data_check_string = '\n'.join(data_pairs)
        
        secret_key = hmac.new(
            settings.TELEGRAM_BOT_TOKEN.encode(),
            b"WebAppData",
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Извлекаем hash из исходных данных
        received_hash = None
        for item in init_data.split('&'):
            if item.startswith('hash='):
                received_hash = item.split('=', 1)[1]
                break
        
        if not received_hash or calculated_hash != received_hash:
            raise AuthenticationFailed('Неверная подпись данных')
        
        return user_data
    
    def get_or_create_user(self, user_data):
        """
        Создание или получение пользователя на основе Telegram данных
        """
        telegram_id = user_data['id']
        
        try:
            # Ищем пользователя по Telegram ID
            user = User.objects.get(username=f"tg_{telegram_id}")
        except User.DoesNotExist:
            # Создаем нового пользователя
            user = User.objects.create_user(
                username=f"tg_{telegram_id}",
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
            )
            
            # Сохраняем дополнительные данные Telegram
            from .models import TelegramUser
            TelegramUser.objects.create(
                user=user,
                telegram_id=telegram_id,
                username=user_data.get('username', ''),
                language_code=user_data.get('language_code', 'ru'),
                is_premium=user_data.get('is_premium', False),
            )
        
        return user