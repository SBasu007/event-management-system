import express from "express";
import axios from "axios";
import { SERVICES } from "../config/services.js";

const router = express.Router();


// SET BUDGET
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.BUDGET}/budget`,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BUDGET BY EVENT
router.get("/:eventId", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.BUDGET}/budget/${req.params.eventId}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET REMAINING BUDGET
router.get("/:eventId/remaining", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.BUDGET}/budget/${req.params.eventId}/remaining`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ADD EXPENSE
router.post("/expense", async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.BUDGET}/expenses`,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE EXPENSE
router.put("/expense/:id", async (req, res) => {
  try {
    const response = await axios.put(
      `${SERVICES.BUDGET}/expenses/${req.params.id}`,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET EXPENSES
router.get("/expense/:eventId", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.BUDGET}/expenses/${req.params.eventId}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE AUTO-CALCULATED EXPENSES (VENUE + VENDORS)
router.delete("/expense/:eventId/auto", async (req, res) => {
  try {
    await axios.delete(
      `${SERVICES.BUDGET}/expenses/${req.params.eventId}/auto`
    );

    res.json({ message: "Auto expenses cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE EXPENSE
router.delete("/expense/:id", async (req, res) => {
  try {
    await axios.delete(
      `${SERVICES.BUDGET}/expenses/${req.params.id}`
    );

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;