import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import MovieCard from '../components/MovieCard'
import { useMovies } from '../hooks/useMovies'
import { PlayIcon, StarIcon, ChevronRightIcon } from '../components/icons'

import 'swiper/css'
import 'swiper/css/pagination'

const Home = () => {
  const { data: featuredMovies, isLoading: featuredLoading } = useMovies('featured')
  const { data: newMovies, isLoading: newLoading } = useMovies('new')
  const { data: popularMovies, isLoading: popularLoading } = useMovies('popular')

  const categories = [
    { name: 'Фильмы', icon: '🎬', path: '/category/movies', color: 'from-kinopoisk-orange to-kinopoisk-orange-light' },
    { name: 'Сериалы', icon: '📺', path: '/category/series', color: 'from-blue-500 to-blue-600' },
    { name: 'Аниме', icon: '🎌', path: '/category/anime', color: 'from-purple-500 to-purple-600' },
    { name: 'Документальные', icon: '📖', path: '/category/documentary', color: 'from-green-500 to-green-600' },
  ]

  return (
    <div className="space-y-8 pb-6">
      {/* Баннер с рекомендуемыми фильмами */}
      <section className="relative -mx-4">
        {featuredLoading ? (
          <div className="h-80 bg-kinopoisk-gray-200 dark:bg-kinopoisk-gray-800 animate-pulse"></div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-white/50',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-kinopoisk-orange'
            }}
            className="h-80 overflow-hidden"
          >
            {featuredMovies?.slice(0, 5).map((movie) => (
              <SwiperSlide key={movie.id}>
                <motion.div 
                  className="relative w-full h-full bg-cover bg-center group cursor-pointer"
                  style={{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-3xl font-bold mb-3 line-clamp-2">{movie.title}</h2>
                      <p className="text-base opacity-90 line-clamp-2 mb-4 max-w-2xl">
                        {movie.description}
                      </p>
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <StarIcon size={16} filled className="text-kinopoisk-yellow" />
                          <span className="font-semibold">{movie.rating || '—'}</span>
                        </div>
                        <span className="opacity-75">
                          {movie.year} • {movie.genres?.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.button 
                          className="flex items-center space-x-2 bg-kinopoisk-orange hover:bg-kinopoisk-orange-dark px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <PlayIcon size={20} />
                          <span>Смотреть</span>
                        </motion.button>
                        <motion.button 
                          className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl font-medium transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>Подробнее</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* Новинки */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white">Новинки</h2>
          <button className="flex items-center space-x-1 text-kinopoisk-orange hover:text-kinopoisk-orange-dark transition-colors">
            <span className="font-medium">Все</span>
            <ChevronRightIcon size={16} />
          </button>
        </div>
        {newLoading ? (
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-40 h-60 bg-kinopoisk-gray-200 dark:bg-kinopoisk-gray-800 animate-pulse rounded-xl flex-shrink-0"></div>
            ))}
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {newMovies?.map((movie, index) => (
              <motion.div 
                key={movie.id} 
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard movie={movie} size="medium" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Популярные */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white">Популярные</h2>
          <button className="flex items-center space-x-1 text-kinopoisk-orange hover:text-kinopoisk-orange-dark transition-colors">
            <span className="font-medium">Все</span>
            <ChevronRightIcon size={16} />
          </button>
        </div>
        {popularLoading ? (
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-40 h-60 bg-kinopoisk-gray-200 dark:bg-kinopoisk-gray-800 animate-pulse rounded-xl flex-shrink-0"></div>
            ))}
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {popularMovies?.map((movie, index) => (
              <motion.div 
                key={movie.id} 
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard movie={movie} size="medium" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Категории */}
      <section className="px-4">
        <h2 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white mb-6">Категории</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className={`relative overflow-hidden bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white cursor-pointer group`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg">{category.name}</h3>
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <ChevronRightIcon size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Рекомендации */}
      <section className="px-4">
        <h2 className="text-2xl font-bold text-kinopoisk-gray-900 dark:text-white mb-6">Рекомендуем посмотреть</h2>
        <div className="bg-gradient-to-r from-kinopoisk-orange/10 to-kinopoisk-yellow/10 rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-kinopoisk-orange rounded-full flex items-center justify-center">
              <StarIcon size={24} filled className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-kinopoisk-gray-900 dark:text-white mb-1">
                Персональные рекомендации
              </h3>
              <p className="text-kinopoisk-gray-600 dark:text-kinopoisk-gray-400 text-sm">
                Основано на ваших предпочтениях и истории просмотров
              </p>
            </div>
            <ChevronRightIcon size={20} className="text-kinopoisk-orange" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home