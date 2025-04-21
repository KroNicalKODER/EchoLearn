from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:5173"])

    from app.routes import register_routes
    register_routes(app)

    return app
