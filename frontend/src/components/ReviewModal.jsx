import { useState } from 'react'
import { Star, X, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const ReviewModal = ({ movieId, currentRating, onClose, onSubmit }) => {
  const [rating, setRating] = useState(currentRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0 || !title.trim() || !comment.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/movies/${movieId}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || ''
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
          is_spoiler: isSpoiler
        })
      })

      if (response.ok) {
        onSubmit()
      } else {
        const error = await response.json()
        console.error('Ошибка при отправке отзыва:', error)
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating) => {
    const texts = {
      1: 'Ужасно',
      2: 'Очень плохо',
      3: 'Плохо',
      4: 'Неплохо',
      5: 'Нормально',
      6: 'Хорошо',
      7: 'Очень хорошо',
      8: 'Отлично',
      9: 'Великолепно',
      10: 'Шедевр'
    }
    return texts[rating] || 'Выберите оценку'
  }

  const isFormValid = rating > 0 && title.trim() && comment.trim()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-telegram-bg rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-telegram-text">
            Написать отзыв
          </h3>
          <button
            onClick={onClose}
            className="text-telegram-hint hover:text-telegram-text"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Рейтинг */}
          <div>
            <label className="block text-sm font-medium text-telegram-text mb-3">
              Ваша оценка *
            </label>
            <div className="text-center">
              <div className="flex justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratingValue) => (
                  <button
                    key={ratingValue}
                    type="button"
                    onMouseEnter={() => setHoveredRating(ratingValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(ratingValue)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={20}
                      className={`transition-colors ${
                        ratingValue <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-telegram-hint'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-telegram-text">
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>
          </div>

          {/* Заголовок отзыва */}
          <div>
            <label className="block text-sm font-medium text-telegram-text mb-2">
              Заголовок отзыва *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Кратко опишите ваше впечатление"
              maxLength={200}
              className="w-full px-3 py-2 bg-telegram-secondary-bg border border-telegram-hint/20 rounded-lg text-telegram-text placeholder-telegram-hint focus:outline-none focus:ring-2 focus:ring-cinema-primary focus:border-transparent"
            />
            <p className="text-xs text-telegram-hint mt-1">
              {title.length}/200 символов
            </p>
          </div>

          {/* Текст отзыва */}
          <div>
            <label className="block text-sm font-medium text-telegram-text mb-2">
              Подробный отзыв *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь своими впечатлениями о фильме. Что понравилось или не понравилось?"
              rows={6}
              maxLength={2000}
              className="w-full px-3 py-2 bg-telegram-secondary-bg border border-telegram-hint/20 rounded-lg text-telegram-text placeholder-telegram-hint focus:outline-none focus:ring-2 focus:ring-cinema-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-telegram-hint mt-1">
              {comment.length}/2000 символов
            </p>
          </div>

          {/* Спойлеры */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="spoiler"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="mt-1"
            />
            <div>
              <label htmlFor="spoiler" className="text-sm font-medium text-telegram-text cursor-pointer">
                Отзыв содержит спойлеры
              </label>
              <p className="text-xs text-telegram-hint mt-1">
                Отметьте, если в отзыве раскрываются важные детали сюжета
              </p>
            </div>
          </div>

          {/* Предупреждение */}
          <div className="bg-telegram-secondary-bg rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-telegram-hint">
                <p className="mb-1">Правила написания отзывов:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Будьте вежливы и конструктивны</li>
                  <li>Не используйте нецензурную лексику</li>
                  <li>Отмечайте спойлеры соответствующей галочкой</li>
                  <li>Пишите честно о своих впечатлениях</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-telegram-hint rounded-lg text-telegram-text hover:bg-telegram-secondary-bg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 py-2 px-4 bg-cinema-primary text-white rounded-lg hover:bg-cinema-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ReviewModal