# 🚀 Быстрый запуск Telegram Cinema

## ⚠️ ВАЖНО: Исправления перед запуском

Перед запуском нужно исправить несколько проблем в коде:

### 1. Обновить настройки Django:

В файле `backend/cinema/settings.py` добавь в конец:
```python
# Custom User Model
AUTH_USER_MODEL = 'users.User'

# CORS для локальной разработки
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
]
```

### 2. Создать миграции:
```bash
# После первого запуска контейнеров выполни:
docker-compose exec backend python manage.py makemigrations users
docker-compose exec backend python manage.py makemigrations movies
docker-compose exec backend python manage.py makemigrations telegram_auth
docker-compose exec backend python manage.py migrate
```

## 📋 Что нужно перед запуском

### 1. Установленное ПО:
- **Docker** и **Docker Compose**
- **Git**
- **Node.js 18+** (для локальной разработки)
- **Python 3.11+** (для локальной разработки)

### 2. Аккаунты и токены:
- **Telegram Bot Token** (получить у @BotFather)
- **TMDB API Key** (опционально, для метаданных фильмов)

## ⚡ Быстрый запуск через Docker

### 1. Клонируй репозиторий:
```bash
git clone https://github.com/YOUR_USERNAME/telegram-cinema-app.git
cd telegram-cinema-app
```

### 2. Настрой переменные окружения:
```bash
cp .env.example .env
```

Отредактируй `.env` файл:
```env
# Django
SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-very-long-and-random
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,cinema.horizonserver.space

# Database
DB_NAME=telegram_cinema
DB_USER=cinema_user
DB_PASSWORD=strong_password_here_change_this
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Telegram Bot (ОБЯЗАТЕЛЬНО заполни!)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_IDS=123456789,987654321

# TMDB API (опционально)
TMDB_API_KEY=your_tmdb_api_key_if_you_have_one

# Домен
DOMAIN=localhost
WEBAPP_URL=http://localhost:3000
```

### 3. Запусти все сервисы:
```bash
# Сборка и запуск всех контейнеров
docker-compose up -d --build

# Проверь статус (все должны быть Up)
docker-compose ps
```

### 4. Инициализируй базу данных:
```bash
# Создай миграции
docker-compose exec backend python manage.py makemigrations users
docker-compose exec backend python manage.py makemigrations movies  
docker-compose exec backend python manage.py makemigrations telegram_auth

# Примени миграции
docker-compose exec backend python manage.py migrate

# Создай суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузи тестовые данные
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json
```

### 5. Проверь что всё работает:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin панель**: http://localhost:8000/admin/
- **API документация**: http://localhost:8000/api/schema/swagger-ui/

## 🛠️ Локальная разработка (без Docker)

### Подготовка:
```bash
# Установи PostgreSQL и Redis локально
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib redis-server

# macOS:
brew install postgresql redis

# Windows: скачай с официальных сайтов
```

### Backend (Django):
```bash
cd backend

# Создай виртуальное окружение
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Установи зависимости
pip install -r requirements.txt

# Настрой переменные окружения
cp ../.env.example .env
# Отредактируй .env для локальной разработки

# Создай базу данных
sudo -u postgres createdb telegram_cinema
sudo -u postgres createuser cinema_user
sudo -u postgres psql -c "ALTER USER cinema_user PASSWORD 'cinema_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE telegram_cinema TO cinema_user;"

# Примени миграции
python manage.py makemigrations users movies telegram_auth
python manage.py migrate
python manage.py createsuperuser

# Запусти сервер
python manage.py runserver
```

### Frontend (React):
```bash
cd frontend

# Установи зависимости
npm install

# Запусти dev сервер
npm run dev
```

### Parser:
```bash
cd parser

# Создай виртуальное окружение
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Установи зависимости
pip install -r requirements.txt

# Запусти парсер
python main.py
```

### Telegram Bot:
```bash
cd telegram-bot

# Создай виртуальное окружение  
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Установи зависимости
pip install -r requirements.txt

# Настрой .env файл
cp .env.example .env
# Добавь свой TELEGRAM_BOT_TOKEN

# Запусти бота
python bot.py
```

## 🔧 Настройка Telegram Bot

### 1. Создай бота:
1. Найди @BotFather в Telegram
2. Отправь `/newbot`
3. Следуй инструкциям
4. Сохрани токен в `.env`

### 2. Настрой Web App:
```bash
# Замени YOUR_BOT_TOKEN на реальный токен
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{
  "menu_button": {
    "type": "web_app",
    "text": "🎬 Открыть кинотеатр",
    "web_app": {
      "url": "http://localhost:3000"
    }
  }
}'
```

### 3. Настрой команды бота:
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setMyCommands" \
-H "Content-Type: application/json" \
-d '{
  "commands": [
    {"command": "start", "description": "🎬 Запустить кинотеатр"},
    {"command": "help", "description": "❓ Помощь"},
    {"command": "stats", "description": "📊 Статистика"}
  ]
}'
```

## 📊 Мониторинг и логи

### Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f parser
docker-compose logs -f telegram-bot
```

### Статус контейнеров:
```bash
docker-compose ps
```

### Использование ресурсов:
```bash
docker stats
```

## 🗄️ Работа с базой данных

### Подключение к PostgreSQL:
```bash
docker-compose exec db psql -U cinema_user -d telegram_cinema
```

### Полезные SQL команды:
```sql
-- Посмотреть все таблицы
\dt

-- Посмотреть пользователей
SELECT * FROM users_user LIMIT 10;

-- Посмотреть фильмы
SELECT * FROM movies_movie LIMIT 10;

-- Выйти
\q
```

### Создание бэкапа:
```bash
docker-compose exec db pg_dump -U cinema_user telegram_cinema > backup.sql
```

### Восстановление из бэкапа:
```bash
docker-compose exec -T db psql -U cinema_user telegram_cinema < backup.sql
```

## 🔄 Обновление и перезапуск

### Перезапуск сервисов:
```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart backend
```

### Обновление кода:
```bash
# Получи обновления
git pull origin main

# Пересобери и перезапусти
docker-compose down
docker-compose up -d --build

# Примени новые миграции
docker-compose exec backend python manage.py migrate
```

## 🚨 Решение проблем

### Проблема: Контейнер backend не запускается
```bash
# Проверь логи
docker-compose logs backend

# Возможные причины:
# 1. Неправильные переменные в .env
# 2. База данных недоступна
# 3. Ошибки в коде

# Пересобери образ
docker-compose build backend --no-cache
```

### Проблема: База данных недоступна
```bash
# Проверь статус PostgreSQL
docker-compose exec db pg_isready -U cinema_user

# Перезапусти базу данных
docker-compose restart db

# Проверь логи базы данных
docker-compose logs db
```

### Проблема: Frontend не загружается
```bash
# Проверь логи
docker-compose logs frontend

# Очисти кэш npm
docker-compose exec frontend npm cache clean --force

# Переустанови зависимости
docker-compose exec frontend npm install
```

### Проблема: Telegram Bot не отвечает
```bash
# Проверь токен в .env файле
cat .env | grep TELEGRAM_BOT_TOKEN

# Проверь логи бота
docker-compose logs telegram-bot

# Перезапусти бота
docker-compose restart telegram-bot

# Проверь что бот активен
curl "https://api.telegram.org/botYOUR_TOKEN/getMe"
```

### Проблема: CORS ошибки
```bash
# Добавь в backend/cinema/settings.py:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Перезапусти backend
docker-compose restart backend
```

## 📱 Тестирование Telegram Mini App

### 1. Локальное тестирование с ngrok:
```bash
# Установи ngrok
npm install -g ngrok

# Создай HTTPS туннель
ngrok http 3000

# Скопируй HTTPS URL (например: https://abc123.ngrok.io)
```

### 2. Обнови URL в боте:
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{
  "menu_button": {
    "type": "web_app",
    "text": "🎬 Открыть кинотеатр",
    "web_app": {
      "url": "https://your-ngrok-url.ngrok.io"
    }
  }
}'
```

### 3. Тестируй в Telegram:
1. Найди своего бота в Telegram
2. Нажми `/start`
3. Нажми кнопку "🎬 Открыть кинотеатр"
4. Должно открыться твое приложение

## 🎯 Готовые команды для копирования

### Полный запуск с нуля:
```bash
# Клонирование и настройка
git clone https://github.com/YOUR_USERNAME/telegram-cinema-app.git
cd telegram-cinema-app
cp .env.example .env

# ⚠️ ОБЯЗАТЕЛЬНО отредактируй .env файл!
nano .env

# Запуск
docker-compose up -d --build

# Инициализация базы данных
docker-compose exec backend python manage.py makemigrations users movies telegram_auth
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json

# Проверка
docker-compose ps
echo "✅ Проверь http://localhost:3000"
```

### Ежедневная разработка:
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск после изменений
docker-compose restart backend frontend

# Просмотр логов
docker-compose logs -f backend
```

### Очистка и полный перезапуск:
```bash
# Остановка и удаление всех контейнеров
docker-compose down -v

# Удаление образов
docker-compose build --no-cache

# Полный перезапуск
docker-compose up -d --build
```

## ✅ Чек-лист готовности

Перед тем как считать что всё работает, проверь:

- [ ] **Docker контейнеры запущены**: `docker-compose ps` показывает все сервисы как "Up"
- [ ] **Backend доступен**: http://localhost:8000/api/ отвечает
- [ ] **Frontend доступен**: http://localhost:3000 загружается
- [ ] **База данных работает**: можешь зайти в админку http://localhost:8000/admin/
- [ ] **Telegram Bot отвечает**: `/start` в боте работает
- [ ] **Web App открывается**: кнопка в боте открывает твое приложение
- [ ] **API работает**: можешь создать пользователя и добавить фильм

## 🎉 Готово!

После выполнения всех шагов у тебя будет:
- ✅ **Работающий backend** на http://localhost:8000
- ✅ **Работающий frontend** на http://localhost:3000  
- ✅ **База данных PostgreSQL** с миграциями
- ✅ **Redis** для кэширования
- ✅ **Telegram Bot** готовый к работе
- ✅ **Parser** для автоматического добавления фильмов
- ✅ **Тестовые данные** с несколькими фильмами

**Нужна помощь? Проверь логи командой `docker-compose logs -f` и создай issue в репозитории!** 🤝