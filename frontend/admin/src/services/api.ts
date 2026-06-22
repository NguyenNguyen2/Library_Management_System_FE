import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    //baseURL: import.meta.env.VITE_API_URL,
    baseURL: "http://127.0.0.1:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});