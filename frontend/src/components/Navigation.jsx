import { NavLink } from 'react-router-dom'
import { HomeIcon, SearchIcon, HeartIcon, UserIcon } from './icons'

const Navigation = () => {
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Главная' },
    { path: '/search', icon: SearchIcon, label: 'Поиск' },
    { path: '/favorites', icon: HeartIcon, label: 'Избранное' },
    { path: '/profile', icon: UserIcon, label: 'Профиль' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-kinopoisk-gray-900/95 backdrop-blur-md border-t border-kinopoisk-gray-200 dark:border-kinopoisk-gray-800 z-40 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? 'text-kinopoisk-orange bg-kinopoisk-orange/10'
                  : 'text-kinopoisk-gray-500 hover:text-kinopoisk-gray-700 dark:hover:text-kinopoisk-gray-300 hover:bg-kinopoisk-gray-100 dark:hover:bg-kinopoisk-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon 
                  size={22} 
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className={`text-xs mt-1 font-medium truncate ${
                  isActive ? 'text-kinopoisk-orange' : ''
                }`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation