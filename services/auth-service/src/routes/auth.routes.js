import express from "express";
import {
  register,
  login,
  adminLogin,
  getMe,
  getAdminMe,
  updateUser,
  getAUserById
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/users/:id", getAUserById);

// PROTECTED
router.get("/me", verifyToken, getMe);
router.get("/admin/me", verifyToken, getAdminMe);
router.put("/update", verifyToken, updateUser);

export default router;