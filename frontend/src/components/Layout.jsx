import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import Header from './Header'

const Layout = ({ children }) => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Скрываем навигацию на странице плеера
  const hideNavigation = location.pathname.startsWith('/player')

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && (
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
      
      <main className={`flex-1 ${!hideNavigation ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {!hideNavigation && <Navigation />}
    </div>
  )
}

export default Layout