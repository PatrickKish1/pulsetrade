from typing import Dict, Any, List
import pandas as pd
import numpy as np
from transformers import pipeline
from app.core.settings import settings
from app.services.market_analysis import MarketAnalyzer
from app.services.sentiment_analysis import SentimentAnalyzer

class TradeSignalGenerator:
    def __init__(self):
        self.market_analyzer = MarketAnalyzer()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.llm = pipeline(
            "text-generation",
            model="TuringTrader/llama-2-finance-7b",
            max_length=512
        )

    async def generate(self, instrument: str) -> Dict[str, Any]:
        """
        Generate trading signals based on technical and sentiment analysis.
        """
        try:
            # Get market analysis
            market_data = await self.market_analyzer.analyze(instrument, "1d")
            sentiment_data = await self.sentiment_analyzer.analyze(instrument)
            
            # Calculate trade parameters
            signal = await self._generate_trade_signal(
                instrument,
                market_data,
                sentiment_data
            )
            
            return signal
            
        except Exception as e:
            raise Exception(f"Trade signal generation failed: {str(e)}")

    async def _generate_trade_signal(
        self,
        instrument: str,
        market_data: Dict[str, Any],
        sentiment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate specific trade parameters based on analysis.
        """
        indicators = market_data["indicators"]
        current_price = market_data["price"]
        
        # Calculate trade direction
        direction = self._determine_direction(indicators, sentiment_data)
        
        # Calculate position size based on volatility
        atr = self._calculate_atr(current_price, indicators)
        position_size = self._calculate_position_size(current_price, atr)
        
        # Set take profit and stop loss levels
        take_profit, stop_loss = self._calculate_exit_points(
            direction,
            current_price,
            atr
        )
        
        # Generate reasoning using LLM
        reasoning = await self._generate_reasoning(
            instrument,
            direction,
            market_data,
            sentiment_data
        )
        
        return {
            "instrument": instrument,
            "direction": direction,
            "entry_price": current_price,
            "take_profit": take_profit,
            "stop_loss": stop_loss,
            "lot_size": position_size,
            "reasoning": reasoning
        }

    def _determine_direction(
        self,
        indicators: Dict[str, float],
        sentiment: Dict[str, Any]
    ) -> str:
        """
        Determine trade direction based on technical and sentiment indicators.
        """
        # Technical signals
        technical_score = 0
        
        # Trend analysis
        if indicators["sma_20"] > indicators["sma_50"]:
            technical_score += 1
        else:
            technical_score -= 1
            
        # RSI analysis
        if indicators["rsi"] < 30:
            technical_score += 1
        elif indicators["rsi"] > 70:
            technical_score -= 1
            
        # MACD analysis
        if indicators["macd"] > 0:
            technical_score += 1
        else:
            technical_score -= 1
            
        # Volume analysis
        if indicators["volume_ratio"] > 1.2:
            technical_score += 1
            
        # Sentiment contribution
        if sentiment["label"] == "positive":
            technical_score += 1
        elif sentiment["label"] == "negative":
            technical_score -= 1
            
        return "buy" if technical_score > 0 else "sell"

    def _calculate_atr(
        self,
        current_price: float,
        indicators: Dict[str, float]
    ) -> float:
        """
        Calculate Average True Range for volatility-based sizing.
        """
        volatility = abs(indicators["bollinger_upper"] - indicators["bollinger_lower"]) / current_price
        return current_price * volatility * 0.1

    def _calculate_position_size(
        self,
        current_price: float,
        atr: float
    ) -> float:
        """
        Calculate position size based on volatility and risk parameters.
        """
        risk_per_trade = 0.02  # 2% risk per trade
        return round(risk_per_trade * current_price / atr, 8)

    def _calculate_exit_points(
        self,
        direction: str,
        current_price: float,
        atr: float
    ) -> tuple[float, float]:
        """
        Calculate take profit and stop loss levels.
        """
        if direction == "buy":
            take_profit = current_price + (atr * 3)
            stop_loss = current_price - (atr * 1.5)
        else:
            take_profit = current_price - (atr * 3)
            stop_loss = current_price + (atr * 1.5)
            
        return round(take_profit, 8), round(stop_loss, 8)

    async def _generate_reasoning(
        self,
        instrument: str,
        direction: str,
        market_data: Dict[str, Any],
        sentiment_data: Dict[str, Any]
    ) -> List[str]:
        """
        Generate reasoning for the trade signal using LLM.
        """
        prompt = f"""
        Analyze the following trading data and provide 3 key reasons for a {direction} trade on {instrument}:
        
        Technical Indicators:
        - Price: {market_data['price']}
        - RSI: {market_data['indicators']['rsi']}
        - MACD: {market_data['indicators']['macd']}
        - Volume Ratio: {market_data['indicators']['volume_ratio']}
        
        Market Sentiment: {sentiment_data['label']}
        Market Summary: {market_data['summary']}
        """
        
        response = self.llm(prompt)[0]['generated_text']
        
        # Parse response into discrete reasons
        reasons = [
            reason.strip()
            for reason in response.split('\n')
            if reason.strip() and not reason.strip().startswith('-')
        ][:3]
        
        return reasons