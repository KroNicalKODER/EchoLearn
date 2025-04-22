from flask import Blueprint, request, jsonify
from app.services.llama_model import generate_llama_response

llama_bp = Blueprint('llama', __name__)

@llama_bp.route('/generate-response', methods=['POST'])
def generate_response():
    return generate_llama_response(request)
