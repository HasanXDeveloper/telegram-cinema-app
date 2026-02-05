import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon, MoreIcon } from './icons'
import StarRating from './StarRating'

const ReviewCard = ({ review }) => {
  const [userVote, setUserVote] = useState(review.user_vote)
  const [likesCount, setLikesCount] = useState(review.likes_count)
  const [dislikesCount, setDislikesCount] = useState(review.dislikes_count)
  const [showFullText, setShowFullText] = useState(false)

  const handleVote = async (isLike) => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/like/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_like: isLike })
      })
      
      if (response.ok) {
        const data = await response.json()
        setLikesCount(data.likes_count)
        setDislikesCount(data.dislikes_count)
        setUserVote(data.user_vote)
      }
    } catch (error) {
      console.error('Ошибка при голосовании:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const shouldTruncate = review.comment.length > 300
  const displayText = showFullText || !shouldTruncate 
    ? review.comment 
    : review.comment.substring(0, 300) + '...'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-kinopoisk-gray-800 rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300"
    >
      {/* Заголовок отзыва */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <img
              src={review.user_avatar}
              alt={review.user_name}
              className="w-10 h-10 rounded-full ring-2 ring-kinopoisk-gray-200 dark:ring-kinopoisk-gray-700"
            />
            {review.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-kinopoisk-gray-900 dark:text-white truncate">
                {review.user_name}
              </h4>
              <span className="text-kinopoisk-gray-500 text-sm">
                {formatDate(review.created_at)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <StarRating 
                rating={review.rating} 
                maxRating={10} 
                size="sm" 
                showValue={true}
                showText={false}
              />
            </div>
          </div>
        </div>
        
        <button className="p-2 hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-700 rounded-full transition-colors">
          <MoreIcon size={16} className="text-kinopoisk-gray-500" />
        </button>
      </div>

      {/* Заголовок отзыва */}
      {review.title && (
        <h5 className="font-semibold text-kinopoisk-gray-900 dark:text-white mb-3 text-lg">
          {review.title}
        </h5>
      )}

      {/* Предупреждение о спойлерах */}
      {review.is_spoiler && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-amber-600 dark:text-amber-400">⚠️</span>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              Этот отзыв содержит спойлеры
            </p>
          </div>
        </div>
      )}

      {/* Текст отзыва */}
      <div className="text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 leading-relaxed mb-4">
        <p className="whitespace-pre-wrap">{displayText}</p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-kinopoisk-orange hover:text-kinopoisk-orange-dark text-sm mt-2 font-medium transition-colors"
          >
            {showFullText ? 'Свернуть' : 'Читать полностью'}
          </button>
        )}
      </div>

      {/* Действия */}
      <div className="flex items-center justify-between pt-3 border-t border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700">
        <div className="flex items-center space-x-1">
          {/* Лайк */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVote(true)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              userVote === true
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-700 text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400'
            }`}
          >
            <ThumbsUpIcon size={16} filled={userVote === true} />
            <span className="text-sm font-medium">{likesCount}</span>
          </motion.button>

          {/* Дизлайк */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVote(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              userVote === false
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-700 text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400'
            }`}
          >
            <ThumbsDownIcon size={16} filled={userVote === false} />
            <span className="text-sm font-medium">{dislikesCount}</span>
          </motion.button>
        </div>

        {/* Полезность */}
        <div className="flex items-center space-x-2">
          <div className="text-sm text-kinopoisk-gray-500">
            Полезность: <span className="font-medium">{Math.round(review.helpful_score)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReviewCard