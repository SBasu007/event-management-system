import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically 
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => {
    const body = response?.data;

    if (
      body &&
      typeof body === "object" &&
      "status" in body &&
      "message" in body
    ) {
      response.apiStatus = body.status;
      response.apiMessage = body.message;
      response.data = Object.prototype.hasOwnProperty.call(body, "data")
        ? body.data
        : body;
    }

    return response;
  },
  (error) => {
    const body = error?.response?.data;

    if (
      body &&
      typeof body === "object" &&
      "status" in body &&
      "message" in body
    ) {
      error.apiStatus = body.status;
      error.apiMessage = body.message;
      error.message = body.message || error.message;
    }

    return Promise.reject(error);
  }
);

export default API;