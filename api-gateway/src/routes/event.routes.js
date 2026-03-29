import express from "express";
import axios from "axios";
import { SERVICES } from "../config/services.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id/full", async (req, res) => {
  try {
    const eventId = req.params.id;

    //  Get event
    const eventRes = await axios.get(
      `${SERVICES.EVENT}/events/${eventId}`
    );

    const event = eventRes.data;

    //  Get venue
    const venueRes = await axios.get(
      `${SERVICES.EVENT}/venues/${event.venueId}`
    );

    const venue = venueRes.data;

    //  Get event-vendor mappings
    const mappingRes = await axios.get(
      `${SERVICES.EVENT}/event-vendors/event/${eventId}`
    );

    const mappings = mappingRes.data;

    //  Get vendor details
    const vendors = await Promise.all(
      mappings.map(async (m) => {
        const v = await axios.get(
          `${SERVICES.EVENT}/vendors/${m.vendorId}`
        );
        return v.data;
      })
    );

    //  Combine everything
    const fullResponse = {
      ...event,
      venue,
      vendors,
    };

    res.json(fullResponse);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch full event" });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/events`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET EVENTS BY ORGANIZER ID
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/events/organizer/${req.params.organizerId}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET EVENT BY ID
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/events/${req.params.id}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE EVENT
router.post("/",verifyToken, async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.EVENT}/events`,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE EVENT
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${SERVICES.EVENT}/events/${req.params.id}`,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE EVENT
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await axios.delete(
      `${SERVICES.EVENT}/events/${req.params.id}`
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;