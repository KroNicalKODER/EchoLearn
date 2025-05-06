import os
import io
import shutil
import time
import subprocess
from flask import jsonify
from gtts import gTTS
from pydub import AudioSegment
import soundfile as sf
import speech_recognition as sr

UPLOAD_FOLDER = 'uploads'
UPLOADS1_FOLDER = 'uploads1'

def process_audio_files(request):
    if 'audio' not in request.files or 'text' not in request.files:
        return jsonify({"error": "Audio or text file missing"}), 400
    audio_file = request.files['audio']
    text_file = request.files['text']
    
    audio_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    text_path = os.path.join(UPLOAD_FOLDER, text_file.filename)
    text1_path = os.path.join(UPLOADS1_FOLDER, text_file.filename.replace('.txt', '1.txt'))

    audio_file.save(audio_path)
    text_file.save(text_path)

    with open(text_path) as f:
        content = f.read()
    with open(text1_path, 'w') as f:
        f.write(content)

    try:
        with sf.SoundFile(audio_path) as f:
            pass
    except:
        audio = AudioSegment.from_file(audio_path)
        audio.export(audio_path, format="wav")

    tts = gTTS(text=content, lang='en')
    generated_audio_path = os.path.join(UPLOADS1_FOLDER, os.path.splitext(text_file.filename)[0] + '1.wav')
    tts.save(generated_audio_path)
    AudioSegment.from_mp3(generated_audio_path).export(generated_audio_path, format="wav")

    try:
        subprocess.run(['mfa', 'align', '--clean', UPLOAD_FOLDER, 'english_us_arpa', 'english_us_arpa', '../backend/utils/textGridToJSON/'], check=True)
        subprocess.run(['mfa', 'align', '--clean', UPLOADS1_FOLDER, 'english_us_arpa', 'english_us_arpa', '../backend/utils/textGridToJSON/'], check=True)
        return jsonify({"success": "true", "message": "Processing complete"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)}), 500

def transcribe_audio_file(request):
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))

    with io.BytesIO() as wav_io:
        audio.export(wav_io, format="wav")
        wav_io.seek(0)
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data)
                return jsonify({'transcription': transcription})
            except sr.UnknownValueError:
                return jsonify({'error': 'Could not understand audio'}), 400
            except sr.RequestError as e:
                return jsonify({'error': str(e)}), 500
