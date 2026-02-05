#!/usr/bin/env python
"""
Скрипт для создания миграций Django
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cinema.settings')
    django.setup()
    
    # Создаем миграции для всех приложений
    apps = ['users', 'movies', 'telegram_auth']
    
    for app in apps:
        print(f"Создание миграций для {app}...")
        execute_from_command_line(['manage.py', 'makemigrations', app])
    
    print("Все миграции созданы!")