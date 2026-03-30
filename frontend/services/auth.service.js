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

export const adminLogin = (data) => {
  return API.post("/auth/admin/login", data);
};

export const getAdminMe = (adminToken) => {
  return API.get("/auth/admin/me", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};