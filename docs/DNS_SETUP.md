# Настройка DNS для cinema.horizonserver.space

## Текущая ситуация
Домен `cinema.horizonserver.space` доступен для использования, но поддомены `api`, `www` и `chname` уже заняты.

## Рекомендуемая архитектура

### Вариант 1: Все на основном домене (рекомендуется)
```
https://cinema.horizonserver.space/          # Фронтенд (Mini App)
https://cinema.horizonserver.space/api/      # Backend API
https://cinema.horizonserver.space/admin-panel/  # Админ панель
```

**Преимущества:**
- Простая настройка DNS
- Один SSL сертификат
- Нет проблем с CORS
- Легче в обслуживании

### Вариант 2: Использование свободных поддоменов
```
https://cinema.horizonserver.space/          # Фронтенд
https://backend.cinema.horizonserver.space/  # Backend API
https://admin.cinema.horizonserver.space/    # Админ панель
```

## DNS записи

### Для варианта 1 (основной домен)
```
A    cinema.horizonserver.space    →  YOUR_SERVER_IP
```

### Для варианта 2 (с поддоменами)
```
A    cinema.horizonserver.space         →  YOUR_SERVER_IP
A    backend.cinema.horizonserver.space →  YOUR_SERVER_IP
A    admin.cinema.horizonserver.space   →  YOUR_SERVER_IP
```

## Настройка в панели управления доменом

1. Войдите в панель управления доменом `horizonserver.space`
2. Найдите раздел "DNS записи" или "DNS управление"
3. Добавьте A-записи согласно выбранному варианту
4. Укажите IP адрес вашего сервера

## Проверка настройки DNS

```bash
# Проверка основного домена
nslookup cinema.horizonserver.space

# Проверка поддоменов (если используете вариант 2)
nslookup backend.cinema.horizonserver.space
nslookup admin.cinema.horizonserver.space

# Проверка через dig
dig cinema.horizonserver.space A
```

## Время распространения DNS

- **Локально**: 5-15 минут
- **Глобально**: до 24-48 часов
- **Обычно**: 1-4 часа

## Получение SSL сертификата

После настройки DNS и распространения записей:

```bash
# Для основного домена
sudo certbot certonly --standalone -d cinema.horizonserver.space

# Для поддоменов (если используете)
sudo certbot certonly --standalone \
  -d cinema.horizonserver.space \
  -d backend.cinema.horizonserver.space \
  -d admin.cinema.horizonserver.space
```

## Проверка доступности

```bash
# Проверка HTTP
curl -I http://cinema.horizonserver.space

# Проверка HTTPS (после установки SSL)
curl -I https://cinema.horizonserver.space

# Проверка API
curl https://cinema.horizonserver.space/api/movies/
```

## Рекомендации

1. **Используйте вариант 1** (все на основном домене) - проще и надежнее
2. **Настройте автообновление SSL** сертификатов
3. **Добавьте мониторинг** доступности домена
4. **Настройте CDN** (Cloudflare) для лучшей производительности

## Troubleshooting

### Домен не резолвится
- Проверьте правильность DNS записей
- Подождите время распространения DNS
- Очистите DNS кэш: `sudo systemctl flush-dns`

### SSL сертификат не выдается
- Убедитесь, что домен резолвится на ваш сервер
- Проверьте, что порт 80 открыт
- Временно остановите nginx: `sudo systemctl stop nginx`

### CORS ошибки
- Проверьте настройки в nginx.conf
- Убедитесь, что домены совпадают в конфигурации