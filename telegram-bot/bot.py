import asyncio
import logging
from aiogram import Dispatcher
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from config import bot, WEBAPP_URL, DEBUG
from handlers.user import router as user_router
from utils.stats import export_stats_summary

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Инициализация диспетчера
dp = Dispatcher()

# Подключение роутеров
dp.include_router(user_router)

async def set_bot_commands():
    """Установка команд бота"""
    commands = [
        BotCommand(command="start", description="🎬 Запустить кинотеатр"),
        BotCommand(command="help", description="🆘 Помощь и справка"),
        BotCommand(command="stats", description="📊 Моя статистика"),
    ]
    
    await bot.set_my_commands(commands)
    logger.info("Команды бота установлены")

async def set_menu_button():
    """Установка кнопки меню с Web App"""
    menu_button = MenuButtonWebApp(
        text="🎬 Кинотеатр",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    await bot.set_chat_menu_button(menu_button=menu_button)
    logger.info(f"Кнопка меню установлена: {WEBAPP_URL}")

async def on_startup():
    """Действия при запуске бота"""
    logger.info("🚀 Запуск Telegram бота Cinema...")
    
    # Устанавливаем команды и кнопку меню
    await set_bot_commands()
    await set_menu_button()
    
    # Получаем информацию о боте
    bot_info = await bot.get_me()
    logger.info(f"✅ Бот запущен: @{bot_info.username}")
    logger.info(f"🌐 Web App URL: {WEBAPP_URL}")
    
    # Выводим статистику
    stats = export_stats_summary()
    logger.info(f"📊 Пользователей в базе: {stats['total_users']}")

async def on_shutdown():
    """Действия при остановке бота"""
    logger.info("🛑 Остановка бота...")
    await bot.session.close()

async def main():
    """Главная функция запуска бота"""
    try:
        # Регистрируем обработчики событий
        dp.startup.register(on_startup)
        dp.shutdown.register(on_shutdown)
        
        # Запускаем polling
        await dp.start_polling(bot, skip_updates=True)
        
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        raise
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Бот остановлен пользователем")
    except Exception as e:
        logger.error(f"💥 Неожиданная ошибка: {e}")