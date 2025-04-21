import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketProvider";
import { saveTranscript } from "../api/transcript";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [speech, setSpeech] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const { roomId: roomIdParam } = useParams();
  const navigate = useNavigate();

  const handlePushAndTalk = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    console.log("Push and talk", isListening);
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }

    recognition.onresult = async (event) => {
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
  };

  useEffect(() => {
    const handleSaveTranscript = async () => {
      await saveTranscript(speech.trimStart(), roomIdParam, user.email);
    };

    if (speech.trim() !== "" && !isListening) {
      handleSaveTranscript();
      socket.emit("room:message", {
        roomId: roomIdParam,
        message: speech.trimStart(),
        email: user.email,
      });
      setSpeech("");
    }
  }, [speech, isListening, roomIdParam, user.email, setSpeech]);

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
    setRoomId(roomId);
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
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("room:message", ({ message, roomId, email }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message, roomId, email },
      ]);
    });
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("room:message");
    };
  }, [
    socket,
    user.email,
    roomIdParam,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="w-full min-h-screen p-6">
      <div className="text-center text-2xl font-bold text-gray-200 mb-4">
        Room Page
      </div>
      <h2 className="text-center text-lg font-medium text-gray-300 mb-6">
        {remoteSocketId ? "Connected" : "No one is in the room"}
      </h2>
      <div className="flex flex-col gap-6 w-full justify-center items-center">
        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Start Call
          </button>
        )}
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 w-full justify-center items-center shadow-md p-4 rounded-md">
            <div className="font-semibold text-gray-200">Cam 1 (You)</div>
            {myStream ? (
              <ReactPlayer
                url={myStream}
                playing={true}
                width="500px"
                height="300px"
                style={{ borderRadius: "8px" }}
              />
            ) : (
              <div className="w-[500px] h-[300px] flex items-center justify-center rounded-md">
                <span className="text-gray-500">No Stream</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 w-full justify-center items-center shadow-md p-4 rounded-md">
            <div className="font-semibold text-gray-200">Cam 2</div>
            {remoteStream ? (
              <ReactPlayer
                url={remoteStream}
                playing={true}
                width="500px"
                height="300px"
                className="rounded-md overflow-hidden"
              />
            ) : (
              <div className="w-[500px] h-[300px] flex items-center justify-center rounded-md">
                <span className="text-gray-500">No Stream</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 shadow-md p-6 rounded-md">
        <div className="mb-4">
          {isListening ? (
            <div className="text-red-500 font-semibold">Listening...</div>
          ) : (
            <div className="text-green-500 font-semibold">Not Listening</div>
          )}
        </div>
        <div className="flex gap-4 mb-6">
          <button
            onClick={handlePushAndTalk}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Push And Talk
          </button>
          <button
            onClick={handleStopListening}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Stop Listening
          </button>
          <button
            onClick={() => {
              navigate(`/`);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
          >
            End Call
          </button>
        </div>
        <div className="space-y-4">
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-md ${
                message.email === user.email
                  ? "text-white bg-blue-700"
                  : "text-white bg-gray-800"
              }`}
            >
              <span className="font-bold">{message.email}:</span>{" "}
              {message.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
