from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Trading LLM API"
    PROJECT_DESCRIPTION: str = "A comprehensive trading analysis and signal generation API"
    
    # API Keys
    HUGGINGFACE_API_KEY: str
    GROQ_API_KEY: str
    
    # Model Settings
    SENTIMENT_MODEL: str = "FinanceInc/finbert_fls"
    SUMMARY_MODEL: str = "human-centered-summarization/financial-summarization-pegasus"
    
    # Hyperliquid Settings
    HYPERLIQUID_NETWORK: str = "mainnet"
    
    class Config:
        env_file = ".env"

settings = Settings()