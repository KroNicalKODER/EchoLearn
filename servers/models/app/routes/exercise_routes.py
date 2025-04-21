from flask import Blueprint, request, jsonify
from app.services.wikipedia_news import get_external_info
from app.services.llama_model import generate_random_exercise

exercise_bp = Blueprint('exercise', __name__)

@exercise_bp.route('/generate_random_exercise', methods=['POST'])
def generate_random_exercise_route():
    data = request.get_json()
    topic = data.get('topic')
    tone = data.get('tone')
    score = data.get('score')
    custom = data.get('custom')

    if not topic or not tone or not score or not custom:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        external_info = get_external_info(custom)
        response = generate_random_exercise(topic, tone, score, custom, external_info)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
