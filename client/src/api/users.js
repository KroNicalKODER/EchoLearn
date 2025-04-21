import axios from "axios";

const API_URL = "http://localhost:5001/user";

const userInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const setOnline = async (email) => {
  try {
    const response = await userInstance.post("/setOnline", { email });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const setOffline = async (email) => {
  try {
    const response = await userInstance.post("/setOffline", { email });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const getOnlineUsers = async () => {
  try {
    const response = await userInstance.get("/getOnlineUsers");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const getAllUsers = async () => {
  try {
    const response = await userInstance.get("/getAllUsers");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
