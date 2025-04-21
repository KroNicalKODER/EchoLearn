import React, { useState, useEffect } from "react";
import config from "../config";
import axios from "axios";

const DailyChallenge = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [text, setText] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // State for storing audio blob
  const [phones, setPhones] = useState([]);
  const [phonesByMachine, setPhonesByMachine] = useState([]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US";
      setRecognition(speechRecognition);
    }
  }, []);

  // Audio recording setup
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    // Check if the browser supports media recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = (e) => {
            const blob = new Blob([e.data], { type: "audio/wav" });
            setAudioBlob(blob);
          };
        })
        .catch((err) => {
          console.error("Audio recording error:", err);
        });
    } else {
      alert("Your browser does not support audio recording.");
    }
  }, []);

  const startRecording = () => {
    setAudioBlob(null);
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSendAudio = async () => {
    if (!audioBlob) {
      alert("No audio recorded.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    formData.append("topic", topic);
    formData.append("tone", tone);

    if (!audioBlob || audioBlob.size === 0) {
      alert("Audio file is empty or not recorded properly.");
      setLoading(false);
      return;
    }

    if (!generatedScript || generatedScript.trim() === "") {
      alert("Generated script is empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.flask_url}/transcribe-audio`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.transcription; // Assuming the backend returns transcribed text

        if (!transcribedText || transcribedText.trim() === "") {
          alert("No transcription was returned from the audio.");
          setLoading(false);
          return;
        }

        // Create a text file with the transcribed text
        const scriptBlob = new Blob([generatedScript.split(":")[1]], {
          type: "text/plain",
        });

        // Create a FormData object and append the text file
        const formData1 = new FormData();
        formData1.append("text", scriptBlob, "audio.txt");
        formData1.append("audio", audioBlob, "audio.wav");
        formData1.append("topic", topic);
        formData1.append("tone", tone);

        const response1 = await fetch(`${config.flask_url}/process-audio`, {
          method: "POST",
          body: formData1,
        });

        const data1 = await response1.blob();
        if (response1.ok) {
          // const response = await fetch('http://localhost:5001/tgtojson', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          // })

          const response = await axios.post(`http://localhost:5001/tgtojson`);
          console.log("Response:", response.data);
          setPhones(response.data.phones);
          setPhonesByMachine(response.data.phonesByMachine);

          console.log("Response:", response);
          console.log("Response:", response.data);

          // const url = window.URL.createObjectURL(data1);
          // const a = document.createElement("a");
          // a.href = url;
          // a.download = "audio_transcription.TextGrid";
          // document.body.appendChild(a);
          // a.click();
          // document.body.removeChild(a);

          // Save the file locally for further operations
          const localFile = new File([data1], "audio_transcription.TextGrid", {
            type: data1.type,
          });
          console.log("File saved locally:", localFile);
        } else {
          const errorText = await response1.json();
          alert(`Error: ${errorText.error}`);
        }
      } else {
        const errorText = await response.json();
        alert(`Error: ${errorText.error}`);
      }
    } catch (error) {
      alert("Failed to send audio for processing.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!topic || !tone) {
      alert("Please select a topic and tone.");
      return;
    }

    setLoading(true);
    setIsListening(false);
    recognition.stop();

    try {
      const response = await fetch(
        `${config.flask_url}/generate_random_exercise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, tone, score: 60, custom: text.trim() }),
        }
      );
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

  const handleGetPhones = async () => {
    const response = await axios.post(`http://localhost:5001/tgtojson`);
    setPhones(response.data.phones);
    setPhonesByMachine(response.data.phonesByMachine);
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

        {/* Audio Recording Buttons */}
        <div className="flex gap-2 sm:flex-wrap">
          {recording ? (
            <button
              onClick={stopRecording}
              className="text-sm w-[150px] text-white px-3 py-1 rounded-xs bg-red-500"
            >
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="text-sm w-[150px] text-white px-3 py-1 rounded-xs bg-[#FF00D6]"
            >
              Start Recording
            </button>
          )}
          <button
            onClick={handleSendAudio}
            className="text-sm w-[150px] text-white px-3 py-1 rounded-xs bg-[#D77E2D]"
            disabled={loading || !audioBlob}
          >
            {loading ? "Processing..." : "Send Audio"}
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

        <div className="flex flex-row w-full gap-8">
          {/* Display the phones */}
          {phones && phones.length > 0 && (
            <div className="mt-4 p-3 w-full h-[300px] no-scrollbar overflow-scroll border-[1.5px] border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
              <h3 className="font-bold mb-2">Phones:</h3>
              <div className="flex flex-row gap-4 flex-wrap">
                {phones.map((phone, index) => (
                  <p key={index}>{phone}</p>
                ))}
              </div>
            </div>
          )}

          {/* Display the phones by machine */}
          {phonesByMachine && phonesByMachine.length > 0 && (
            <div className="mt-4 p-3 w-full h-[300px] no-scrollbar overflow-scroll border-[1.5px] border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
              <h3 className="font-bold mb-2">Phones by Machine:</h3>
              <div className="flex flex-row gap-4 flex-wrap">
                {phonesByMachine.map((phone, index) => (
                  <p key={index}>{phone}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
