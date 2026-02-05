import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, CloseIcon } from './icons'

const Header = ({ searchQuery, setSearchQuery }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-kinopoisk-gray-900/95 backdrop-blur-sm border-b border-kinopoisk-gray-200 dark:border-kinopoisk-gray-800">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-kinopoisk-orange to-kinopoisk-orange-light rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-kinopoisk-gray-900 dark:text-white">Cinema</h1>
              <p className="text-xs text-kinopoisk-gray-500 dark:text-kinopoisk-gray-400 -mt-1">Kinopoisk Style</p>
            </div>
          </motion.div>

          {/* Поиск */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.form 
                  onSubmit={handleSearch} 
                  className="flex items-center"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kinopoisk-gray-500" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск фильмов..."
                      className="w-64 pl-10 pr-4 py-2 bg-kinopoisk-gray-100 dark:bg-kinopoisk-gray-800 border border-kinopoisk-gray-200 dark:border-kinopoisk-gray-700 rounded-xl text-kinopoisk-gray-900 dark:text-white placeholder-kinopoisk-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-kinopoisk-orange focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-3 p-2 text-kinopoisk-gray-500 hover:text-kinopoisk-gray-700 dark:hover:text-kinopoisk-gray-300 rounded-xl hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-800 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CloseIcon size={16} />
                  </motion.button>
                </motion.form>
              ) : (
                <motion.button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-3 text-kinopoisk-gray-700 dark:text-kinopoisk-gray-300 hover:text-kinopoisk-orange hover:bg-kinopoisk-orange/10 rounded-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SearchIcon size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header