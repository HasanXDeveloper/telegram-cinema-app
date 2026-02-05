import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import StarRating from '../components/StarRating'
import { 
  ChevronLeftIcon, 
  PlayIcon, 
  EyeIcon, 
  MoreIcon,
  CloseIcon
} from '../components/icons'

const Player = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [movie, setMovie] = useState(null)
  const [streams, setStreams] = useState({})
  const [currentQuality, setCurrentQuality] = useState('720p')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    // Загружаем данные фильма и потоки
    loadMovieData()
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
      }
    }
  }, [id])

  useEffect(() => {
    if (streams.movie && Object.keys(streams.movie).length > 0) {
      initializePlayer()
    }
  }, [streams])

  const loadMovieData = async () => {
    try {
      // Загружаем информацию о фильме
      const movieResponse = await fetch(`/api/movies/${id}/`)
      const movieData = await movieResponse.json()
      setMovie(movieData)

      // Загружаем потоки
      const streamsResponse = await fetch(`/api/movies/${id}/streams/`)
      const streamsData = await streamsResponse.json()
      setStreams(streamsData)

      // Выбираем лучшее качество по умолчанию
      if (streamsData.movie) {
        const qualities = Object.keys(streamsData.movie)
        const bestQuality = qualities.includes('1080p') ? '1080p' : 
                           qualities.includes('720p') ? '720p' : 
                           qualities[0]
        setCurrentQuality(bestQuality)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  }

  const initializePlayer = () => {
    if (!videoRef.current || !streams.movie) return

    const videoJsOptions = {
      autoplay: true,
      controls: false, // Используем кастомные контролы
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{
        src: streams.movie[currentQuality],
        type: 'application/x-mpegURL' // HLS
      }],
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
        }
      }
    }

    playerRef.current = videojs(videoRef.current, videoJsOptions, () => {
      console.log('Плеер инициализирован')
      
      // Восстанавливаем прогресс просмотра
      const savedProgress = localStorage.getItem(`movie_${id}_progress`)
      if (savedProgress) {
        playerRef.current.currentTime(parseInt(savedProgress))
      }

      // Обработчики событий
      playerRef.current.on('play', () => setIsPlaying(true))
      playerRef.current.on('pause', () => setIsPlaying(false))
      playerRef.current.on('loadedmetadata', () => {
        setDuration(playerRef.current.duration())
      })
      
      // Сохраняем прогресс каждые 10 секунд
      playerRef.current.on('timeupdate', () => {
        const currentTime = Math.floor(playerRef.current.currentTime())
        setCurrentTime(currentTime)
        localStorage.setItem(`movie_${id}_progress`, currentTime)
        
        // Отправляем прогресс на сервер
        if (currentTime % 30 === 0) { // Каждые 30 секунд
          updateWatchProgress(currentTime)
        }
      })

      playerRef.current.on('volumechange', () => {
        setVolume(playerRef.current.volume())
        setIsMuted(playerRef.current.muted())
      })
    })
  }

  const updateWatchProgress = async (progress) => {
    try {
      await fetch(`/api/movies/${id}/watch/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || ''
        },
        body: JSON.stringify({ progress })
      })
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error)
    }
  }

  const changeQuality = (quality) => {
    if (!playerRef.current || !streams.movie[quality]) return

    const currentTime = playerRef.current.currentTime()
    const isPaused = playerRef.current.paused()

    playerRef.current.src({
      src: streams.movie[quality],
      type: 'application/x-mpegURL'
    })

    playerRef.current.ready(() => {
      playerRef.current.currentTime(currentTime)
      if (!isPaused) {
        playerRef.current.play()
      }
    })

    setCurrentQuality(quality)
  }

  const togglePlayPause = () => {
    if (!playerRef.current) return
    
    if (isPlaying) {
      playerRef.current.pause()
    } else {
      playerRef.current.play()
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted(!isMuted)
    }
  }

  const handleVolumeChange = (newVolume) => {
    if (playerRef.current) {
      playerRef.current.volume(newVolume)
      setVolume(newVolume)
    }
  }

  const handleSeek = (newTime) => {
    if (playerRef.current) {
      playerRef.current.currentTime(newTime)
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Автоскрытие контролов
  useEffect(() => {
    let timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      setShowControls(true)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleTouchStart = () => resetTimeout()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchstart', handleTouchStart)

    resetTimeout()

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Видеоплеер */}
      <video
        ref={videoRef}
        className="video-js vjs-default-skin w-full h-full"
        playsInline
        data-setup="{}"
      />

      {/* Кастомные контролы */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Верхняя панель */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 pointer-events-auto">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-3 text-white hover:text-kinopoisk-orange transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeftIcon size={24} />
                  <span className="hidden sm:inline font-medium">Назад</span>
                </motion.button>
                
                <div className="text-white text-center flex-1 mx-6">
                  <h1 className="font-bold text-lg">{movie?.title}</h1>
                  {movie?.year && (
                    <p className="text-sm opacity-75">{movie.year}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button 
                    className="p-3 text-white hover:text-kinopoisk-orange transition-colors rounded-full hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <EyeIcon size={20} />
                  </motion.button>

                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 text-white hover:text-kinopoisk-orange transition-colors rounded-full hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreIcon size={20} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Центральная кнопка воспроизведения */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <motion.button
                onClick={togglePlayPause}
                className="w-20 h-20 bg-kinopoisk-orange/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-kinopoisk-orange transition-all shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isPlaying ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-8 bg-white rounded-full"></div>
                    <div className="w-2 h-8 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <PlayIcon size={32} className="ml-1" />
                )}
              </motion.button>
            </div>

            {/* Нижняя панель с контролами */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pointer-events-auto">
              {/* Прогресс бар */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-white text-sm mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="relative">
                  <div className="w-full h-1 bg-white/30 rounded-full">
                    <motion.div
                      className="h-1 bg-kinopoisk-orange rounded-full"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Контролы */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={togglePlayPause}
                    className="p-2 text-white hover:text-kinopoisk-orange transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? (
                      <div className="flex space-x-0.5">
                        <div className="w-1.5 h-6 bg-white rounded-full"></div>
                        <div className="w-1.5 h-6 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <PlayIcon size={24} />
                    )}
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={toggleMute}
                      className="p-2 text-white hover:text-kinopoisk-orange transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isMuted || volume === 0 ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-4 h-3 border-2 border-white rounded-sm relative">
                            <div className="absolute -right-1 top-0 w-2 h-1 border-t-2 border-r-2 border-white"></div>
                            <div className="absolute -right-1 bottom-0 w-2 h-1 border-b-2 border-r-2 border-white"></div>
                            <div className="absolute -right-3 -top-1 w-4 h-5 border-2 border-red-500 rotate-45"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-4 h-3 border-2 border-white rounded-sm relative">
                            <div className="absolute -right-1 top-0 w-2 h-1 border-t-2 border-r-2 border-white"></div>
                            <div className="absolute -right-1 bottom-0 w-2 h-1 border-b-2 border-r-2 border-white"></div>
                            <div className="absolute -right-2 top-0.5 w-1 h-2 border-r-2 border-white"></div>
                          </div>
                        </div>
                      )}
                    </motion.button>
                    
                    <div className="w-20 h-1 bg-white/30 rounded-full relative">
                      <div 
                        className="h-1 bg-white rounded-full"
                        style={{ width: `${volume * 100}%` }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:text-kinopoisk-orange transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isFullscreen ? (
                      <div className="w-6 h-6 border-2 border-white relative">
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-white"></div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Панель настроек */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  className="absolute top-20 right-6 bg-black/90 backdrop-blur-sm rounded-2xl p-4 pointer-events-auto min-w-48"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Настройки</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-white/70 hover:text-white"
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                  
                  {streams.movie && Object.keys(streams.movie).length > 1 && (
                    <div className="space-y-2">
                      <div className="text-white/70 text-sm">Качество:</div>
                      {Object.keys(streams.movie).map((quality) => (
                        <motion.button
                          key={quality}
                          onClick={() => {
                            changeQuality(quality)
                            setShowSettings(false)
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentQuality === quality 
                              ? 'bg-kinopoisk-orange text-white' 
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {quality}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Информация о фильме */}
      <AnimatePresence>
        {showControls && !isPlaying && movie && (
          <motion.div
            className="absolute bottom-32 left-6 right-6 bg-black/80 backdrop-blur-sm rounded-2xl p-6 text-white pointer-events-auto max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-bold text-2xl mb-3">{movie.title}</h2>
            {movie.description && (
              <p className="text-white/90 mb-4 line-clamp-3">{movie.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm">
              {movie.year && <span className="text-white/70">{movie.year}</span>}
              {movie.duration && <span className="text-white/70">{movie.duration} мин</span>}
              {movie.rating && (
                <div className="flex items-center space-x-2">
                  <StarRating rating={movie.rating} size="sm" showValue={false} />
                  <span className="text-kinopoisk-yellow font-semibold">{movie.rating}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Player