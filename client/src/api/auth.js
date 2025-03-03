import axios from "axios";

const API_URL = "http://localhost:5001/auth";

const authInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const register = async (user) => {
    try {
        const response = await authInstance.post("/register", user);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const login = async (user) => {
    try {
        const response = await authInstance.post("/login", user);
        return response.data;
    } catch (error) {
        return error;
    }
}