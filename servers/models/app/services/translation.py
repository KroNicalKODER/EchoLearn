from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate

llama = OllamaLLM(model="llama3.2")

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

    formatted = prompt.format_messages(
        from_language=from_language,
        to_language=to_language,
        text=text
    )

    response = llama.invoke(formatted)
    return response
