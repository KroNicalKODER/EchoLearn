import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Spectrum } from "../components/Spectrum.jsx";
import config from "../config"; // Your configuration for API base URLs

const Aitutor = () => {
  const [transcribedText, setTranscribedText] = useState("");
  const [responseAudio, setResponseAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  const handleStartStopRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getAIResponse = async (text) => {
    try {
      setLoading(true);
      setResponseAudio(null);
      const response = await axios.post(
        `${config.flask_url}/generate-response`,
        JSON.stringify({ text }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      const audioUrl = response.data.audio_url;
      if (audioUrl) {
        const fullAudioUrl = `${config.flask_url}${audioUrl}`;
        setResponseAudio(fullAudioUrl);
      } else {
        console.error("No audio URL returned from the server");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <textarea
        value={transcribedText}
        onChange={(e) => setTranscribedText(e.target.value)}
        placeholder="Type or speak here"
        rows="4"
        cols="50"
        className="w-full border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)] mb-4"
      />

      <button
        onClick={handleStartStopRecording}
        className="text-sm w-[150px] text-white px-3 py-2 rounded-xs bg-red-500 cursor-pointer"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <button
        onClick={() => getAIResponse(transcribedText)}
        className="text-sm w-[150px] text-white px-3 py-2 rounded-xs bg-red-500 cursor-pointer mt-4"
      >
        {loading ? "Loading..." : "Get Response"}
      </button>

      {responseAudio && (
        <div className="mt-6 bg-opacity-20 p-6 rounded-lg">
          <Spectrum responseAudio={responseAudio} />
        </div>
      )}

      {responseAudio && (
        <audio
          controls
          id={responseAudio}
          crossOrigin="anonymous"
          className="w-full mt-6 rounded-lg border-none"
        >
          <source src={responseAudio} />
        </audio>
      )}
    </div>
  );
};

export default Aitutor;
