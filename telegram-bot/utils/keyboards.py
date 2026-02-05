"""Клавиатуры для бота"""

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from ..config import WEBAPP_URL

def get_main_keyboard() -> InlineKeyboardMarkup:
    """Главная клавиатура бота"""
    builder = InlineKeyboardBuilder()
    
    # Главная кнопка - запуск Mini App
    builder.row(
        InlineKeyboardButton(
            text="🎬 Открыть кинотеатр",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    
    # Быстрые действия
    builder.row(
        InlineKeyboardButton(
            text="🔥 Новинки",
            web_app=WebAppInfo(url=f"{WEBAPP_URL}/?category=new")
        ),
        InlineKeyboardButton(
            text="⭐ Топ",
            web_app=WebAppInfo(url=f"{WEBAPP_URL}/?category=popular")
        )
    )
    
    # Дополнительные функции
    builder.row(
        InlineKeyboardButton(text="📊 Моя статистика", callback_data="stats"),
        InlineKeyboardButton(text="ℹ️ О проекте", callback_data="about")
    )
    
    builder.row(
        InlineKeyboardButton(text="💬 Обратная связь", callback_data="feedback"),
        InlineKeyboardButton(text="🆘 Помощь", callback_data="help")
    )
    
    return builder.as_markup()

def get_back_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура с кнопкой назад"""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🔙 Назад в меню", callback_data="back_to_main")
    )
    return builder.as_markup()

def get_admin_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура для администраторов"""
    builder = InlineKeyboardBuilder()
    
    builder.row(
        InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats"),
        InlineKeyboardButton(text="👥 Пользователи", callback_data="admin_users")
    )
    
    builder.row(
        InlineKeyboardButton(text="📢 Рассылка", callback_data="admin_broadcast"),
        InlineKeyboardButton(text="🎬 Контент", callback_data="admin_content")
    )
    
    builder.row(
        InlineKeyboardButton(text="⚙️ Настройки", callback_data="admin_settings"),
        InlineKeyboardButton(text="📝 Логи", callback_data="admin_logs")
    )
    
    return builder.as_markup()

def get_genre_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура с жанрами"""
    builder = InlineKeyboardBuilder()
    
    genres = [
        ("🎭", "Драма", "drama"),
        ("😂", "Комедия", "comedy"),
        ("💥", "Боевик", "action"),
        ("👻", "Ужасы", "horror"),
        ("💕", "Романтика", "romance"),
        ("🚀", "Фантастика", "sci-fi"),
        ("🕵️", "Триллер", "thriller"),
        ("🏰", "Фэнтези", "fantasy"),
    ]
    
    for emoji, name, slug in genres:
        builder.row(
            InlineKeyboardButton(
                text=f"{emoji} {name}",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/?genre={slug}")
            )
        )
    
    builder.row(
        InlineKeyboardButton(text="🔙 Назад", callback_data="back_to_main")
    )
    
    return builder.as_markup()

def get_share_keyboard(movie_id: int, movie_title: str) -> InlineKeyboardMarkup:
    """Клавиатура для поделиться фильмом"""
    builder = InlineKeyboardBuilder()
    
    # Кнопка поделиться
    share_url = f"https://t.me/your_bot_username?start=movie_{movie_id}"
    builder.row(
        InlineKeyboardButton(
            text="📤 Поделиться фильмом",
            url=f"https://t.me/share/url?url={share_url}&text=🎬 Смотри какой классный фильм: {movie_title}"
        )
    )
    
    # Кнопка открыть в кинотеатре
    builder.row(
        InlineKeyboardButton(
            text="🎬 Открыть в кинотеатре",
            web_app=WebAppInfo(url=f"{WEBAPP_URL}/movie/{movie_id}")
        )
    )
    
    return builder.as_markup()