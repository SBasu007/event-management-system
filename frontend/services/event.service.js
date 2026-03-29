import API from "./api";

// get all events
export const getEvents = () => API.get("/events");

// get events by organizer id
export const getEventsByOrganizerId = (organizerId) =>
	API.get(`/events/organizer/${organizerId}`);

// get event by id
export const getEventById = (id) => API.get(`/events/${id}`);

// full event (venue + vendors)
export const getFullEvent = (id) => API.get(`/events/${id}/full`);