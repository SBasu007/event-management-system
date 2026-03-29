import express from "express";
import axios from "axios";
import { SERVICES } from "../config/services.js";

const router = express.Router();


// BOOK EVENT
router.post("/book", async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.ATTENDEE}/attendees/book`,
      req.body
    );
    console.log("BOOK RESPONSE:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("BOOK ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// GET ATTENDEES OF EVENT
router.get("/event/:eventId", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.ATTENDEE}/attendees/event/${req.params.eventId}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET USER BOOKINGS
router.get("/user/:userId", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.ATTENDEE}/attendees/user/${req.params.userId}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FULL ATTENDEES WITH USER DETAILS
router.get("/event/:eventId/full", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get attendees
    const attendeeRes = await axios.get(
      `${SERVICES.ATTENDEE}/attendees/event/${eventId}`
    );

    const attendees = attendeeRes.data;

    // Fetch user details from auth service
    const fullAttendees = await Promise.all(
      attendees.map(async (a) => {
        const userRes = await axios.get(
          `${SERVICES.AUTH}/auth/users/${a.user_id}`
        );

        return {
          ...a,
          user: userRes.data,
        };
      })
    );

    res.json(fullAttendees);

  } catch (err) {
    console.error("FULL ATTENDEE ERROR:", err.message);

    res.status(500).json({
      error: "Failed to fetch attendees with user details"
    });
  }
});

// CANCEL BOOKING
router.delete("/:id", async (req, res) => {
  try {
    await axios.delete(
      `${SERVICES.ATTENDEE}/attendees/${req.params.id}`
    );

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;