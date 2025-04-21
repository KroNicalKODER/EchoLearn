from flask import Blueprint, request, jsonify
from app.services.audio_processing import process_audio_files, transcribe_audio_file

audio_bp = Blueprint('audio', __name__)

@audio_bp.route('/process-audio', methods=['POST'])
def process_audio():
    return process_audio_files(request)

@audio_bp.route('/transcribe-audio', methods=['POST'])
def transcribe_audio():
    return transcribe_audio_file(request)
