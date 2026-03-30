"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import WarningConfirmModal from "@/components/ui/WarningConfirmModal";
import {
  addEventExpense,
  assignVendorsToEvent,
  createEvent,
  disableEvent,
  enableEvent,
  getAllEventsByOrganizerId,
  getVenues,
  getVendors,
  setEventBudget,
} from "@/services/event.service";

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formOptionsLoading, setFormOptionsLoading] = useState(false);
  const [formOptionsError, setFormOptionsError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [togglingEventId, setTogglingEventId] = useState(null);
  const [toggleTargetEventId, setToggleTargetEventId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    imgUrl: "",
    venueId: "",
    vendorIds: [],
    totalBudget: "",
  });

  const organizerId = useMemo(() => user?.id, [user]);

  const loadOrganizerEvents = useCallback(async () => {
    if (!organizerId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    setLoading(true);
    setError("");

    try {
      const res = await getAllEventsByOrganizerId(organizerId);
      if (!isCancelled) {
        setEvents(Array.isArray(res?.data) ? res.data : []);
      }
    } catch {
      if (!isCancelled) {
        setError("Could not load your events. Please try again.");
        setEvents([]);
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [organizerId]);

  const loadCreateFormOptions = useCallback(async () => {
    setFormOptionsLoading(true);
    setFormOptionsError("");

    try {
      const [venuesRes, vendorsRes] = await Promise.all([
        getVenues(),
        getVendors(),
      ]);

      setVenues(Array.isArray(venuesRes?.data) ? venuesRes.data : []);
      setVendors(Array.isArray(vendorsRes?.data) ? vendorsRes.data : []);
    } catch {
      setFormOptionsError(
        "Could not load venues/vendors. Please try again."
      );
      setVenues([]);
      setVendors([]);
    } finally {
      setFormOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!organizerId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    loadOrganizerEvents();
  }, [organizerId, authLoading, loadOrganizerEvents]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [hours, minutes] = String(timeStr).split(":");
    if (hours == null || minutes == null) return timeStr;
    const normalized = new Date();
    normalized.setHours(Number(hours), Number(minutes), 0, 0);
    if (Number.isNaN(normalized.getTime())) return timeStr;
    return normalized.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      imgUrl: "",
      venueId: "",
      vendorIds: [],
      totalBudget: "",
    });
    setCreateError("");
  };

  const handleOpenCreateModal = async () => {
    setShowCreateModal(true);
    await loadCreateFormOptions();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVendorToggle = (vendorId) => {
    setCreateForm((prev) => {
      const exists = prev.vendorIds.includes(vendorId);
      return {
        ...prev,
        vendorIds: exists
          ? prev.vendorIds.filter((id) => id !== vendorId)
          : [...prev.vendorIds, vendorId],
      };
    });
  };

  const selectedVenue = useMemo(
    () => venues.find((venue) => String(venue.id) === String(createForm.venueId)) || null,
    [venues, createForm.venueId]
  );

  const selectedVendors = useMemo(
    () => vendors.filter((vendor) => createForm.vendorIds.includes(vendor.id)),
    [vendors, createForm.vendorIds]
  );

  const normalizeAmount = (value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(normalizeAmount(value));

  const venueExpensePreview = normalizeAmount(selectedVenue?.price);
  const vendorsExpensePreview = selectedVendors.reduce(
    (sum, vendor) => sum + normalizeAmount(vendor?.price),
    0
  );
  const plannedExpenseTotal = venueExpensePreview + vendorsExpensePreview;
  const enteredBudgetAmount = normalizeAmount(createForm.totalBudget);
  const remainingBudgetPreview = enteredBudgetAmount - plannedExpenseTotal;

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateError("");

    const trimmedTitle = createForm.title.trim();
    const trimmedDescription = createForm.description.trim();
    const eventDate = createForm.eventDate;
    const eventTime = createForm.eventTime;
    const venueId = Number(createForm.venueId);
    const totalBudget = Number(createForm.totalBudget);

    if (!trimmedTitle) {
      setCreateError("Title is required.");
      return;
    }

    if (!trimmedDescription) {
      setCreateError("Description is required.");
      return;
    }

    if (!eventDate) {
      setCreateError("Please select an event date.");
      return;
    }

    if (!eventTime) {
      setCreateError("Please select an event time.");
      return;
    }

    if (!venueId) {
      setCreateError("Please select a venue.");
      return;
    }

    if (Number.isNaN(totalBudget) || totalBudget < 0) {
      setCreateError("Please provide a valid total budget.");
      return;
    }

    try {
      setCreateLoading(true);

      const createRes = await createEvent({
        title: trimmedTitle,
        description: trimmedDescription,
        eventDate,
        eventTime: `${eventTime}:00`,
        imgUrl: createForm.imgUrl.trim() || null,
        venueId,
        organizerId,
      });

      const createdEventId = createRes?.data?.id;
      if (!createdEventId) {
        throw new Error("Event creation failed");
      }

      if (createForm.vendorIds.length > 0) {
        await assignVendorsToEvent(createdEventId, createForm.vendorIds);
      }

      await setEventBudget(createdEventId, totalBudget);

      const selectedVenue = venues.find((venue) => venue.id === venueId);
      const selectedVendors = vendors.filter((vendor) =>
        createForm.vendorIds.includes(vendor.id)
      );

      const expenseRequests = [];

      const venuePrice = Number(selectedVenue?.price);
      if (!Number.isNaN(venuePrice) && venuePrice >= 0) {
        expenseRequests.push(
          addEventExpense(createdEventId, "Venue", venuePrice)
        );
      }

      selectedVendors.forEach((vendor) => {
        const vendorPrice = Number(vendor?.price);
        if (!Number.isNaN(vendorPrice) && vendorPrice >= 0) {
          expenseRequests.push(
            addEventExpense(
              createdEventId,
              `Vendor: ${vendor.name || vendor.id}`,
              vendorPrice
            )
          );
        }
      });

      if (expenseRequests.length > 0) {
        await Promise.all(expenseRequests);
      }

      handleCloseCreateModal();
      await loadOrganizerEvents();
    } catch {
      setCreateError("Could not create event. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleEvent = (eventId) => {
    if (!eventId) return;
    setToggleTargetEventId(eventId);
  };

  const handleCancelToggle = () => {
    if (togglingEventId) return;
    setToggleTargetEventId(null);
  };

  const toggleTargetEvent = useMemo(
    () => events.find((event) => event.id === toggleTargetEventId) || null,
    [events, toggleTargetEventId]
  );

  const handleConfirmToggle = async () => {
    if (!toggleTargetEvent) return;
    const isActive = toggleTargetEvent.active !== false;

    try {
      setTogglingEventId(toggleTargetEvent.id);
      if (isActive) {
        await disableEvent(toggleTargetEvent.id);
      } else {
        await enableEvent(toggleTargetEvent.id);
      }
      await loadOrganizerEvents();
      setToggleTargetEventId(null);
    } catch {
      setError(
        isActive
          ? "Could not disable event. Please try again."
          : "Could not enable event. Please try again."
      );
    } finally {
      setTogglingEventId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#231f52]">My Events</h1>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="rounded-xl bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
        >
          Create Event +
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
          Loading events...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
          No events found for this organizer.
        </div>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 shadow-[0_10px_24px_rgba(79,70,229,0.08)]"
              >
                <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap lg:justify-between">
                  <div className="min-w-[180px] flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#2b265f]">{event.title}</h2>
                      {event.active === false ? (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Disabled
                        </span>
                      ) : (
                        <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-[240px] flex-[2] rounded-lg bg-white/70 px-3 py-2 text-sm text-[#4d4a75]">
                    {event.description || "No description available."}
                  </div>

                  <div className="rounded-lg bg-white/70 px-3 py-2 text-sm text-[#3d3970]">
                    <span className="font-semibold text-[#2b265f]">Date: </span>
                    {formatDate(event.eventDate)}
                  </div>

                  <div className="rounded-lg bg-white/70 px-3 py-2 text-sm text-[#3d3970]">
                    <span className="font-semibold text-[#2b265f]">Time: </span>
                    {formatTime(event.eventTime)}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/organizer_dashboard/events/${event.id}/edit`}
                      className="rounded-lg bg-[#dcd7f2] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleEvent(event.id)}
                      disabled={togglingEventId === event.id}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        event.active === false
                          ? "border-green-300 bg-white text-green-700 hover:bg-green-50"
                          : "border-red-300 bg-white text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {togglingEventId === event.id
                        ? event.active === false
                          ? "Enabling..."
                          : "Disabling..."
                        : event.active === false
                          ? "Enable"
                          : "Disable"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1f1a44]/45"
            onClick={handleCloseCreateModal}
          />

          <div className="relative z-10 w-[min(980px,95vw)] max-h-[92vh] overflow-y-auto rounded-2xl border border-[#d8cef8] bg-[#f5f1ff] p-6 shadow-[0_30px_80px_rgba(37,28,97,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#231f52]">
                Create New Event
              </h2>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="rounded-lg bg-[#e4def8] px-3 py-1.5 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d8d0f2]"
              >
                Close
              </button>
            </div>

            {formOptionsLoading ? (
              <div className="mb-4 rounded-xl border border-[#ddd6fb] bg-white/70 p-4 text-sm text-[#666286]">
                Loading venues and vendors...
              </div>
            ) : null}

            {formOptionsError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {formOptionsError}
              </div>
            ) : null}

            {createError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {createError}
              </div>
            ) : null}

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Title
                  </span>
                  <input
                    name="title"
                    value={createForm.title}
                    onChange={handleCreateInputChange}
                    placeholder="Enter event title"
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Venue
                  </span>
                  <select
                    name="venueId"
                    value={createForm.venueId}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  >
                    <option value="">Select a venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                        {venue.location ? ` - ${venue.location}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Description
                  </span>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateInputChange}
                    placeholder="Describe your event"
                    rows={4}
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Event Date
                  </span>
                  <input
                    type="date"
                    name="eventDate"
                    value={createForm.eventDate}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Event Time
                  </span>
                  <input
                    type="time"
                    name="eventTime"
                    value={createForm.eventTime}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Image URL
                  </span>
                  <input
                    name="imgUrl"
                    value={createForm.imgUrl}
                    onChange={handleCreateInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                    Total Budget
                  </span>
                  <input
                    type="number"
                    name="totalBudget"
                    min="0"
                    step="0.01"
                    value={createForm.totalBudget}
                    onChange={handleCreateInputChange}
                    placeholder="Enter total budget"
                    className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                    required
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#30295e]">
                  Select Vendors (one or more)
                </p>
                <div className="max-h-52 overflow-y-auto rounded-xl border border-[#d6cdf5] bg-white p-3">
                  {vendors.length === 0 ? (
                    <p className="text-sm text-[#6d6990]">
                      No vendors available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {vendors.map((vendor) => {
                        const isChecked = createForm.vendorIds.includes(vendor.id);
                        return (
                          <label
                            key={vendor.id}
                            className="flex items-center gap-2 rounded-lg bg-[#f6f3ff] px-3 py-2 text-sm text-[#3a3669]"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleVendorToggle(vendor.id)}
                              className="h-4 w-4 accent-[#4f46e5]"
                            />
                            <span>
                              {vendor.name}
                              {vendor.type ? ` (${vendor.type})` : ""}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#d6cdf5] bg-[#ece6ff] p-4">
                <p className="text-sm font-semibold text-[#2f2960]">
                  Budget Preview
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-[#3d3970] sm:grid-cols-2">
                  <div className="rounded-lg bg-white/70 px-3 py-2">
                    <span className="font-semibold text-[#2b265f]">Venue Expense: </span>
                    {formatCurrency(venueExpensePreview)}
                  </div>
                  <div className="rounded-lg bg-white/70 px-3 py-2">
                    <span className="font-semibold text-[#2b265f]">Vendors Expense: </span>
                    {formatCurrency(vendorsExpensePreview)}
                  </div>
                  <div className="rounded-lg bg-white/70 px-3 py-2">
                    <span className="font-semibold text-[#2b265f]">Planned Total Expense: </span>
                    {formatCurrency(plannedExpenseTotal)}
                  </div>
                  <div className="rounded-lg bg-white/70 px-3 py-2">
                    <span className="font-semibold text-[#2b265f]">Remaining Budget: </span>
                    <span
                      className={
                        remainingBudgetPreview < 0
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-700"
                      }
                    >
                      {formatCurrency(remainingBudgetPreview)}
                    </span>
                  </div>
                </div>

                {remainingBudgetPreview < 0 ? (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Planned expenses exceed the entered budget.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="rounded-xl bg-[#ddd7f3] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || formOptionsLoading}
                  className="rounded-xl bg-[#4f46e5] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={Boolean(toggleTargetEventId)}
        title={toggleTargetEvent?.active === false ? "Enable Event" : "Disable Event"}
        message={
          toggleTargetEvent?.active === false
            ? "Enable this event? It will be visible again in active event views."
            : "Disable this event? It will be hidden from active event views."
        }
        confirmText={toggleTargetEvent?.active === false ? "Enable Event" : "Disable Event"}
        cancelText={toggleTargetEvent?.active === false ? "Keep Disabled" : "Keep Active"}
        loadingText={toggleTargetEvent?.active === false ? "Enabling..." : "Disabling..."}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
        loading={Boolean(togglingEventId)}
      />
    </div>
  );
}