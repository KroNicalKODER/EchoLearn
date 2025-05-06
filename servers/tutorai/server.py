from flask import Flask, request, jsonify, send_file
import flask_cors
from utils import session

app = Flask(__name__)

# Update CORS configuration
flask_cors.CORS(app, 
    resources={r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }}
)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    query = data['query']
    print(query)
    response = session.run(query = query)
    return jsonify({'response': response})

@app.route("/get_audio", methods=['POST', 'OPTIONS'])
def get_audio():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.json
    text = data.get('text')
    response = session.text_to_speech(text)
    return send_file("speech.wav", mimetype='audio/wav')

@app.route("/generate_conversation_report", methods=['POST'])
def generate_conversation_report():
    data = request.json
    conversation = data.get('conversation')
    report = session.generate_conversation_report()
    return jsonify({'report': report})

@app.route('/')
def index():
    return "Server is running!!!!!!!"

if __name__ == '__main__':
    app.run(debug=True, port=5002)