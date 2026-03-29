import API from "./api";

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const getMe = () => {
  return API.get("/auth/me");
};