"""Утилиты для работы со статистикой"""

from datetime import datetime
from typing import Dict, Optional

# В реальном проекте лучше использовать базу данных
user_stats: Dict[int, Dict] = {}

def update_user_stats(user_id: int, user_name: str) -> None:
    """Обновить статистику пользователя"""
    if user_id not in user_stats:
        user_stats[user_id] = {
            'first_visit': datetime.now(),
            'last_visit': datetime.now(),
            'visits_count': 1,
            'name': user_name,
            'movies_watched': 0,
            'total_watch_time': 0,
            'favorites_count': 0,
            'reviews_count': 0
        }
    else:
        user_stats[user_id]['last_visit'] = datetime.now()
        user_stats[user_id]['visits_count'] += 1
        user_stats[user_id]['name'] = user_name  # Обновляем имя на случай изменения

def get_user_stats(user_id: int) -> Optional[Dict]:
    """Получить статистику пользователя"""
    return user_stats.get(user_id)

def get_total_users() -> int:
    """Получить общее количество пользователей"""
    return len(user_stats)

def get_active_users_today() -> int:
    """Получить количество активных пользователей сегодня"""
    today = datetime.now().date()
    return sum(1 for stats in user_stats.values() 
              if stats['last_visit'].date() == today)

def get_active_users_week() -> int:
    """Получить количество активных пользователей за неделю"""
    from datetime import timedelta
    week_ago = datetime.now() - timedelta(days=7)
    return sum(1 for stats in user_stats.values() 
              if stats['last_visit'] >= week_ago)

def get_new_users_today() -> int:
    """Получить количество новых пользователей сегодня"""
    today = datetime.now().date()
    return sum(1 for stats in user_stats.values() 
              if stats['first_visit'].date() == today)

def get_top_users_by_visits(limit: int = 10) -> list:
    """Получить топ пользователей по количеству визитов"""
    sorted_users = sorted(
        user_stats.items(), 
        key=lambda x: x[1]['visits_count'], 
        reverse=True
    )
    return sorted_users[:limit]

def export_stats_summary() -> Dict:
    """Экспорт сводной статистики"""
    return {
        'total_users': get_total_users(),
        'active_today': get_active_users_today(),
        'active_week': get_active_users_week(),
        'new_today': get_new_users_today(),
        'avg_visits': sum(stats['visits_count'] for stats in user_stats.values()) / len(user_stats) if user_stats else 0,
        'total_visits': sum(stats['visits_count'] for stats in user_stats.values()),
        'last_updated': datetime.now().isoformat()
    }