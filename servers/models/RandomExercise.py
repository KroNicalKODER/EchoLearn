from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate

llama = OllamaLLM(model="llama3.2")

def generate_random_exercise(topic, tone, score, custom, external_info):
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert language teacher give an abstract as a random exercise to a person on the topic of {topic} and in a {tone} tone.
            Remember this is abstract is for the reading exercise.
            Just generate the abstract for the reading and nothing else. Also, if the topic or tone is out of the context then just say "I don't know".
            The abstract should be approximately of 500 words.
            Generate in the following format:
            
            Abstract: << GENERATE THE ABSTRACT HERE >>
         
            The more information and news about this topic is: {external_info}
         
            Please do not generate the abstract if you don't know the answer. And also please don't generate in another format.
        """),
        ("user", "{custom}"),
    ])

    prompt = prompt.format_messages(topic = topic, tone = tone, current_score = score, custom = custom, external_info = external_info)

    response = llama.invoke(
        prompt
    )

    return response

def translate(from_language, to_language, text):
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You need to provide a word-by-word translation of the given Hindi text into English.
                Give the simplest possible meaning of each word so that the user can easily understand.
                Use important words in additional example sentences to show their correct usage.
                Do not translate the full sentence, only provide word-by-word meanings and examples.
                Write as if a person is explaining to another person, keeping it natural and conversational.
                Use only Hindi while explaining, since the user has limited English knowledge.
                This is meant for direct frontend use, so it should not sound like an AI-generated response.
                Text: {text}
         """),
    ])

    prompt = prompt.format_messages(from_language = from_language, to_language = to_language, text = text)

    response = llama.invoke(
        prompt
    )
    return response

