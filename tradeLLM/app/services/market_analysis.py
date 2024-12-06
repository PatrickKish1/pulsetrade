import yfinance as yf
import numpy as np
import pandas as pd
from typing import Dict, Any
from transformers import pipeline
from app.core.settings import settings

class MarketAnalyzer:
    def __init__(self):
        self.summarizer = pipeline(
            "summarization",
            model=settings.SUMMARY_MODEL,
            max_length=128
        )

    async def analyze(self, instrument: str, timeframe: str) -> Dict[str, Any]:
        """
        Analyze market data for a given instrument.
        
        Args:
            instrument (str): Trading instrument symbol (e.g., "BTC-USD")
            timeframe (str): Time period for analysis (e.g., "1d", "1wk")
            
        Returns:
            Dict containing price, technical indicators, and analysis summary
        """
        try:
            # Fetch market data
            ticker = yf.Ticker(instrument)
            hist = ticker.history(period=timeframe)
            
            if hist.empty:
                raise ValueError(f"No data found for {instrument}")
            
            # Calculate technical indicators
            indicators = self._calculate_indicators(hist)
            
            # Generate analysis summary
            analysis_text = self._generate_analysis_text(instrument, indicators)
            summary = self.summarizer(analysis_text)[0]['summary_text']
            
            return {
                "price": float(hist['Close'].iloc[-1]),
                "indicators": indicators,
                "summary": summary
            }
            
        except Exception as e:
            raise Exception(f"Market analysis failed: {str(e)}")
    
    def _calculate_indicators(self, data: pd.DataFrame) -> Dict[str, float]:
        """Calculate various technical indicators."""
        try:
            # Basic indicators
            sma_20 = data['Close'].rolling(window=20).mean().iloc[-1]
            sma_50 = data['Close'].rolling(window=50).mean().iloc[-1]
            
            # RSI
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs)).iloc[-1]
            
            # MACD
            exp1 = data['Close'].ewm(span=12, adjust=False).mean()
            exp2 = data['Close'].ewm(span=26, adjust=False).mean()
            macd = (exp1 - exp2).iloc[-1]
            
            # Bollinger Bands
            sma_20 = data['Close'].rolling(window=20).mean()
            std_20 = data['Close'].rolling(window=20).std()
            upper_band = (sma_20 + (std_20 * 2)).iloc[-1]
            lower_band = (sma_20 - (std_20 * 2)).iloc[-1]
            
            # Volume analysis
            avg_volume = data['Volume'].mean()
            current_volume = data['Volume'].iloc[-1]
            volume_ratio = current_volume / avg_volume
            
            return {
                "sma_20": float(sma_20),
                "sma_50": float(sma_50),
                "rsi": float(rsi),
                "macd": float(macd),
                "bollinger_upper": float(upper_band),
                "bollinger_lower": float(lower_band),
                "volume_ratio": float(volume_ratio)
            }
            
        except Exception as e:
            raise Exception(f"Indicator calculation failed: {str(e)}")
    
    def _generate_analysis_text(self, instrument: str, indicators: Dict[str, float]) -> str:
        """Generate text description of the analysis."""
        try:
            trends = []
            
            # RSI analysis
            if indicators['rsi'] > 70:
                trends.append(f"{instrument} is currently overbought with RSI at {indicators['rsi']:.2f}")
            elif indicators['rsi'] < 30:
                trends.append(f"{instrument} is currently oversold with RSI at {indicators['rsi']:.2f}")
            
            # Moving average analysis
            if indicators['sma_20'] > indicators['sma_50']:
                trends.append("Short-term trend is bullish with 20-day SMA above 50-day SMA")
            else:
                trends.append("Short-term trend is bearish with 20-day SMA below 50-day SMA")
            
            # Volume analysis
            if indicators['volume_ratio'] > 1.5:
                trends.append("Trading volume is significantly above average")
            elif indicators['volume_ratio'] < 0.5:
                trends.append("Trading volume is significantly below average")
            
            # MACD analysis
            if indicators['macd'] > 0:
                trends.append("MACD indicates positive momentum")
            else:
                trends.append("MACD indicates negative momentum")
            
            return " ".join(trends)
            
        except Exception as e:
            raise Exception(f"Analysis text generation failed: {str(e)}")