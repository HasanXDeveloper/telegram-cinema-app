import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Инициализация Telegram Web App
import WebApp from '@twa-dev/sdk'

// Настройка Telegram Web App
WebApp.ready()
WebApp.expand()

// Применение темы Telegram
if (WebApp.colorScheme === 'dark') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)