import langchain_community.chat_message_histories
import dotenv
import os
import groq
from tavily import TavilyClient
from typing import List, Dict, Any


dotenv.load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")


class AITutor:
    def __init__(self, model_name, temperature=0.7):

        self.groq_client = groq.Groq(api_key=groq_api_key)
        self.tavily_client = TavilyClient(api_key=tavily_api_key)
        self.history_chain = langchain_community.chat_message_histories.ChatMessageHistory()
        self.model_name = model_name
        self.temperature = temperature

        self.prompt_agent_1 = """You are a conversational BOT now, you are responsible to converse with
        the user and if you don't have the context of the question or the conversation then write exactly
        idkya and break the query by the user into 3 sub_queries which would be further used for scraping the internet
        So, follow this format if you don't know the context.
        idkya:
        <<<sub_query_1>>>
        <<<sub_query_2>>>
        <<<sub_query_3>>>
        Like this. And if you know the context then just answer the question.
        Remember, you have to break the query for web searches only as the subqueries are for web searches and 
        only when the web search is necessary if the user is introducing or telling you something then dont write idkya.
        Query: {query}
        History: {history}
        So, as a conclusion, if you can answer the question on your own then dont write idkya.
        example:
        User: Hello, how are you?
        You: I am fine, thank you.
        User: What is new news in Kashmir?
        You: idkya:
        <<<sub_query_1>>>
        <<<sub_query_2>>>
        <<<sub_query_3>>>
        """

        self.prompt_agent_2 = """
            Here is the context of the conversation along with the query of the user.
            Context: {context}
            Query: {query}
            History: {history}
            Now, you are responsible to answer the question based on the context.
        """

        # Memory maker or history shortner
        self.prompt_agent_3 = """
            Here is the history of the conversation.
            History: {history}
            Now, you are responsible to make the history short.
            Make the history as short as possible and as informative as possible. This history would be
            saved as memort and only be retrieved when the user asks for it.
        """

        # making the memory if any
        self.prompt_agent_4 = """
            You are a memory maker which is responsible to make memory for the conversation which are stored in a file
            for the future reference. Provided the history make the memory of the conversation.
            If there is nothing special to make the memory then just say "no memory". Else give the memory in 3-4 lines.
            History: {history}
            Query: {query}
            if there is memory then write in this format:
            Memory:
            <<<memory_1>>>
            <<<memory_2>>>
            <<<memory_3>>>
            Like this.
            if there is no memory then just say "no memory".
        """

        self.report_prompt = """
            You are a professional communication and language improvement expert.

            Analyze the following conversation and provide a structured output.

            The output should include:
            1. Fluency Score (out of 10).
            2. Fluency Observations.
            3. Tone Detection (type and consistency).
            4. Vocabulary Enhancement Suggestions (original, suggestion, reason).
            5. Sentence Structure Improvements (original, suggestion).
            6. Clarity and Conciseness Enhancements (original, suggestion).
            7. Impactful Language Suggestions (original, suggestion).
            8. Grammar and Punctuation Corrections (original, correction).
            9. Professional/Academic Style Adjustments (original, suggestion).
            10. Final Overall Remarks.

            Format your response as a JSON object with clear section titles.

            Here is the conversation:
            ---
            {conversation_text}
            ---
        """

    def first_agent(self, query: str, history: str) -> str:
        """This function is responsible to break the query into 3 sub_queries if there is no context.
            And if there is context then it will return the answer to the question."""
                
        response = self.groq_client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.prompt_agent_1.format(query = query, history = history)},
                {"role": "user", "content": query}
            ],
        )

        print("Agent 1 has finished responsing with response: ", response.choices[0].message.content)

        return response.choices[0].message.content;

    def break_response_to_sub_queries(self, response: str) -> List[str]:
        """This function is responsible to break the response into 3 sub_queries."""

        sub_queries = []
        response_model = response.split("idkya:")[1:]
        lines = response_model[0].split("\n")
        for line in lines:
        # Check if line contains a sub-query
            if line.startswith('<<<') and line.endswith('>>>'):
                # Extract the query between <<< and >>>
                query = line[3:-3].strip()
                sub_queries.append(query)
        return sub_queries
    
    def web_scraper(self, sub_queries: List[str]) -> List[str]:
        """This function is responsible to scrape the data from the internet."""
        combined_content = ""
        for sub_query in sub_queries:
            initial_search = self.tavily_client.search(query = sub_query, search_depth = "advanced")
            top_sources = initial_search.get("results", [])[:3]
            combined_content = "\n\n".join([
                source.get("content", "") for source in top_sources if source.get("content")
            ])

        print("Web scraper has finished scraping with response: ", combined_content)
        
        return combined_content
    
    def second_agent(self, context: str, query: str, history: str) -> str:
        """This function is responsible to answer the question based on the context, if not answered by first one."""

        response = self.groq_client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.prompt_agent_2.format(context = context, query = query, history = history)},
                {"role": "user", "content": query}
            ],
        )

        print("Agent 2 has finished responsing with response: ", response.choices[0].message.content)

        return response.choices[0].message.content
    
    def third_agent(self, history: str) -> str:
        """This function is responsible to make the history short."""

        response = self.groq_client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.prompt_agent_3.format(history = history)},
                {"role": "user", "content": history}
            ],
        )

        print("Agent 3 has finished responsing with response: ", response.choices[0].message.content)

        return response.choices[0].message.content
    
    def fourth_agent(self, history: str, query: str) -> str:
        """This function is responsible to make the memory."""

        response = self.groq_client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "system", "content": self.prompt_agent_4.format(history = history, query = query)}],
        )

        print("Agent 4 has finished responsing with response: ", response.choices[0].message.content)

        return response.choices[0].message.content
    
    
    def run(self, query: str) -> str:
        """Holding the conversation and combining all the agents."""

        response = self.first_agent(query, self.history_chain.messages)
        answer = ""
        memory = ""
        if("idkya" in response):
            sub_queries = self.break_response_to_sub_queries(response)
            context = self.web_scraper(sub_queries)
            answer = self.second_agent(context, query, self.history_chain.messages)
            
        else:
            answer = self.second_agent(response, query, self.history_chain.messages)

        self.history_chain.add_message({"query":query, "answer":answer})
        if (len(self.history_chain.messages) > 5):
            short_history = self.third_agent(self.history_chain.messages)
            self.history_chain.clear()
            self.history_chain.add_message(short_history)
            memory = self.fourth_agent(self.history_chain.messages, query)

        if(memory != "no memory" and memory != ""):
            with open("memory.txt", "a") as f:
                f.write(memory)

        return answer
    
    def text_to_speech(self, text: str) -> str:
        speech_file_path = "speech.wav" 

        response = self.groq_client.audio.speech.create(
            model="playai-tts",
            voice="Briggs-PlayAI",
            input=text,
            response_format="wav"
        )

        response.write_to_file(speech_file_path)
        return speech_file_path
    
    def generate_conversation_report(self) -> str:
        """This function is responsible to generate the conversation report."""
        conversation = self.history_chain.messages
        response = self.groq_client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "system", "content": self.report_prompt.format(conversation_text = conversation)}],
            response_format={"type": "json_object"}
        )

        return response.choices[0].message.content

session = AITutor(model_name="llama3-70b-8192", temperature=0.7)
