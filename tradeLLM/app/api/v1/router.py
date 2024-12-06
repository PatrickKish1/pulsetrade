from fastapi import APIRouter
from app.api.v1.endpoints import market, trades, onchain, users, chat

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["Market Analysis"])
api_router.include_router(trades.router, prefix="/trades", tags=["Trading"])
api_router.include_router(onchain.router, prefix="/onchain", tags=["Onchain Analysis"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat Analysis"])