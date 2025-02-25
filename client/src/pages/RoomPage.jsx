import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";

import { useSocket } from "../contexts/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [speech, setSpeech] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false) 

  const handlePushAndTalk = () => {
    if(!recognition) {
      alert("Speech recognition is not supported in this browser.");
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
      setSpeech((prevSpeech) => prevSpeech + " " + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error: ", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      
    };

  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US";
      setRecognition(speechRecognition);
    }
  }, []);

  const handleUserJoined = useCallback(({ email, id, password, roomId }) => {
    console.log(email, id, password, roomId);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    console.log("remoteSocketId", remoteSocketId, offer);
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("incoming call", from, offer);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      console.log("call accepted", from, ans);
      await peer.setLocalDescription(ans);
      console.log("call accepted", from, ans);
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(
    async ({ from, ans }) => {
      await peer.setLocalDescription(ans);
    },
    [myStream]
  );

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStream = e.streams[0];
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    // console.log("socket", socket)
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="w-full">
      Room Page
      <h2>{remoteSocketId ? "Connected" : "No one is in the room"}</h2>
      <div className="flex flex-col gap-3 w-full justify-center items-center">
        {remoteSocketId && <button onClick={handleCallUser}>Start Call</button>}
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          Camera 1
          {myStream && (
            <ReactPlayer
              url={myStream}
              playing={true}
              width="300px"
              height="100px"
            />
          )}
        </div>
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          Camera 2
          {remoteStream && (
            <ReactPlayer
              url={remoteStream}
              playing={true}
              width="300px"
              height="100px"
            />
          )}
        </div>
      </div>
      <div className="">
        <button onClick={handlePushAndTalk}>Push And Talk</button>
        <button onClick={handleStopListening}>Stop Listening</button>
        <div className="">{speech}</div>
      </div>
    </div>
  );
};

export default RoomPage;
