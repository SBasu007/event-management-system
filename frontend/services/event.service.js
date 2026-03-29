import API from "./api";

// get all events
export const getEvents = () => API.get("/events");

// create event
export const createEvent = (data) => API.post("/events", data);

// get events by organizer id
export const getEventsByOrganizerId = (organizerId) =>
	API.get(`/events/organizer/${organizerId}`);

// get event by id
export const getEventById = (id) => API.get(`/events/${id}`);

// update event by id
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);

// full event (venue + vendors)
export const getFullEvent = (id) => API.get(`/events/${id}/full`);

// get all venues
export const getVenues = () => API.get("/events/venues");

// get all vendors
export const getVendors = () => API.get("/events/vendors");

// assign vendors to an event
export const assignVendorsToEvent = (eventId, vendorIds) =>
	API.post(`/events/${eventId}/vendors`, { vendorIds });

// replace vendors of an event
export const syncVendorsForEvent = (eventId, vendorIds) =>
	API.put(`/events/${eventId}/vendors`, { vendorIds });

// set total budget for an event
export const setEventBudget = (eventId, totalAmount) =>
	API.post("/budget", { eventId, totalAmount });

// get budget for an event
export const getBudgetByEventId = (eventId) => API.get(`/budget/${eventId}`);

// add expense for an event
export const addEventExpense = (eventId, category, amount) =>
	API.post("/budget/expense", { eventId, category, amount });

// clear auto-calculated venue/vendor expenses
export const clearAutoExpenses = (eventId) =>
	API.delete(`/budget/expense/${eventId}/auto`);