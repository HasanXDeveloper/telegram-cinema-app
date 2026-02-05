"""Состояния для FSM"""

from aiogram.fsm.state import State, StatesGroup

class FeedbackStates(StatesGroup):
    """Состояния для обратной связи"""
    waiting_for_feedback = State()

class AdminStates(StatesGroup):
    """Состояния для админ функций"""
    waiting_for_broadcast = State()
    waiting_for_reply = State()

class SupportStates(StatesGroup):
    """Состояния для поддержки"""
    waiting_for_question = State()
    waiting_for_category = State()