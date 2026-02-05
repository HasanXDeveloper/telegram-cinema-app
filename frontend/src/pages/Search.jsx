import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import MovieCard from '../components/MovieCard'
import { useSearchMovies } from '../hooks/useMovies'
import { SearchIcon, FilterIcon, CloseIcon, ChevronRightIcon } from '../components/icons'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    type: '',
    genre: '',
    year: '',
    rating: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: searchResults, isLoading, error } = useSearchMovies(query)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
    }
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchParams({})
  }

  const filteredResults = searchResults?.filter(movie => {
    if (filters.type && movie.movie_type !== filters.type) return false
    if (filters.year && movie.year.toString() !== filters.year) return false
    if (filters.rating && movie.rating < parseFloat(filters.rating)) return false
    if (filters.genre && !movie.genres?.some(g => g.toLowerCase().includes(filters.genre.toLowerCase()))) return false
    return true
  }) || []

  const years = [...new Set(searchResults?.map(m => m.year) || [])].sort((a, b) => b - a)
  const genres = [...new Set(searchResults?.flatMap(m => m.genres || []) || [])].sort()

  const popularTags = [
    'Марвел', 'Комедии 2024', 'Хоррор', 'Аниме', 'Документальные',
    'Российские фильмы', 'Сериалы Netflix', 'Классика кино'
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Поисковая форма */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kinopoisk-gray-500" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск фильмов, сериалов, актеров..."
              className="w-full pl-12 pr-20 py-4 bg-white dark:bg-kinopoisk-gray-800 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700 rounded-2xl text-kinopoisk-gray-900 dark:text-white placeholder-kinopoisk-gray-500 focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent transition-all"
            />
            {query && (
              <motion.button
                type="button"
                onClick={clearSearch}
                className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1 text-kinopoisk-gray-500 hover:text-kinopoisk-gray-700 dark:hover:text-kinopoisk-gray-300 rounded-full hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-700 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <CloseIcon size={16} />
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all ${
                showFilters 
                  ? 'text-kinopoisk-orange bg-kinopoisk-orange/10' 
                  : 'text-kinopoisk-gray-500 hover:text-kinopoisk-orange hover:bg-kinopoisk-orange/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FilterIcon size={20} />
            </motion.button>
          </div>
        </form>

        {/* Фильтры */}
        <motion.div
          initial={false}
          animate={{ 
            height: showFilters ? 'auto' : 0,
            opacity: showFilters ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-kinopoisk-gray-800 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-kinopoisk-gray-900 dark:text-white">Фильтры</h3>
              <button
                onClick={() => setFilters({ type: '', genre: '', year: '', rating: '' })}
                className="text-kinopoisk-orange hover:text-kinopoisk-orange-dark text-sm font-medium transition-colors"
              >
                Сбросить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 mb-2">Тип</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-kinopoisk-gray-50 dark:bg-kinopoisk-gray-700 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-600 rounded-xl px-4 py-3 text-kinopoisk-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent"
                >
                  <option value="">Все</option>
                  <option value="movie">Фильмы</option>
                  <option value="series">Сериалы</option>
                  <option value="anime">Аниме</option>
                  <option value="documentary">Документальные</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 mb-2">Год</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-kinopoisk-gray-50 dark:bg-kinopoisk-gray-700 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-600 rounded-xl px-4 py-3 text-kinopoisk-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent"
                >
                  <option value="">Любой</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 mb-2">Жанр</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-kinopoisk-gray-50 dark:bg-kinopoisk-gray-700 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-600 rounded-xl px-4 py-3 text-kinopoisk-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent"
                >
                  <option value="">Любой</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 mb-2">Рейтинг от</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full bg-kinopoisk-gray-50 dark:bg-kinopoisk-gray-700 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-600 rounded-xl px-4 py-3 text-kinopoisk-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent"
                >
                  <option value="">Любой</option>
                  <option value="7">7.0+</option>
                  <option value="8">8.0+</option>
                  <option value="9">9.0+</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Результаты поиска */}
      <div>
        {query && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white mb-2">
              Результаты поиска "{query}"
            </h2>
            <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400">
              Найдено: {filteredResults.length} {filteredResults.length === 1 ? 'фильм' : 'фильмов'}
            </p>
          </motion.div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-kinopoisk-gray-200 dark:bg-kinopoisk-gray-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        )}

        {error && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">Ошибка при поиске. Попробуйте еще раз.</p>
          </motion.div>
        )}

        {!isLoading && !error && query && filteredResults.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon size={32} className="text-kinopoisk-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white mb-2">Ничего не найдено</h3>
            <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 max-w-md mx-auto">
              Попробуйте изменить запрос или использовать другие ключевые слова
            </p>
          </motion.div>
        )}

        {!isLoading && !error && filteredResults.length > 0 && (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredResults.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard movie={movie} size="medium" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!query && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-kinopoisk-orange to-kinopoisk-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎬</span>
            </div>
            <h3 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white mb-3">Поиск фильмов</h3>
            <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 max-w-md mx-auto mb-8">
              Введите название фильма, сериала или имя актера для поиска
            </p>
          </motion.div>
        )}
      </div>

      {/* Популярные запросы */}
      {!query && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white">Популярные запросы</h3>
            <ChevronRightIcon size={20} className="text-kinopoisk-gray-400" />
          </div>
          <div className="flex flex-wrap gap-3">
            {popularTags.map((tag, index) => (
              <motion.button
                key={tag}
                onClick={() => {
                  setQuery(tag)
                  setSearchParams({ q: tag })
                }}
                className="px-4 py-2 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 hover:bg-kinopoisk-orange hover:text-white rounded-full text-sm font-medium text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 transition-all"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Search