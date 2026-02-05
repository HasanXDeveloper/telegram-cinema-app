import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseIcon } from './icons'
import StarRating from './StarRating'

const RatingModal = ({ currentRating, onRate, onClose }) => {
  const [selectedRating, setSelectedRating] = useState(currentRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleRate = () => {
    if (selectedRating > 0) {
      onRate(selectedRating)
    }
  }

  const getRatingText = (rating) => {
    if (rating === 0) return 'Выберите оценку'
    if (rating <= 2) return 'Ужасно'
    if (rating <= 4) return 'Плохо'
    if (rating <= 6) return 'Нормально'
    if (rating <= 8) return 'Хорошо'
    return 'Отлично'
  }

  const getRatingDescription = (rating) => {
    const descriptions = {
      1: 'Полная катастрофа',
      2: 'Очень слабо',
      3: 'Слабовато',
      4: 'Так себе',
      5: 'Средненько',
      6: 'Неплохо',
      7: 'Хорошо',
      8: 'Очень хорошо',
      9: 'Отлично',
      10: 'Шедевр'
    }
    return descriptions[rating] || ''
  }

  const displayRating = hoveredRating || selectedRating

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white dark:bg-kinopoisk-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-strong"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-kinopoisk-gray-900 dark:text-white">
              Ваша оценка
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-800 rounded-full transition-colors"
            >
              <CloseIcon size={20} className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400" />
            </button>
          </div>

          {/* Звездный рейтинг */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <StarRating
                rating={selectedRating}
                maxRating={10}
                size="lg"
                interactive={true}
                onChange={setSelectedRating}
                showValue={false}
              />
            </div>

            {/* Числовое значение */}
            <div className="mb-3">
              <span className="text-3xl font-bold text-kinopoisk-orange">
                {displayRating || '—'}
              </span>
              <span className="text-lg text-kinopoisk-gray-500 ml-1">/10</span>
            </div>

            {/* Текстовое описание */}
            <div className="space-y-1">
              <p className="text-lg font-medium text-kinopoisk-gray-900 dark:text-white">
                {getRatingText(displayRating)}
              </p>
              {displayRating > 0 && (
                <p className="text-sm text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400">
                  {getRatingDescription(displayRating)}
                </p>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-kinopoisk-gray-300 dark:border-kinopoisk-gray-700 rounded-xl text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 font-medium hover:bg-kinopoisk-gray-50 dark:hover:bg-kinopoisk-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleRate}
              disabled={selectedRating === 0}
              className="flex-1 py-3 px-4 bg-kinopoisk-orange hover:bg-kinopoisk-orange-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              {currentRating ? 'Изменить' : 'Оценить'}
            </button>
          </div>

          {/* Подсказка */}
          <p className="text-xs text-kinopoisk-gray-500 text-center mt-4">
            Нажмите на звезду, чтобы поставить оценку
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RatingModal