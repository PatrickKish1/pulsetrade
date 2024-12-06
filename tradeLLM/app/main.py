# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import numpy as np
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from datetime import datetime
import yfinance as yf
import requests
from typing import Literal
import os
from groq import Groq
from hyperliquid.info import Info
from hyperliquid.utils import constants

app = FastAPI(title="Trading LLM Backend")

# Initialize models
finbert_sentiment = pipeline("text-classification", 
                           model="FinanceInc/finbert_fls",
                           max_length=512)

summarizer = pipeline("summarization", 
                     model="human-centered-summarization/financial-summarization-pegasus",
                     max_length=128)

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
hyperliquid_info = Info(constants.MAINNET_API_URL, skip_ws=True)

# Pydantic models
class UserIdentity(BaseModel):
    risk_level: str = Field(..., description="User's risk tolerance level")
    token_preferences: str = Field(..., description="User's preferred tokens/assets")
    mission_statement: str = Field(..., description="User's trading goals")
    wallet_address: Optional[str] = Field(None, description="User's wallet address")

class TradeSignal(BaseModel):
    instrument: str
    direction: Literal["buy", "sell"]
    take_profit: float
    stop_loss: float
    lot_size: float
    reasoning: List[str]
    confidence_score: float

class MarketAnalysisRequest(BaseModel):
    instrument: str
    timeframe: str = "1d"
    analysis_type: Literal["technical", "sentiment", "fundamental"] = "technical"

# Endpoints
@app.post("/analyze_market")
async def analyze_market(request: MarketAnalysisRequest):
    try:
        # Fetch market data
        ticker = yf.Ticker(request.instrument)
        hist = ticker.history(period=request.timeframe)
        
        # Basic technical analysis
        current_price = hist['Close'].iloc[-1]
        sma_20 = hist['Close'].rolling(window=20).mean().iloc[-1]
        rsi = calculate_rsi(hist['Close'])
        
        # Get news sentiment
        news = get_latest_news(request.instrument)
        sentiment_results = finbert_sentiment(news)
        
        # Summarize analysis
        analysis_text = f"""
        Current price: {current_price}
        20-day SMA: {sma_20}
        RSI: {rsi}
        Market sentiment: {sentiment_results[0]['label']}
        """
        
        summary = summarizer(analysis_text)[0]['summary_text']
        
        return {
            "instrument": request.instrument,
            "analysis": summary,
            "technical_indicators": {
                "price": current_price,
                "sma_20": sma_20,
                "rsi": rsi
            },
            "sentiment": sentiment_results[0]['label']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_trade_signal")
async def generate_trade_signal(instrument: str):
    try:
        # Fetch market data and perform analysis
        analysis = await analyze_market(MarketAnalysisRequest(instrument=instrument))
        
        # Generate trading decision using Groq
        prompt = f"""
        Based on the following market analysis, provide a detailed trading decision with specific entry, take profit, and stop loss levels.
        
        Analysis: {analysis}
        
        Follow these steps for decision making:
        1. Evaluate current market trend
        2. Analyze key support/resistance levels
        3. Consider market sentiment
        4. Assess risk/reward ratio
        5. Determine position sizing
        
        Provide specific reasoning for the trade decision.
        """
        
        completion = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {"role": "system", "content": "You are a professional trader providing detailed trade analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        
        # Process the response and extract trade parameters
        response = completion.choices[0].message.content
        
        # Here you would parse the response to extract specific trade parameters
        # This is a simplified example
        trade_signal = TradeSignal(
            instrument=instrument,
            direction="buy" if analysis['technical_indicators']['price'] > analysis['technical_indicators']['sma_20'] else "sell",
            take_profit=analysis['technical_indicators']['price'] * 1.02,
            stop_loss=analysis['technical_indicators']['price'] * 0.98,
            lot_size=0.01,
            reasoning=response.split("\n"),
            confidence_score=0.75
        )
        
        return trade_signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/onchain_analysis")
async def onchain_analysis(wallet_address: str):
    try:
        user_state = hyperliquid_info.user_state(wallet_address)
        
        # Process user state and generate analysis
        available_balance = user_state.get('withdrawable')
        positions = user_state.get('assetPositions', [])
        
        position_analysis = []
        for position in positions:
            pos = position.get('position', {})
            analysis = {
                "asset": pos.get('coin'),
                "size": pos.get('szi'),
                "value": pos.get('positionValue'),
                "pnl": pos.get('unrealizedPnl'),
                "leverage": pos.get('leverage', {}).get('value')
            }
            position_analysis.append(analysis)
            
        return {
            "available_balance": available_balance,
            "positions": position_analysis,
            "risk_analysis": analyze_portfolio_risk(position_analysis)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user_profile")
async def create_user_profile(user: UserIdentity):
    try:
        # Process user identity and generate profile
        profile_prompt = f"""
        Create a trading profile based on:
        Risk level: {user.risk_level}
        Token preferences: {user.token_preferences}
        Mission statement: {user.mission_statement}
        """
        
        completion = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {"role": "system", "content": "You are a professional trading advisor creating personalized trading profiles."},
                {"role": "user", "content": profile_prompt}
            ]
        )
        
        return {
            "profile": completion.choices[0].message.content,
            "risk_score": calculate_risk_score(user.risk_level),
            "recommended_assets": generate_asset_recommendations(user.token_preferences)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Utility functions
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs)).iloc[-1]

def get_latest_news(instrument: str) -> List[str]:
    # Implement news fetching logic here
    # This is a placeholder
    return [f"Latest news for {instrument}"]

def analyze_portfolio_risk(positions: List[Dict]):
    # Implement risk analysis logic
    total_exposure = sum(abs(float(p['value'])) for p in positions)
    max_leverage = max(float(p['leverage']) for p in positions if p['leverage'])
    return {
        "total_exposure": total_exposure,
        "max_leverage": max_leverage,
        "risk_level": "high" if max_leverage > 10 else "moderate" if max_leverage > 5 else "low"
    }

def calculate_risk_score(risk_level: str) -> float:
    risk_mapping = {
        "low": 0.3,
        "moderate": 0.6,
        "high": 0.9
    }
    return risk_mapping.get(risk_level.lower(), 0.5)

def generate_asset_recommendations(preferences: str) -> List[str]:
    # Implement asset recommendation logic
    # This is a placeholder
    return ["BTC", "ETH", "USDT"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)