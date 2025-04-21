from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate
from flask import request, jsonify
from gtts import gTTS
import os
import time
import shutil
# I am using this model
llama = OllamaLLM(model="llama3.2:1b")

def generate_random_exercise(topic, tone, score, custom, external_info):
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert language teacher give an abstract as a random exercise to a person on the topic of {topic} and in a {tone} tone.
            Remember this abstract is for a reading exercise.
            Just generate the abstract for the reading and nothing else. If the topic or tone is out of the context then just say "I don't know".
            The abstract should be approximately 50 words.
            Generate in the following format:
            
            Abstract: << GENERATE THE ABSTRACT HERE >>
         
            The more information and news about this topic is: {external_info}
         
            Please do not generate the abstract if you don't know the answer. And also please don't generate in another format.
        """),
        ("user", "{custom}"),
    ])

    formatted = prompt.format_messages(
        topic=topic,
        tone=tone,
        current_score=score,
        custom=custom,
        external_info=external_info
    )

    response = llama.invoke(formatted)
    return response


def generate_llama_response(request):
    data = request.get_json()
    input_text = data.get("text", "")

    if not input_text:
        return jsonify({"error": "No text provided"}), 400

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Try to be human-like. Keep your answers under 100 words."),
        ("user", input_text)
    ])

    formatted_prompt = prompt.format(messages=[("user", input_text)])
    response = llama.invoke(formatted_prompt)

    if not response:
        return jsonify({"error": "No response generated"}), 500

    tts = gTTS(response)
    
    # Clear old audio files
    for f in os.listdir('static'):
        os.remove(os.path.join('static', f))

    filename = f"response_audio_{int(time.time())}.mp3"
    audio_path = os.path.join('static', filename)
    tts.save(audio_path)

    return jsonify({"audio_url": f"/static/{filename}"})
