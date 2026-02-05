import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Heart, Share, Star, Clock, Calendar, Plus, ThumbsUp, ThumbsDown, Flag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMovie } from '../hooks/useMovie'
import MovieCard from '../components/MovieCard'
import ReviewCard from '../components/ReviewCard'
import RatingModal from '../components/RatingModal'
import ReviewModal from '../components/ReviewModal'

const Movie = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: movie, isLoading } = useMovie(id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [inWatchLater, setInWatchLater] = useState(false)
  const [userRating, setUserRating] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (movie) {
      setIsFavorite(movie.is_favorite)
      setInWatchLater(movie.in_watch_later)
      setUserRating(movie.user_rating)
      loadReviews()
    }
  }, [movie])

  const loadReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await fetch(`/api/movies/${id}/reviews/`)
      const data = await response.json()
      setReviews(data.results || data)
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-telegram-secondary-bg"></div>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-telegram-secondary-bg rounded"></div>
          <div className="h-4 bg-telegram-secondary-bg rounded w-3/4"></div>
          <div className="h-20 bg-telegram-secondary-bg rounded"></div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-telegram-hint">Фильм не найден</p>
      </div>
    )
  }

  const handlePlay = () => {
    navigate(`/player/${id}`)
  }

  const handleFavorite = async () => {
    try {
      const response = await fetch(`/api/movies/${id}/favorite/`, { method: 'POST' })
      const data = await response.json()
      setIsFavorite(data.is_favorite)
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error)
    }
  }

  const handleWatchLater = async () => {
    try {
      const response = await fetch(`/api/movies/${id}/watch-later/`, { method: 'POST' })
      const data = await response.json()
      setInWatchLater(data.in_watch_later)
    } catch (error) {
      console.error('Ошибка при добавлении в "Смотреть позже":', error)
    }
  }

  const handleRating = async (rating) => {
    try {
      const response = await fetch(`/api/movies/${id}/rate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })
      const data = await response.json()
      setUserRating(data.rating)
      setShowRatingModal(false)
    } catch (error) {
      console.error('Ошибка при оценке фильма:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.description,
        url: window.location.href,
      })
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}ч ${mins}м`
  }

  const formatBudget = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return `$${amount?.toLocaleString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-6"
    >
      {/* Баннер */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Кнопки действий */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 bg-cinema-primary px-6 py-3 rounded-lg font-medium text-white hover:bg-cinema-primary/80 transition-colors"
            >
              <Play size={20} fill="white" />
              <span>Смотреть</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite ? 'bg-red-500' : 'bg-white/20'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'white' : 'none'} />
              </button>
              
              <button
                onClick={handleWatchLater}
                className={`p-3 rounded-full transition-colors ${
                  inWatchLater ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <Plus size={20} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Share size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            {movie.title}
          </h1>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="text-telegram-hint text-sm mb-2">
              {movie.original_title}
            </p>
          )}
        </div>

        {/* Рейтинги и метаданные */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {movie.our_rating && (
            <div className="flex items-center space-x-1 bg-cinema-primary/20 px-3 py-1 rounded-full">
              <Star size={16} fill="gold" />
              <span className="font-medium">{movie.our_rating}</span>
              <span className="text-telegram-hint">({movie.ratings_count})</span>
            </div>
          )}
          
          {movie.year && (
            <div className="flex items-center space-x-1 text-telegram-hint">
              <Calendar size={16} />
              <span>{movie.year}</span>
            </div>
          )}
          
          {movie.duration && (
            <div className="flex items-center space-x-1 text-telegram-hint">
              <Clock size={16} />
              <span>{formatDuration(movie.duration)}</span>
            </div>
          )}
          
          {movie.age_rating && (
            <span className="bg-telegram-secondary-bg px-2 py-1 rounded text-xs font-medium">
              {movie.age_rating}
            </span>
          )}
        </div>

        {/* Пользовательские действия */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRatingModal(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              userRating 
                ? 'bg-cinema-primary text-white border-cinema-primary' 
                : 'border-telegram-hint text-telegram-text hover:border-cinema-primary'
            }`}
          >
            <Star size={16} fill={userRating ? 'white' : 'none'} />
            <span>{userRating ? `Ваша оценка: ${userRating}` : 'Оценить'}</span>
          </button>
          
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-telegram-hint text-telegram-text hover:border-cinema-primary transition-colors"
          >
            <span>Написать отзыв</span>
          </button>
        </div>

        {/* Жанры */}
        {movie.genres && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-telegram-secondary-bg rounded-full text-sm text-telegram-text"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Табы */}
      <div className="px-4">
        <div className="flex space-x-1 bg-telegram-secondary-bg rounded-lg p-1 mb-4">
          {[
            { id: 'info', label: 'Информация' },
            { id: 'reviews', label: `Отзывы (${movie.reviews_stats?.total || 0})` },
            { id: 'similar', label: 'Похожие' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cinema-primary text-white'
                  : 'text-telegram-hint hover:text-telegram-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Контент табов */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Описание */}
            {movie.description && (
              <div>
                <h3 className="font-semibold text-telegram-text mb-2">Описание</h3>
                <p className="text-telegram-text leading-relaxed">
                  {movie.description}
                </p>
              </div>
            )}

            {/* Детали */}
            <div className="grid grid-cols-1 gap-4">
              {movie.director && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">Режиссер</h4>
                  <p className="text-telegram-hint">{movie.director}</p>
                </div>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">В ролях</h4>
                  <p className="text-telegram-hint">
                    {movie.cast.slice(0, 5).join(', ')}
                  </p>
                </div>
              )}
              
              {movie.countries && movie.countries.length > 0 && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">Страна</h4>
                  <p className="text-telegram-hint">{movie.countries.join(', ')}</p>
                </div>
              )}
              
              {movie.studios && movie.studios.length > 0 && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">Студия</h4>
                  <p className="text-telegram-hint">{movie.studios.join(', ')}</p>
                </div>
              )}
              
              {movie.budget && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">Бюджет</h4>
                  <p className="text-telegram-hint">{formatBudget(movie.budget)}</p>
                </div>
              )}
              
              {movie.box_office && (
                <div>
                  <h4 className="font-medium text-telegram-text mb-1">Сборы</h4>
                  <p className="text-telegram-hint">{formatBudget(movie.box_office)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Статистика отзывов */}
            {movie.reviews_stats && movie.reviews_stats.total > 0 && (
              <div className="bg-telegram-secondary-bg rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-telegram-text">Средняя оценка</h4>
                  <div className="flex items-center space-x-2">
                    <Star size={20} fill="gold" />
                    <span className="text-xl font-bold">{movie.reviews_stats.average_rating}</span>
                    <span className="text-telegram-hint">из 10</span>
                  </div>
                </div>
                
                {/* Распределение оценок */}
                <div className="space-y-1">
                  {Object.entries(movie.reviews_stats.rating_distribution)
                    .reverse()
                    .map(([rating, count]) => (
                      <div key={rating} className="flex items-center space-x-2 text-sm">
                        <span className="w-6">{rating}</span>
                        <div className="flex-1 bg-telegram-hint/20 rounded-full h-2">
                          <div
                            className="bg-cinema-primary h-2 rounded-full"
                            style={{
                              width: `${(count / movie.reviews_stats.total) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="w-8 text-telegram-hint">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Список отзывов */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-telegram-secondary-bg rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-telegram-hint/20 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-telegram-hint/20 rounded w-full mb-1"></div>
                    <div className="h-3 bg-telegram-hint/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-telegram-hint mb-4">Пока нет отзывов</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-cinema-primary text-white px-6 py-2 rounded-lg hover:bg-cinema-primary/80 transition-colors"
                >
                  Написать первый отзыв
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'similar' && (
          <div>
            {movie.similar && movie.similar.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {movie.similar.map((similarMovie) => (
                  <MovieCard key={similarMovie.id} movie={similarMovie} size="small" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-telegram-hint">Похожие фильмы не найдены</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showRatingModal && (
        <RatingModal
          currentRating={userRating}
          onRate={handleRating}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          movieId={id}
          currentRating={userRating}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            setShowReviewModal(false)
            loadReviews()
          }}
        />
      )}
    </motion.div>
  )
}

export default Movie