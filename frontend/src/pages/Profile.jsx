import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import WebApp from '@twa-dev/sdk'
import MovieCard from '../components/MovieCard'
import StarRating from '../components/StarRating'
import { 
  UserIcon, 
  HeartIcon, 
  ClockIcon, 
  StarIcon, 
  EyeIcon,
  ChevronRightIcon 
} from '../components/icons'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('favorites')
  const [favorites, setFavorites] = useState([])
  const [watchHistory, setWatchHistory] = useState([])
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalTime: 0,
    favoriteGenres: []
  })

  useEffect(() => {
    loadUserData()
    loadFavorites()
    loadWatchHistory()
    loadStats()
  }, [])

  const loadUserData = () => {
    // Получаем данные пользователя из Telegram
    const telegramUser = WebApp.initDataUnsafe?.user
    if (telegramUser) {
      setUser({
        id: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        photoUrl: telegramUser.photo_url,
        isPremium: telegramUser.is_premium
      })
    }
  }

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites/', {
        headers: {
          'X-Telegram-Init-Data': WebApp.initData
        }
      })
      const data = await response.json()
      setFavorites(data.results || data)
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
    }
  }

  const loadWatchHistory = async () => {
    try {
      const response = await fetch('/api/user/history/', {
        headers: {
          'X-Telegram-Init-Data': WebApp.initData
        }
      })
      const data = await response.json()
      setWatchHistory(data.results || data)
    } catch (error) {
      console.error('Ошибка загрузки истории:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/user/stats/', {
        headers: {
          'X-Telegram-Init-Data': WebApp.initData
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      // Заглушка для демо
      setStats({
        totalWatched: 42,
        totalTime: 2580, // в минутах
        favoriteGenres: ['Боевик', 'Комедия', 'Драма']
      })
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}ч ${mins}м`
  }

  const getProgressPercentage = (progress, duration) => {
    if (!duration) return 0
    return Math.min((progress / (duration * 60)) * 100, 100)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-telegram-hint">Загрузка профиля...</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Профиль пользователя */}
      <motion.div 
        className="bg-gradient-to-br from-kinopoisk-orange to-kinopoisk-orange-light rounded-2xl p-6 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <UserIcon size={32} />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              {user.username && (
                <p className="opacity-90">@{user.username}</p>
              )}
              {user.isPremium && (
                <div className="flex items-center space-x-1 mt-2">
                  <StarIcon size={16} filled className="text-kinopoisk-yellow" />
                  <span className="text-sm font-medium">Telegram Premium</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Статистика в профиле */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalWatched}</div>
              <div className="text-sm opacity-90">Просмотрено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(stats.totalTime)}</div>
              <div className="text-sm opacity-90">Время</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-sm opacity-90">Избранное</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Любимые жанры */}
      {stats.favoriteGenres.length > 0 && (
        <motion.div 
          className="bg-white dark:bg-kinopoisk-gray-800 rounded-2xl p-6 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-kinopoisk-gray-900 dark:text-white">Любимые жанры</h3>
            <ChevronRightIcon size={20} className="text-kinopoisk-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.map((genre, index) => (
              <motion.span
                key={genre}
                className="px-4 py-2 bg-kinopoisk-orange/10 text-kinopoisk-orange rounded-full text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {genre}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Табы */}
      <motion.div 
        className="flex space-x-1 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 rounded-2xl p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'favorites'
              ? 'bg-kinopoisk-orange text-white shadow-lg'
              : 'text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 hover:text-kinopoisk-orange'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HeartIcon size={18} filled={activeTab === 'favorites'} />
          <span>Избранное</span>
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-kinopoisk-orange text-white shadow-lg'
              : 'text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 hover:text-kinopoisk-orange'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ClockIcon size={18} />
          <span>История</span>
        </motion.button>
      </motion.div>

      {/* Контент табов */}
      <div>
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white">
                Избранные фильмы ({favorites.length})
              </h3>
            </div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {favorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MovieCard movie={favorite.movie} size="medium" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartIcon size={32} className="text-kinopoisk-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white mb-2">Нет избранных фильмов</h4>
                <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 max-w-md mx-auto">
                  Добавляйте фильмы в избранное, чтобы легко находить их позже
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white">
                История просмотров ({watchHistory.length})
              </h3>
            </div>
            {watchHistory.length > 0 ? (
              <div className="space-y-4">
                {watchHistory.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    className="bg-white dark:bg-kinopoisk-gray-800 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.movie.poster_url || '/placeholder-poster.jpg'}
                        alt={item.movie.title}
                        className="w-16 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-kinopoisk-gray-900 dark:text-white mb-1">{item.movie.title}</h4>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400">{item.movie.year}</span>
                          <StarRating rating={item.movie.rating} size="xs" showValue={false} />
                        </div>
                        
                        {/* Прогресс просмотра */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 mb-2">
                            <span>Просмотрено: {Math.floor(item.progress / 60)}:{(item.progress % 60).toString().padStart(2, '0')}</span>
                            <span>{getProgressPercentage(item.progress, item.movie.duration).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-kinopoisk-gray-200 dark:bg-kinopoisk-gray-700 rounded-full h-2">
                            <div
                              className="bg-kinopoisk-orange h-2 rounded-full transition-all"
                              style={{ width: `${getProgressPercentage(item.progress, item.movie.duration)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-kinopoisk-gray-500">
                            {new Date(item.watched_at).toLocaleDateString('ru-RU')}
                          </p>
                          <button className="text-kinopoisk-orange hover:text-kinopoisk-orange-dark text-sm font-medium">
                            Продолжить
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClockIcon size={32} className="text-kinopoisk-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white mb-2">История пуста</h4>
                <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 max-w-md mx-auto">
                  Начните смотреть фильмы, и они появятся здесь
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Настройки */}
      <motion.div 
        className="bg-white dark:bg-kinopoisk-gray-800 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700 rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-kinopoisk-gray-900 dark:text-white">Настройки</h3>
        
        {[
          { label: 'Уведомления', value: 'Включены', action: () => {} },
          { label: 'Качество по умолчанию', value: '720p', action: () => {} },
          { label: 'Автовоспроизведение', value: 'Включено', action: () => {} },
        ].map((setting, index) => (
          <motion.button 
            key={setting.label}
            className="w-full flex items-center justify-between py-3 text-kinopoisk-gray-900 dark:text-white hover:text-kinopoisk-orange transition-colors group"
            onClick={setting.action}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            whileHover={{ x: 5 }}
          >
            <span className="font-medium">{setting.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 text-sm">{setting.value}</span>
              <ChevronRightIcon size={16} className="text-kinopoisk-gray-400 group-hover:text-kinopoisk-orange transition-colors" />
            </div>
          </motion.button>
        ))}
        
        <hr className="border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700" />
        
        <motion.button 
          className="w-full flex items-center space-x-3 py-3 text-red-500 hover:text-red-600 transition-colors group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ x: 5 }}
        >
          <EyeIcon size={18} />
          <span className="font-medium">Выйти из аккаунта</span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Profile