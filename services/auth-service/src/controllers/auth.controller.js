import { registerUser, loginUser,  getUserById, updateUserService, } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";


export const register = async (req, res) => {
  console.log("Register endpoint called with body:", req.body);
  try {
    const user = await registerUser(req.body);
    res.json(user);
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  console.log("Login endpoint called with body:", req.body);
  try {
    const user = await loginUser(req.body);
    const token = generateToken(user);

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);

    res.status(400).json({ error: err.message });
  }
};

// GET /users/me
export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /users/update
export const updateUser = async (req, res) => {
  try {
    const updated = await updateUserService(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SAFE GET USER BY ID (NO PASSWORD)
export const getAUserById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
