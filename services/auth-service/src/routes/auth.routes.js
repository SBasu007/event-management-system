import express from "express";
import {
  register,
  login,
  getMe,
  updateUser,
  getAUserById
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.post("/register", register);
router.post("/login", login);
router.get("/users/:id", getAUserById);

// PROTECTED
router.get("/me", verifyToken, getMe);
router.put("/update", verifyToken, updateUser);

export default router;