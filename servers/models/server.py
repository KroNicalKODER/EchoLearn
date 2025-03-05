from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from RandomExercise import generate_random_exercise, translate
import wikipediaapi
from newsapi import NewsApiClient
from dotenv import load_dotenv
from flask import Flask, request, send_file
import speech_recognition as sr
from pydub import AudioSegment
import io
import os
import subprocess
import time
import soundfile as sf
from pydub import AudioSegment
import tempfile
from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
UPLOADS1_FOLDER = 'uploads1'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)
if not os.path.exists(UPLOADS1_FOLDER):
    os.makedirs(UPLOADS1_FOLDER)
if not os.path.exists('static'):
    os.makedirs('static')


load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "*"])

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

    # print('hello' + external_info)

    try:
        response = generate_random_exercise(topic, tone, score, custom, external_info)
        return jsonify({"response": response}), 200
    
    except Exception as e:
        print("error ",e)
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
    
import tempfile
from gtts import gTTS
import shutil

@app.route('/process-audio', methods=['POST'])
def process_audio():
    print("Processing audio")
    
    # Ensure the 'audio' and 'text' files are provided
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    if 'text' not in request.files:
        return jsonify({"error": "No text file provided"}), 400

    # Get the uploaded files
    audio_file = request.files['audio']
    text_file = request.files['text']

    # Ensure the uploaded audio and text files are not empty
    if audio_file.filename == '' or text_file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save audio and text files to the upload folder
    audio_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    text_path = os.path.join(UPLOAD_FOLDER, text_file.filename)
    text1_path = os.path.join(UPLOADS1_FOLDER, text_file.filename.split('.')[0] + '1.txt')

    try:
        # Save the files
        audio_file.save(audio_path)
        text_file.save(text_path)
        
        with open(text_path, 'r') as original_text:
            content = original_text.read()

    # Modify content here if needed, or just write the same content to the new file
        with open(text1_path, 'w') as new_text:
            new_text.write(content)

        # Check if the uploaded audio file is a valid .wav file
        try:
            with sf.SoundFile(audio_path) as f:
                pass  # If no exception occurs, the file is valid
        except Exception as e:
            # If it's not a valid .wav, attempt to convert it to a valid .wav file
            print("Audio file is not valid, converting it...")
            converted_audio_path = os.path.splitext(audio_path)[0] + '.wav'
            try:
                # Use pydub to convert to .wav
                audio = AudioSegment.from_file(audio_path)
                audio.export(converted_audio_path, format="wav")
                audio_path = converted_audio_path  # Update the path to the converted audio
            except Exception as conversion_error:
                return jsonify({"error": f"Error converting audio: {str(conversion_error)}"}), 500

        # Convert the text file content to speech (using gTTS)
        with open(text_path, 'r') as f:
            text_content = f.read()

        # Generate the audio from text using gTTS
        tts = gTTS(text=text_content, lang='en', slow=False)
        generated_audio_path = os.path.join(UPLOADS1_FOLDER, os.path.splitext(text_file.filename)[0] + '1.wav')
        
        # Save generated speech to a .wav file
        tts.save(generated_audio_path)

        # Convert the saved MP3 to WAV using pydub (since gTTS saves as MP3)
        try:
            audio = AudioSegment.from_mp3(generated_audio_path)
            audio.export(generated_audio_path, format="wav")
        except Exception as conversion_error:
            return jsonify({"error": f"Error converting gTTS audio to WAV: {str(conversion_error)}"}), 500

        # Now, run MFA on both the original audio (from UPLOADS) and the generated audio (from UPLOADS1)
        try:
            subprocess.run(
                [
                    'mfa', 'align', '--clean', UPLOAD_FOLDER, 'english_us_arpa', 'english_us_arpa', '../backend/utils/textGridToJSON/'
                ],
                check=True
            )

            subprocess.run(
                [
                    'mfa', 'align', '--clean', UPLOADS1_FOLDER, 'english_us_arpa', 'english_us_arpa', '../backend/utils/textGridToJSON/'
                ],
                check=True
            )

            success = "true"
            return jsonify({"success": success, "message": "Audio processing and alignment completed!"})

        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Error processing audio with MFA: {e}"}), 500
        except Exception as e:
            return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error saving files: {str(e)}"}), 500

@app.route('/transcribe-audio', methods=['POST'])
def transcribe_audio():
    # Check if the audio file is part of the request
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    audio_content = audio_file.read()

    # Initialize the recognizer
    recognizer = sr.Recognizer()

    # Convert the audio to WAV format using pydub
    try:
        # Load the audio into pydub AudioSegment
        audio = AudioSegment.from_file(io.BytesIO(audio_content))

        # Export the audio as WAV
        with io.BytesIO() as wav_file:
            audio.export(wav_file, format="wav")
            wav_file.seek(0)  # Move the cursor to the beginning of the file
            # Now, the WAV file is ready to be processed by SpeechRecognition
            with sr.AudioFile(wav_file) as source:
                # Record the audio data from the file
                audio_data = recognizer.record(source)

        # Use Google Web Speech API for transcription (online method)
        transcription = recognizer.recognize_google(audio_data)
        return jsonify({'transcription': transcription})

    except sr.UnknownValueError:
        return jsonify({'error': 'Could not understand audio'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f"Could not request results from Google Speech Recognition service; {e}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
llama = OllamaLLM(model="llama3.2")

@app.route('/generate-response', methods=['POST'])
def generate_response():
    data = request.get_json()
    input_text = data.get("text", "")

    print(input_text)

    if not input_text:
        return jsonify({"error": "No text provided"}), 400

    # Define a basic prompt template for conversation
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful assistant. you have to provide me with the response to the questions you are being asked. 
         Try to be as helpful as possible. Also don't be exaggerated with your answers. Try to be normal and human-like. Also
         restrict you answers to 100 words maximum."""),
        ("user", input_text)
    ])

    formatted_prompt = prompt.format(messages=[("user", input_text)])

    # Generate the response from Llama 3.2 via LangChain
    response = llama.invoke(formatted_prompt)
    print(response)

    if not response:
        return jsonify({"error": "No response generated from Llama model"}), 500

    # Convert the generated text to speech (audio)
    tts = gTTS(response)

    # Clear the static folder
    for filename in os.listdir('static'):
        file_path = os.path.join('static', filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            return jsonify({"error": f"Failed to clear static folder: {str(e)}"}), 500

    # Save the file with a different name every time
    audio_filename = f"response_audio_{int(time.time())}.mp3"
    audio_path = os.path.join('static', audio_filename)
    tts.save(audio_path)

    # Return the path to the audio file (frontend will fetch this URL)
    return jsonify({"audio_url": f"/static/{audio_filename}"})

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
        app.run(debug=True)

