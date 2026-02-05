import axios from 'axios'
import WebApp from '@twa-dev/sdk'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Создаем экземпляр axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем Telegram данные к каждому запросу
apiClient.interceptors.request.use((config) => {
  if (WebApp.initData) {
    config.headers['X-Telegram-Init-Data'] = WebApp.initData
  }
  return config
})

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    throw error
  }
)

export const api = {
  // Получение списка фильмов
  getMovies: async (category = 'popular', page = 1) => {
    const response = await apiClient.get('/movies/', {
      params: { category, page }
    })
    return response
  },

  // Получение конкретного фильма
  getMovie: async (id) => {
    const response = await apiClient.get(`/movies/${id}/`)
    return response
  },

  // Поиск фильмов
  searchMovies: async (query, page = 1) => {
    const response = await apiClient.get('/movies/search/', {
      params: { q: query, page }
    })
    return response
  },

  // Получение ссылок для просмотра
  getMovieStreams: async (id) => {
    const response = await apiClient.get(`/movies/${id}/streams/`)
    return response
  },

  // Пользовательские данные
  getUserProfile: async () => {
    const response = await apiClient.get('/user/profile/')
    return response
  },

  // Избранное
  toggleFavorite: async (movieId) => {
    const response = await apiClient.post(`/movies/${movieId}/favorite/`)
    return response
  },

  getFavorites: async () => {
    const response = await apiClient.get('/user/favorites/')
    return response
  },

  // История просмотров
  updateWatchHistory: async (movieId, progress) => {
    const response = await apiClient.post(`/movies/${movieId}/watch/`, {
      progress
    })
    return response
  },

  getWatchHistory: async () => {
    const response = await apiClient.get('/user/history/')
    return response
  },

  // Отзывы
  addReview: async (movieId, rating, comment) => {
    const response = await apiClient.post(`/movies/${movieId}/reviews/`, {
      rating,
      comment
    })
    return response
  },

  getReviews: async (movieId) => {
    const response = await apiClient.get(`/movies/${movieId}/reviews/`)
    return response
  }
}

export default apiClient