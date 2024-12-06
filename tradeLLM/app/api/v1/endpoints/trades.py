from fastapi import APIRouter, HTTPException
from app.core.models import TradeSignal
from app.services.trade_signals import TradeSignalGenerator

router = APIRouter()

@router.post("/signal",
    response_model=TradeSignal,
    tags=["Trading"],
    summary="Generate trade signal",
    description="Generates a trading signal with entry, exit, and risk parameters")
async def generate_trade_signal(instrument: str):
    try:
        signal_generator = TradeSignalGenerator()
        signal = await signal_generator.generate(instrument)
        return signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))