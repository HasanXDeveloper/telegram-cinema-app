import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayIcon, HeartIcon, BookmarkIcon, EyeIcon } from './icons'
import StarRating from './StarRating'

const MovieCard = ({ movie, size = 'medium', showStats = false }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(movie.is_favorite || false)
  const [inWatchLater, setInWatchLater] = useState(false)
  const navigate = useNavigate()

  const sizeClasses = {
    small: { 
      container: 'w-32 h-48', 
      poster: 'h-40',
      info: 'p-2',
      title: 'text-xs',
      meta: 'text-xs'
    },
    medium: { 
      container: 'w-40 h-60', 
      poster: 'h-48',
      info: 'p-3',
      title: 'text-sm',
      meta: 'text-xs'
    },
    large: { 
      container: 'w-48 h-72', 
      poster: 'h-56',
      info: 'p-3',
      title: 'text-base',
      meta: 'text-sm'
    }
  }

  const currentSize = sizeClasses[size]

  const handleClick = () => {
    navigate(`/movie/${movie.id}`)
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/movies/${movie.id}/favorite/`, { method: 'POST' })
      const data = await response.json()
      setIsFavorite(data.is_favorite)
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error)
    }
  }

  const handleWatchLater = async (e) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/movies/${movie.id}/watch-later/`, { method: 'POST' })
      const data = await response.json()
      setInWatchLater(data.in_watch_later)
    } catch (error) {
      console.error('Ошибка при добавлении в "Смотреть позже":', error)
    }
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    navigate(`/player/${movie.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`${currentSize.container} relative group cursor-pointer`}
      onClick={handleClick}
    >
      {/* Основная карточка */}
      <div className="bg-white dark:bg-kinopoisk-gray-800 rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
        {/* Постер */}
        <div className={`${currentSize.poster} relative overflow-hidden bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-700`}>
          <img
            src={movie.poster_url || '/placeholder-poster.jpg'}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            } group-hover:scale-105`}
            onLoad={() => setIsLoading(false)}
          />
          
          {/* Загрузка */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-kinopoisk-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Оверлей при наведении */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay}
                className="p-3 bg-kinopoisk-orange rounded-full hover:bg-kinopoisk-orange-dark transition-colors shadow-medium"
              >
                <PlayIcon size={20} className="text-white ml-0.5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className={`p-3 rounded-full transition-colors shadow-medium ${
                  isFavorite 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <HeartIcon size={18} className="text-white" filled={isFavorite} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchLater}
                className={`p-3 rounded-full transition-colors shadow-medium ${
                  inWatchLater 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <BookmarkIcon size={18} className="text-white" filled={inWatchLater} />
              </motion.button>
            </div>
          </div>

          {/* Рейтинг */}
          {movie.our_rating && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <StarRating 
                rating={movie.our_rating} 
                maxRating={10} 
                size="xs" 
                showValue={true}
                showText={false}
              />
            </div>
          )}

          {/* Год */}
          {movie.year && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-white text-xs font-medium">{movie.year}</span>
            </div>
          )}

          {/* Качество */}
          {movie.available_quality && (
            <div className="absolute bottom-2 right-2 bg-kinopoisk-orange rounded px-2 py-0.5">
              <span className="text-white text-xs font-bold uppercase">
                {movie.available_quality}
              </span>
            </div>
          )}

          {/* Прогресс просмотра */}
          {movie.watch_progress && movie.watch_progress.percentage > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div 
                className="h-full bg-kinopoisk-orange transition-all duration-300"
                style={{ width: `${Math.min(movie.watch_progress.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className={currentSize.info}>
          <h3 className={`${currentSize.title} font-semibold text-kinopoisk-gray-900 dark:text-white line-clamp-2 mb-1`}>
            {movie.title}
          </h3>
          
          {movie.genres && movie.genres.length > 0 && (
            <p className={`${currentSize.meta} text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 line-clamp-1 mb-1`}>
              {movie.genres.slice(0, 2).join(', ')}
            </p>
          )}

          {/* Дополнительная статистика */}
          {showStats && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700">
              <div className="flex items-center space-x-1">
                <EyeIcon size={12} className="text-kinopoisk-gray-500" />
                <span className="text-xs text-kinopoisk-gray-500">
                  {movie.views_count > 1000 
                    ? `${Math.floor(movie.views_count / 1000)}k` 
                    : movie.views_count}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <HeartIcon size={12} className="text-kinopoisk-gray-500" />
                <span className="text-xs text-kinopoisk-gray-500">
                  {movie.favorites_count}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MovieCard