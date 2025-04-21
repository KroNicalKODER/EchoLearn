import wikipediaapi
from newsapi import NewsApiClient
import os

def get_external_info(custom):
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")

    wiki_wiki = wikipediaapi.Wikipedia(user_agent='EchoLearn (mradul@gmail.com)', language='en')
    page = wiki_wiki.page(custom)
    summary = page.summary[:2000] if page.exists() else "No external information found."

    newsapi = NewsApiClient(api_key=NEWS_API_KEY)
    latest_news = newsapi.get_top_headlines(q=custom, language='en')

    news_text = "\n\nLatest News:\n"
    for article in latest_news['articles']:
        news_text += f"{article['source']['name']} - {article['title']} - {article['description']}\n\n"

    return summary + news_text
