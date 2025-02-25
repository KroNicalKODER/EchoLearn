from flask import Flask, request, jsonify
from flask_cors import CORS
from RandomExercise import generate_random_exercise, translate
import wikipediaapi
from newsapi import NewsApiClient
from dotenv import load_dotenv
import os

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

@app.route('/generate_random_exercise', methods=['POST'])
def generate_random_exercise_route():
    data = request.get_json()
    topic = data.get('topic')
    tone = data.get('tone')
    score = data.get('score')
    custom = data.get('custom')

    # print(topic, tone, score, custom)

    if not topic or not tone or not score or not custom:
        return jsonify({"error": "Missing required parameters"}), 400
    
    # GETTING FROM WIKIPEDIA
    external_info = ""
    wiki_wiki = wikipediaapi.Wikipedia(user_agent='EchoLearn (mradul@gmail.com)', language='en')
    page = wiki_wiki.page(custom)
    if page.exists():
        external_info = page.summary[:2000]
    else:
        external_info = "No external information found."

    ## GETTING FROM NEWS API
    newsapi = NewsApiClient(api_key=NEWS_API_KEY)
    latest_news = newsapi.get_top_headlines(q=custom, language='en', sources='bbc-news,google-news-in,the-hindu,the-times-of-india')

    external_info += "\n\nLatest News:\n"
    for article in latest_news['articles']:
        external_info += f"According to {article['source']['name']} - {article['title']} - {article['description']}\n\n"

    print(external_info)

    try:
        response = generate_random_exercise(topic, tone, score, custom, external_info)
        return jsonify({"response": response}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_route():
    data = request.get_json()
    from_language = data.get('from_language')
    to_language = data.get('to_language')
    text = data.get('text')

    print(from_language, to_language, text)

    if not from_language or not to_language or not text:
        return jsonify({"error": "Missing required Parameters"}), 400
    
    try:
        response = translate(from_language, to_language, text)
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
        app.run(debug=True)

