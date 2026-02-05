# Руководство по деплою Telegram Cinema

## Требования к серверу

### Минимальные требования
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Диск**: 50 GB SSD
- **ОС**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Сеть**: 100 Мбит/с

### Рекомендуемые требования
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Диск**: 100 GB NVMe SSD
- **ОС**: Ubuntu 22.04 LTS

## Подготовка сервера

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Docker и Docker Compose
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Настройка файрвола
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Деплой приложения

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd telegram-cinema
```

### 2. Настройка переменных окружения
```bash
cp .env.example .env
nano .env
```

Заполните файл `.env`:
```env
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=cinema.horizonserver.space

# Database
DB_NAME=telegram_cinema
DB_USER=cinema_user
DB_PASSWORD=strong-password-here
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-here

# TMDB API (опционально)
TMDB_API_KEY=your-tmdb-api-key

# Домен
DOMAIN=cinema.horizonserver.space
```

### 3. Настройка SSL сертификатов (для HTTPS)
```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата для вашего домена
sudo certbot certonly --standalone -d cinema.horizonserver.space

# Копирование сертификатов
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/cinema.horizonserver.space/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/cinema.horizonserver.space/privkey.pem ssl/key.pem
sudo chown -R $USER:$USER ssl/
```

### 4. Запуск приложения
```bash
# Сборка и запуск контейнеров
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 5. Инициализация базы данных
```bash
# Применение миграций
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузка начальных данных (опционально)
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json
```

## Настройка Telegram Bot

### 1. Создание бота
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота

### 2. Настройка Web App
```bash
# Установка команд бота
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands" \
-H "Content-Type: application/json" \
-d '{
  "commands": [
    {"command": "start", "description": "Запустить кинотеатр"},
    {"command": "help", "description": "Помощь"}
  ]
}'

# Настройка Web App URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{
  "menu_button": {
    "type": "web_app",
    "text": "🎬 Открыть кинотеатр",
    "web_app": {
      "url": "https://cinema.horizonserver.space"
    }
  }
}'
```

## Мониторинг и обслуживание

### 1. Мониторинг логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f parser
```

### 2. Резервное копирование
```bash
# Создание бэкапа базы данных
docker-compose exec db pg_dump -U cinema_user telegram_cinema > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker-compose exec -T db psql -U cinema_user telegram_cinema < backup_file.sql
```

### 3. Обновление приложения
```bash
# Получение обновлений
git pull origin main

# Пересборка и перезапуск
docker-compose down
docker-compose up -d --build

# Применение миграций
docker-compose exec backend python manage.py migrate
```

### 4. Автоматическое обновление SSL сертификатов
```bash
# Добавление в crontab
sudo crontab -e

# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

## Масштабирование

### 1. Горизонтальное масштабирование бэкенда
```yaml
# В docker-compose.yml
backend:
  deploy:
    replicas: 3
  # ... остальная конфигурация
```

### 2. Настройка балансировщика нагрузки
```nginx
# В nginx.conf
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}
```

### 3. Использование внешней базы данных
Для высоких нагрузок рекомендуется использовать управляемую базу данных (AWS RDS, Google Cloud SQL, etc.)

## Безопасность

### 1. Настройка файрвола
```bash
# Разрешить только необходимые порты
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 2. Регулярные обновления
```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Мониторинг безопасности
- Используйте fail2ban для защиты от брутфорса
- Настройте мониторинг логов
- Регулярно обновляйте Docker образы

## Производительность

### 1. Оптимизация базы данных
```sql
-- Создание индексов для частых запросов
CREATE INDEX idx_movies_year ON movies_movie(year);
CREATE INDEX idx_movies_rating ON movies_movie(kinopoisk_rating);
CREATE INDEX idx_movies_active ON movies_movie(is_active);
```

### 2. Кэширование
- Redis используется для кэширования API ответов
- Nginx кэширует статические файлы
- CDN для глобального кэширования (опционально)

### 3. Мониторинг производительности
```bash
# Установка мониторинга
docker run -d --name prometheus prom/prometheus
docker run -d --name grafana grafana/grafana
```

## Устранение неполадок

### Частые проблемы

1. **Контейнер не запускается**
   ```bash
   docker-compose logs service_name
   ```

2. **База данных недоступна**
   ```bash
   docker-compose exec db psql -U cinema_user -d telegram_cinema
   ```

3. **Проблемы с SSL**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

4. **Высокое потребление ресурсов**
   ```bash
   docker stats
   htop
   ```

## Поддержка

Для получения поддержки:
- Создайте issue в репозитории
- Проверьте логи приложения
- Убедитесь, что все переменные окружения настроены правильно