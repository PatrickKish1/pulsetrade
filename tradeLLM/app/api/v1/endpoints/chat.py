from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import pipeline
from app.core.settings import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    analysis: str
    recommendations: List[str]
    confidence_score: float

@router.post("/analyze", 
    response_model=ChatResponse,
    tags=["Chat Analysis"],
    summary="Analyze financial chat message",
    description="Analyzes a financial chat message and provides insights")
async def analyze_chat(request: ChatRequest):
    try:
        # Initialize financial analysis pipeline
        analyzer = pipeline(
            "text-classification",
            model="FinanceInc/finbert_fls",
            max_length=512
        )
        
        # Analyze the message
        result = analyzer(request.message)[0]
        
        # Generate recommendations based on sentiment
        recommendations = _generate_recommendations(result['label'])
        
        return ChatResponse(
            analysis=f"Message sentiment: {result['label']}",
            recommendations=recommendations,
            confidence_score=float(result['score'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _generate_recommendations(sentiment: str) -> List[str]:
    recommendations = {
        "positive": [
            "Consider maintaining current positions",
            "Look for potential entry points",
            "Monitor market for confirmation"
        ],
        "negative": [
            "Review risk management strategies",
            "Consider reducing exposure",
            "Wait for market stabilization"
        ],
        "neutral": [
            "Continue monitoring market conditions",
            "Review trading plan",
            "Watch for clearer signals"
        ]
    }
    return recommendations.get(sentiment.lower(), recommendations["neutral"])