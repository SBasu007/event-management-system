import express from "express";
import axios from "axios";
import { SERVICES } from "../config/services.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

const loadEventFullDetails = async (event) => {
  const venuePromise = event?.venueId
    ? axios.get(`${SERVICES.EVENT}/venues/${event.venueId}`).then((res) => res.data)
    : Promise.resolve(null);

  const mappingsPromise = axios
    .get(`${SERVICES.EVENT}/event-vendors/event/${event.id}`)
    .then((res) => (Array.isArray(res.data) ? res.data : []));

  const [venue, mappings] = await Promise.all([venuePromise, mappingsPromise]);

  const vendors = await Promise.all(
    mappings.map((mapping) =>
      axios
        .get(`${SERVICES.EVENT}/vendors/${mapping.vendorId}`)
        .then((res) => res.data)
        .catch(() => null)
    )
  );

  return {
    ...event,
    venue,
    vendors: vendors.filter(Boolean),
  };
};

router.get("/:id/full", async (req, res) => {
  try {
    const eventId = req.params.id;

    //  Get event
    const eventRes = await axios.get(
      `${SERVICES.EVENT}/events/${eventId}`
    );

    const event = eventRes.data;

    const fullResponse = await loadEventFullDetails(event);

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
    const events = Array.isArray(response.data) ? response.data : [];
    const activeEvents = events.filter((event) => event?.active !== false);

    res.json(activeEvents);
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
    const events = Array.isArray(response.data) ? response.data : [];
    const activeEvents = events.filter((event) => event?.active !== false);

    res.json(activeEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL EVENTS (INCLUDING DISABLED) BY ORGANIZER ID
router.get("/organizer/:organizerId/all", verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/events/organizer/${req.params.organizerId}`
    );

    res.json(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL VENUES
router.get("/venues", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/venues`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL VENDORS
router.get("/vendors", async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.EVENT}/vendors`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN MASTER VIEW OF EVENTS
router.get("/admin/master", verifyAdmin, async (req, res) => {
  try {
    const eventsRes = await axios.get(`${SERVICES.EVENT}/events`);
    const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

    const fullEvents = await Promise.all(events.map((event) => loadEventFullDetails(event)));
    res.json(fullEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN CREATE VENUE
router.post("/admin/venues", verifyAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.EVENT}/venues`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN UPDATE VENUE
router.put("/admin/venues/:id", verifyAdmin, async (req, res) => {
  try {
    const response = await axios.put(`${SERVICES.EVENT}/venues/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN CREATE VENDOR
router.post("/admin/vendors", verifyAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.EVENT}/vendors`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN UPDATE VENDOR
router.put("/admin/vendors/:id", verifyAdmin, async (req, res) => {
  try {
    const response = await axios.put(`${SERVICES.EVENT}/vendors/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ASSIGN MULTIPLE VENDORS TO EVENT
router.post("/:eventId/vendors", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const vendorIds = Array.isArray(req.body?.vendorIds) ? req.body.vendorIds : [];

    const assignments = await Promise.all(
      vendorIds.map((vendorId) =>
        axios.post(`${SERVICES.EVENT}/event-vendors`, null, {
          params: { eventId, vendorId },
        })
      )
    );

    res.json(assignments.map((assignment) => assignment.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REPLACE EVENT VENDORS
router.put("/:eventId/vendors", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const vendorIds = Array.isArray(req.body?.vendorIds) ? req.body.vendorIds : [];

    const existingMappingsRes = await axios.get(
      `${SERVICES.EVENT}/event-vendors/event/${eventId}`
    );

    const existingMappings = Array.isArray(existingMappingsRes.data)
      ? existingMappingsRes.data
      : [];

    await Promise.all(
      existingMappings.map((mapping) =>
        axios.delete(`${SERVICES.EVENT}/event-vendors/${mapping.id}`)
      )
    );

    const assignments = await Promise.all(
      vendorIds.map((vendorId) =>
        axios.post(`${SERVICES.EVENT}/event-vendors`, null, {
          params: { eventId, vendorId },
        })
      )
    );

    res.json(assignments.map((assignment) => assignment.data));
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

// DISABLE EVENT (ORGANIZER/ADMIN)
router.patch("/:id/disable", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventRes = await axios.get(`${SERVICES.EVENT}/events/${eventId}`);
    const event = eventRes.data;

    const userId = String(req.user?.id || "");
    const isAdmin = req.user?.role === "admin";
    const isOwner = String(event?.organizerId || "") === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed to disable this event" });
    }

    const response = await axios.patch(`${SERVICES.EVENT}/events/${eventId}/disable`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENABLE EVENT (ORGANIZER/ADMIN)
router.patch("/:id/enable", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventRes = await axios.get(`${SERVICES.EVENT}/events/${eventId}`);
    const event = eventRes.data;

    const userId = String(req.user?.id || "");
    const isAdmin = req.user?.role === "admin";
    const isOwner = String(event?.organizerId || "") === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed to enable this event" });
    }

    const response = await axios.patch(`${SERVICES.EVENT}/events/${eventId}/enable`);
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