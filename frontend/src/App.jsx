import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

// Компоненты
import Layout from './components/Layout'
import Home from './pages/Home'
import Movie from './pages/Movie'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Player from './pages/Player'

// Хуки и утилиты
import { useTelegramTheme } from './hooks/useTelegramTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  useTelegramTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-telegram-bg text-telegram-text">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<Movie />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/player/:id" element={<Player />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-text-color)',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App