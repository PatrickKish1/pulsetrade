from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class UserProfile(BaseModel):
    risk_level: str = Field(..., description="User's risk tolerance")
    token_preferences: str = Field(..., description="Preferred tokens")
    mission_statement: str = Field(..., description="Trading goals")
    wallet_address: Optional[str] = None

class TradeSignal(BaseModel):
    instrument: str
    direction: Literal["buy", "sell"]
    entry_price: float
    take_profit: float
    stop_loss: float
    lot_size: float
    reasoning: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketAnalysis(BaseModel):
    instrument: str
    timeframe: str
    price: float
    technical_indicators: dict
    sentiment: str
    summary: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OnchainPosition(BaseModel):
    asset: str
    size: float
    value: float
    pnl: float
    leverage: Optional[float] = None