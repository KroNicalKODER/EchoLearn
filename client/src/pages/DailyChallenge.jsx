import React, { useState, useEffect } from "react";
import config from "../config";

const DailyChallenge = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [text, setText] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US"; 
      setRecognition(speechRecognition);
    }
  }, []);

  const handleGenerateScript = async () => {
    if (!topic || !tone) {
      alert("Please select a topic and tone.");
      return;
    }

    setLoading(true);
    setIsListening(false)
    recognition.stop()
    try {
      const response = await fetch(`${config.flask_url}/generate_random_exercise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, score: 60, custom: text.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedScript(data.response);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to generate script. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert("Voice recognition not supported in your browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      setText((prevText) => prevText + " " + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error: ", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col gap-3 w-[75%] justify-center items-center">
        <div className="flex gap-3 sm:flex-wrap w-full justify-center">
          {/* Topic Selection */}
          <div className="w-[300px] border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
            <select
              className="w-full outline-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              <option value="Technology">Technology</option>
              <option value="Politics">Politics</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Any Other">Any Other</option>
            </select>
          </div>

          {/* Tone Selection */}
          <div className="w-[300px] border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
            <select
              className="w-full outline-none"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="">Select a tone</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
            </select>
          </div>
        </div>

        {/* Custom Input with Voice Typing */}
        <div className="flex w-full items-center">
          <input
            className="w-full border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter any custom prompt or use voice typing"
          />
          <button
            onClick={handleVoiceInput}
            className={`ml-2 px-3 py-1 text-white rounded-xs ${
              isListening ? "bg-red-500" : "bg-[#FF00D6]"
            }`}
          >
            {isListening ? "Stop" : "🎤"}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:flex-wrap">
          <button
            onClick={handleGenerateScript}
            className="text-sm w-[150px] text-white px-3 py-1 rounded-xs bg-[#D77E2D] cursor-pointer"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Script"}
          </button>
        </div>

        {/* Display the generated script */}
        {generatedScript && (
          <div className="mt-4 p-3 w-full h-[300px] no-scrollbar overflow-scroll border-[1.5px] border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
            <h3 className="font-bold">Generated Script:</h3>
            <p>{generatedScript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
