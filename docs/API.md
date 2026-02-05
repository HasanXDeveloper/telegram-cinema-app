# API Документация - Telegram Cinema

## Базовый URL
```
https://your-domain.com/api/
```

## Аутентификация

Все запросы требуют заголовок с данными Telegram Web App:
```
X-Telegram-Init-Data: <telegram_init_data>
```

## Эндпоинты

### Фильмы

#### GET /movies/
Получение списка фильмов

**Параметры:**
- `category` (optional): featured, new, popular
- `page` (optional): номер страницы
- `movie_type` (optional): movie, series, anime, documentary
- `search` (optional): поисковый запрос

**Ответ:**
```json
{
  "count": 100,
  "next": "https://api.example.com/movies/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Название фильма",
      "year": 2023,
      "poster_url": "https://example.com/poster.jpg",
      "backdrop_url": "https://example.com/backdrop.jpg",
      "movie_type": "movie",
      "genres": ["Боевик", "Драма"],
      "rating": 8.5,
      "is_favorite": false
    }
  ]
}
```

#### GET /movies/{id}/
Получение детальной информации о фильме

**Ответ:**
```json
{
  "id": 1,
  "title": "Название фильма",
  "original_title": "Original Title",
  "description": "Описание фильма...",
  "year": 2023,
  "duration": 120,
  "movie_type": "movie",
  "genres": [
    {"id": 1, "name": "Боевик", "slug": "action"}
  ],
  "imdb_rating": 8.2,
  "kinopoisk_rating": 8.5,
  "rating": 8.5,
  "poster_url": "https://example.com/poster.jpg",
  "backdrop_url": "https://example.com/backdrop.jpg",
  "director": "Режиссер",
  "cast": ["Актер 1", "Актер 2"],
  "countries": ["США", "Великобритания"],
  "streams": [
    {
      "id": 1,
      "url": "https://example.com/stream.m3u8",
      "quality": "720p",
      "season": null,
      "episode": null,
      "priority": 1
    }
  ],
  "is_favorite": false,
  "user_rating": null,
  "similar": [...]
}
```

#### GET /movies/{id}/streams/
Получение ссылок для просмотра

**Ответ:**
```json
{
  "movie": {
    "720p": "https://example.com/720p.m3u8",
    "1080p": "https://example.com/1080p.m3u8"
  }
}
```

#### POST /movies/{id}/favorite/
Добавить/удалить из избранного

**Ответ:**
```json
{
  "is_favorite": true
}
```

#### POST /movies/{id}/watch/
Обновить прогресс просмотра

**Тело запроса:**
```json
{
  "progress": 1800,
  "season": 1,
  "episode": 5
}
```

**Ответ:**
```json
{
  "success": true
}
```

#### GET /movies/{id}/reviews/
Получение отзывов о фильме

#### POST /movies/{id}/reviews/
Добавление отзыва

**Тело запроса:**
```json
{
  "rating": 5,
  "comment": "Отличный фильм!"
}
```

### Поиск

#### GET /movies/search/
Поиск фильмов

**Параметры:**
- `q`: поисковый запрос (обязательный)
- `page`: номер страницы

### Жанры

#### GET /genres/
Получение списка жанров

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Боевик",
    "slug": "action"
  }
]
```

### Пользователь

#### GET /user/favorites/
Получение избранных фильмов пользователя

#### GET /user/history/
Получение истории просмотров

**Ответ:**
```json
[
  {
    "id": 1,
    "movie": {...},
    "progress": 1800,
    "season": null,
    "episode": null,
    "watched_at": "2023-12-01T10:00:00Z"
  }
]
```

#### GET /user/recommendations/
Получение персональных рекомендаций

## Коды ошибок

- `400 Bad Request` - Неверные параметры запроса
- `401 Unauthorized` - Отсутствует или неверная аутентификация
- `403 Forbidden` - Недостаточно прав
- `404 Not Found` - Ресурс не найден
- `429 Too Many Requests` - Превышен лимит запросов
- `500 Internal Server Error` - Внутренняя ошибка сервера

## Лимиты

- Максимум 1000 запросов в час на пользователя
- Максимум 20 элементов на страницу (по умолчанию)
- Максимальная длина поискового запроса: 100 символов

## Примеры использования

### JavaScript (Fetch API)
```javascript
// Получение списка новинок
const response = await fetch('/api/movies/?category=new', {
  headers: {
    'X-Telegram-Init-Data': window.Telegram.WebApp.initData
  }
});
const movies = await response.json();

// Поиск фильмов
const searchResponse = await fetch('/api/movies/search/?q=Мстители', {
  headers: {
    'X-Telegram-Init-Data': window.Telegram.WebApp.initData
  }
});
const searchResults = await searchResponse.json();

// Добавление в избранное
await fetch('/api/movies/123/favorite/', {
  method: 'POST',
  headers: {
    'X-Telegram-Init-Data': window.Telegram.WebApp.initData
  }
});
```

### Python (requests)
```python
import requests

headers = {
    'X-Telegram-Init-Data': telegram_init_data
}

# Получение фильма
response = requests.get('https://api.example.com/movies/123/', headers=headers)
movie = response.json()

# Обновление прогресса
requests.post('https://api.example.com/movies/123/watch/', 
              json={'progress': 1800}, 
              headers=headers)
```