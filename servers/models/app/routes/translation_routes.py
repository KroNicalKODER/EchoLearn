from flask import Blueprint, request, jsonify
from concurrent.futures import ThreadPoolExecutor
from app.services.translation import translate

translation_bp = Blueprint('translation', __name__)
executor = ThreadPoolExecutor(max_workers=5)

@translation_bp.route('/translate', methods=['POST'])
def translate_route():
    data = request.get_json()
    from_language = data.get('from_language')
    to_language = data.get('to_language')
    text = data.get('text')

    if not from_language or not to_language or not text:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        future = executor.submit(translate, from_language, to_language, text)
        result = future.result()
        return jsonify({"response": result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
