import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import config from "../config"; // Your configuration for API base URLs

const Aitutor = () => {
  const [transcribedText, setTranscribedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [UIMessages, setUIMessages] = useState([]);

  const recognitionRef = useRef(null);
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscribedText(finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition has ended");
        setIsRecording(false);
      };
    } else {
      alert("Speech recognition not supported in your browser.");
    }
  }, []);

  const getAndPlayAudio = async (text) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:5002/get_audio`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          responseType: "blob",
        }
      );
      console.log(response);
      const audioBlob = new Blob([response.data], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
      audioElement.onended = () => {
        console.log("Audio playback has ended");
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const handleStartStopRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const newMeBlock = (text) => {
    return (
      <div className="chat chat-end">
        <div className="chat-bubble max-w-[70%]">{text}</div>
        <span onClick={() => getAndPlayAudio(text)} className="cursor-pointer">
          <i className="bi bi-volume-up-fill"></i>
        </span>
      </div>
    );
  };

  const newAIBlock = (text) => {
    return (
      <div className="chat chat-start">
        <div className="chat-bubble max-w-[70%]">{text}</div>
        <span onClick={() => getAndPlayAudio(text)} className="cursor-pointer">
          <i className="bi bi-volume-up-fill"></i>
        </span>
      </div>
    );
  };

  const getAIResponse = useCallback(
    async (text) => {
      text = text.trim();
      if (text === "") return;
      try {
        setUIMessages((prev) => [...prev, newMeBlock(text)]);
        console.log(text);
        const response = await axios.post(
          `http://127.0.0.1:5002/chat`,
          { query: text },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        console.log(response);
        getAndPlayAudio(response.data.response);
        setUIMessages((prev) => [...prev, newAIBlock(response.data.response)]);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    },
    [UIMessages]
  );

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div className="w-full h-[calc(100vh-240px)] overflow-y-auto">
        {UIMessages.map((message, index) => message)}
      </div>
      <textarea
        value={transcribedText}
        onChange={(e) => setTranscribedText(e.target.value)}
        placeholder="Type or speak here"
        rows="1"
        cols="50"
        className="w-full mt-2 border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)] mb-4"
      />
      <div className="flex gap-2">
        <button
          onClick={handleStartStopRecording}
          className="text-sm w-[150px] text-white px-3 py-2 rounded-xs bg-red-500 cursor-pointer"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>

        <button
          onClick={() => getAIResponse(transcribedText)}
          className="text-sm w-[150px] text-white px-3 py-2 rounded-xs bg-red-500 cursor-pointer"
        >
          {loading ? "Loading..." : "Get Response"}
        </button>
      </div>
    </div>
  );
};

export default Aitutor;
