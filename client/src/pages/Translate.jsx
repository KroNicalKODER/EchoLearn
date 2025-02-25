import React, { useState } from "react";
import config from "../config";
import axios from "axios";

const Translate = () => {
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      alert("Please enter text to translate.");
      return;
    }

    try {
      const response = await axios.post(`${config.flask_url}/translate`, {
        from_language: fromLanguage,
        to_language: toLanguage,
        text: text,
      });
      console.log(response);
      if (!response.status === 200) {
        throw new Error("Translation failed.");
      }
      setTranslatedText(response.data.response);
      console.log(response.data.response);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-[75%] flex gap-3 justify-center flex-col">
        {/* Language Selection */}
        <div className="flex w-full gap-3 justify-center">
          <div className="flex w-[300px] border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
            <select
              className="outline-none w-full"
              value={fromLanguage}
              onChange={(e) => setFromLanguage(e.target.value)}
            >
                <option value="">From Language</option>
              <option value="English">English</option>
            </select>
          </div>
          <div className="flex w-[300px] border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]">
            <select
              className="outline-none w-full"
              value={toLanguage}
              onChange={(e) => setToLanguage(e.target.value)}
            >
              <option value="">To Language</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Input Box */}
        <input
          type="text"
          placeholder="Enter Text"
          className="w-full border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Translate Button */}
        <div className="flex w-full justify-center">
          <button
            onClick={handleTranslate}
            className="text-sm w-[150px] text-white px-3 py-1 rounded-xs bg-[#D77E2D] cursor-pointer"
          >
            Translate
          </button>
        </div>

        {/* Translated Text */}
        {translatedText && (
          <div className="w-full border-[1.5px] px-3 py-1 border-[#A804F8] rounded-md bg-[rgba(171,0,255,0.14)] mt-3">
            <p className="text-white">Translation: {translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Translate;
