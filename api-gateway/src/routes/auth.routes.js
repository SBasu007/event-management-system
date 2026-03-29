import express from "express";
import axios from "axios";
import { SERVICES } from "../config/services.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.AUTH}/auth/register`,
      req.body
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Register error:", err.message);

    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Auth service error",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.AUTH}/auth/login`,
      req.body
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Login error:", err.message);

    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Auth service error",
    });
  }
});

// IDENTIFY USER
router.get("/me", verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.AUTH}/auth/me`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Error fetching user",
    });
  }
});

// UPDATE USER
router.put("/update", verifyToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${SERVICES.AUTH}/auth/update`,
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Update failed",
    });
  }
});


export default router;