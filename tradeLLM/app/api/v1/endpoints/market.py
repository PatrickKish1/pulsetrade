from fastapi import APIRouter, HTTPException
from app.core.models import MarketAnalysis
from app.services.market_analysis import MarketAnalyzer
from app.services.sentiment_analysis import SentimentAnalyzer

router = APIRouter()

@router.get("/analysis/{instrument}", 
    response_model=MarketAnalysis,
    tags=["Market Analysis"],
    summary="Get market analysis for an instrument",
    description="Provides technical and sentiment analysis for the specified trading instrument")
async def get_market_analysis(
    instrument: str,
    timeframe: str = "1d"
):
    try:
        market_analyzer = MarketAnalyzer()
        sentiment_analyzer = SentimentAnalyzer()
        
        # Get market data and analysis
        analysis = await market_analyzer.analyze(instrument, timeframe)
        sentiment = await sentiment_analyzer.analyze(instrument)
        
        return MarketAnalysis(
            instrument=instrument,
            timeframe=timeframe,
            price=analysis["price"],
            technical_indicators=analysis["indicators"],
            sentiment=sentiment["label"],
            summary=analysis["summary"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))