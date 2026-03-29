import  pool from "../db/db.js";

// book event
export const bookEvent = async (userId, eventId, status) => {
  const result = await pool.query(
    `INSERT INTO attendees (user_id, event_id, status)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, eventId, status]
  );

  return result.rows[0];
};

// get attendees of event
export const getAttendeesByEvent = async (eventId) => {
  const result = await pool.query(
    `SELECT * FROM attendees WHERE event_id = $1`,
    [eventId]
  );

  return result.rows;
};

// get events booked by user
export const getEventsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM attendees WHERE user_id = $1`,
    [userId]
  );

  return result.rows;
};

// cancel booking
export const cancelBooking = async (id) => {
  await pool.query(
    `DELETE FROM attendees WHERE id = $1`,
    [id]
  );
};