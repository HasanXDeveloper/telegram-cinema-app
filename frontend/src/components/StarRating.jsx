import { useState } from 'react'
import { motion } from 'framer-motion'

const StarRating = ({ 
  rating = 0, 
  maxRating = 10, 
  size = 'md', 
  interactive = false, 
  onChange,
  showValue = true,
  showText = false 
}) => {
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const sizes = {
    xs: { star: 12, gap: 'gap-0.5' },
    sm: { star: 16, gap: 'gap-1' },
    md: { star: 20, gap: 'gap-1' },
    lg: { star: 24, gap: 'gap-1.5' },
    xl: { star: 28, gap: 'gap-2' }
  }
  
  const currentSize = sizes[size]
  const displayRating = hoveredRating || rating
  
  const getRatingText = (rating) => {
    if (rating === 0) return 'Не оценено'
    if (rating <= 2) return 'Ужасно'
    if (rating <= 4) return 'Плохо'
    if (rating <= 6) return 'Нормально'
    if (rating <= 8) return 'Хорошо'
    return 'Отлично'
  }
  
  const getRatingColor = (rating) => {
    if (rating === 0) return 'text-kinopoisk-gray-400'
    if (rating <= 4) return 'text-red-500'
    if (rating <= 6) return 'text-kinopoisk-yellow'
    if (rating <= 8) return 'text-kinopoisk-orange'
    return 'text-green-500'
  }

  const handleStarClick = (starRating) => {
    if (interactive && onChange) {
      onChange(starRating)
    }
  }

  const handleStarHover = (starRating) => {
    if (interactive) {
      setHoveredRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(0)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Звезды */}
      <div className={`flex ${currentSize.gap}`} onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating
          const isPartiallyFilled = starValue - 0.5 <= displayRating && starValue > displayRating
          
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={!interactive}
              className={`relative transition-all duration-200 ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              {/* Фоновая звезда */}
              <svg
                width={currentSize.star}
                height={currentSize.star}
                viewBox="0 0 24 24"
                className="text-kinopoisk-gray-300"
              >
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              
              {/* Заполненная звезда */}
              {(isFilled || isPartiallyFilled) && (
                <svg
                  width={currentSize.star}
                  height={currentSize.star}
                  viewBox="0 0 24 24"
                  className={`absolute inset-0 ${getRatingColor(displayRating)} transition-colors duration-200`}
                  style={{
                    clipPath: isPartiallyFilled ? 'inset(0 50% 0 0)' : 'none'
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* Значение рейтинга */}
      {showValue && (
        <div className="flex items-center space-x-1">
          <span className={`font-semibold ${getRatingColor(displayRating)}`}>
            {displayRating > 0 ? displayRating.toFixed(1) : '—'}
          </span>
          {maxRating === 10 && (
            <span className="text-kinopoisk-gray-500 text-sm">/10</span>
          )}
        </div>
      )}
      
      {/* Текстовое описание */}
      {showText && (
        <span className="text-sm text-kinopoisk-gray-600">
          {getRatingText(displayRating)}
        </span>
      )}
    </div>
  )
}

export default StarRating