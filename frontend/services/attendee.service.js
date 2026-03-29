import API from "./api";

// book an event
export const bookEvent = (data) => API.post("/attendees/book", data);

// get attendees of an event
export const getAttendeesByEvent = (eventId) =>
	API.get(`/attendees/event/${eventId}`);

// get bookings of a user
export const getUserBookings = (userId) => API.get(`/attendees/user/${userId}`);

// get attendees with user details for an event
export const getFullAttendeesByEvent = (eventId) =>
	API.get(`/attendees/event/${eventId}/full`);

// cancel booking by booking id
export const cancelBooking = (id) => API.delete(`/attendees/${id}`);

