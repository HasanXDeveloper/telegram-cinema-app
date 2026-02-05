import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export const useTelegramTheme = () => {
  useEffect(() => {
    // Применяем тему Telegram
    const applyTheme = () => {
      const root = document.documentElement
      
      if (WebApp.colorScheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      // Устанавливаем CSS переменные из Telegram
      if (WebApp.themeParams) {
        const theme = WebApp.themeParams
        
        root.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#ffffff')
        root.style.setProperty('--tg-theme-text-color', theme.text_color || '#000000')
        root.style.setProperty('--tg-theme-hint-color', theme.hint_color || '#999999')
        root.style.setProperty('--tg-theme-link-color', theme.link_color || '#2481cc')
        root.style.setProperty('--tg-theme-button-color', theme.button_color || '#2481cc')
        root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color || '#ffffff')
        root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color || '#f1f1f1')
      }
    }

    applyTheme()

    // Слушаем изменения темы
    WebApp.onEvent('themeChanged', applyTheme)

    return () => {
      WebApp.offEvent('themeChanged', applyTheme)
    }
  }, [])
}