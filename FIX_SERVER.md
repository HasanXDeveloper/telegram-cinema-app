# 🔧 Исправление проблем на сервере

## Проблемы:
1. ❌ Переменные "b" и "c" не установлены в .env
2. ❌ npm ci требует package-lock.json

## ✅ Решение:

### 1. Проверь и исправь .env файл:
```bash
# На сервере
cd ~/telegram-cinema-app

# Проверь содержимое .env
cat .env

# Если там есть строки типа "b=" или "c=" - удали их
# Отредактируй файл:
nano .env
```

### Правильный .env файл должен выглядеть так:
```env
# Django
SECRET_KEY=django-insecure-change-me-to-random-50-chars-string
DEBUG=False
ALLOWED_HOSTS=cinema.horizonserver.space,localhost,127.0.0.1

# Database
DB_NAME=telegram_cinema
DB_USER=cinema_user
DB_PASSWORD=cinema_pass
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_IDS=your_telegram_id

# TMDB API
TMDB_API_KEY=

# Домен
DOMAIN=cinema.horizonserver.space
WEBAPP_URL=https://cinema.horizonserver.space
```

**ВАЖНО:** Удали все строки с "b=" и "c=" если они есть!

### 2. Создай package-lock.json локально:
```bash
# У себя на компьютере (не на сервере!)
cd frontend
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

### 3. На сервере обнови код:
```bash
# На сервере
cd ~/telegram-cinema-app
git pull origin main

# Проверь что package-lock.json появился
ls -la frontend/ | grep package-lock
```

### 4. Пересобери контейнеры:
```bash
# Очисти старые образы
docker-compose down -v
docker system prune -af

# Пересобери
docker-compose up -d --build

# Проверь статус
docker-compose ps
```

### 5. Если всё равно ошибка с npm:
```bash
# Измени Dockerfile фронтенда на сервере
nano frontend/Dockerfile

# Замени строку:
# RUN npm ci --only=production
# На:
# RUN npm install --production

# Сохрани (Ctrl+O, Enter, Ctrl+X)

# Пересобери только фронтенд
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

## 🎯 Быстрое решение (если лень разбираться):

```bash
# На сервере выполни всё одной командой:
cd ~/telegram-cinema-app && \
git pull origin main && \
docker-compose down -v && \
docker system prune -af && \
sed -i 's/npm ci --only=production/npm install --production/g' frontend/Dockerfile && \
docker-compose up -d --build
```

## 📊 Проверка после запуска:

```bash
# Проверь что все контейнеры запущены
docker-compose ps

# Должно быть примерно так:
# NAME                    STATUS
# telegram-cinema-app-db-1              Up
# telegram-cinema-app-redis-1           Up
# telegram-cinema-app-backend-1         Up
# telegram-cinema-app-frontend-1        Up
# telegram-cinema-app-nginx-1           Up
# telegram-cinema-app-parser-1          Up
# telegram-cinema-app-telegram-bot-1    Up

# Проверь логи
docker-compose logs frontend
docker-compose logs backend
```

## 🚨 Если контейнер не запускается:

```bash
# Посмотри логи конкретного сервиса
docker-compose logs frontend
docker-compose logs backend

# Перезапусти конкретный сервис
docker-compose restart frontend
```

## ✅ После успешного запуска:

```bash
# Создай миграции базы данных
docker-compose exec backend python manage.py makemigrations users
docker-compose exec backend python manage.py makemigrations movies
docker-compose exec backend python manage.py makemigrations telegram_auth
docker-compose exec backend python manage.py migrate

# Создай суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузи тестовые данные
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json
```

## 🎉 Готово!

Проверь в браузере:
- https://cinema.horizonserver.space
- https://cinema.horizonserver.space/admin/
- https://cinema.horizonserver.space/api/