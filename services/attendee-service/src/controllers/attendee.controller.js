import * as service from "../services/attendee.service.js";

// book event
export const book = async (req, res) => {
  try {
    const { userId, eventId, status } = req.body;

    const result = await service.bookEvent(userId, eventId, status);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get attendees of event
export const getByEvent = async (req, res) => {
  try {
    const data = await service.getAttendeesByEvent(req.params.eventId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get events by user
export const getByUser = async (req, res) => {
  try {
    const data = await service.getEventsByUser(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// cancel
export const cancel = async (req, res) => {
  try {
    await service.cancelBooking(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};