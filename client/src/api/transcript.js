import axios from "axios";

const API_URL = "http://localhost:5001/transcript";

const transcriptInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const saveTranscript = async (transcript, roomId, email) => {
  try {
    const response = await transcriptInstance.post("/save", {
      transcript,
      roomId,
      email,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTranscripts = async (roomId) => {
  try {
    const response = await transcriptInstance.get(`/${roomId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
