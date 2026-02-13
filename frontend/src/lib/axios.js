import axios from "axios";

const axios_instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api", // Using the proxy
  withCredentials: true, // send the cookies with the request
  headers: {
    "Content-Type": "application/json",
  },
});

export { axios_instance };
