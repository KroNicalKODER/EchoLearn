import AudioSpectrum from "react-audio-spectrum";
import { useState, useEffect } from "react";

export function Spectrum({ responseAudio }) {
  const [id, setId] = useState("");
  useEffect(() => {
    setId(responseAudio + "_Spectrum");
  }, [responseAudio]);
  return (
    <div className="AudioSpectrum">
      <AudioSpectrum
        id="audio-canvas"
        key={id}
        height={200}
        width={520}
        audioId={responseAudio}
        capColor={"lightgreen"}
        capHeight={2}
        meterWidth={2}
        meterCount={512}
        meterColor={[
          { stop: 0, color: "red" },
          { stop: 0.5, color: "rgb(194, 248, 0)" },
          { stop: 1, color: "rgb(194, 248, 0)" }
        ]}
        gap={4}
      />
    </div>
  );
}
