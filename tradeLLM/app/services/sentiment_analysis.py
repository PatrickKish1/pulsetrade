import aiohttp
import feedparser
import asyncio
from typing import Dict, Any, List
from transformers import pipeline
from app.core.settings import settings
import xml.etree.ElementTree as ET

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_model = pipeline(
            "text-classification",
            model=settings.SENTIMENT_MODEL,
            max_length=512
        )
        self.rss_feeds = [
            "https://cointelegraph.com/rss",
            "https://bitcoinmagazine.com/.rss/full/",
            "https://feeds.feedburner.com/CoinDesk",
            "https://cryptonews.com/news/feed/",
        ]

    async def analyze(self, instrument: str) -> Dict[str, Any]:
        """
        Analyze sentiment for a given instrument using RSS feeds.
        """
        try:
            # Fetch news articles
            news_articles = await self._fetch_news(instrument)
            
            # Analyze sentiment for each article
            sentiments = []
            for article in news_articles:
                sentiment = self.sentiment_model(article['title'] + " " + article.get('description', ''))
                sentiments.append({
                    'label': sentiment[0]['label'],
                    'score': sentiment[0]['score']
                })
            
            # Aggregate sentiment
            return self._aggregate_sentiment(sentiments)
            
        except Exception as e:
            raise Exception(f"Sentiment analysis failed: {str(e)}")

    async def _fetch_news(self, instrument: str) -> List[Dict[str, str]]:
        """
        Fetch recent news articles about the instrument from RSS feeds.
        """
        articles = []
        
        async def fetch_feed(feed_url):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(feed_url) as response:
                        if response.status == 200:
                            content = await response.text()
                            feed = feedparser.parse(content)
                            
                            # Filter articles related to the instrument
                            relevant_entries = [
                                {
                                    'title': entry.title,
                                    'description': entry.get('description', ''),
                                    'published': entry.get('published', '')
                                }
                                for entry in feed.entries
                                if instrument.lower() in entry.title.lower()
                                or instrument.lower() in entry.get('description', '').lower()
                            ][:5]  # Limit to 5 most recent relevant articles
                            
                            articles.extend(relevant_entries)
            except Exception as e:
                print(f"Error fetching feed {feed_url}: {str(e)}")

        # Fetch from all feeds concurrently
        await asyncio.gather(*[fetch_feed(feed) for feed in self.rss_feeds])
        
        return articles[:10]  # Return up to 10 most recent articles

    def _aggregate_sentiment(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate multiple sentiment scores into a single result.
        """
        if not sentiments:
            return {"label": "neutral", "score": 0.5}
        
        sentiment_counts = {
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }
        
        total_score = 0
        
        for sentiment in sentiments:
            sentiment_counts[sentiment['label']] += 1
            total_score += sentiment['score']
        
        dominant_sentiment = max(sentiment_counts.items(), key=lambda x: x[1])[0]
        average_score = total_score / len(sentiments)
        
        return {
            "label": dominant_sentiment,
            "score": average_score
        }