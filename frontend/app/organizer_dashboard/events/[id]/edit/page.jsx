"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  addEventExpense,
  clearAutoExpenses,
  getBudgetByEventId,
  getEventById,
  getFullEvent,
  getVenues,
  getVendors,
  setEventBudget,
  syncVendorsForEvent,
  updateEvent,
} from "@/services/event.service";

const initialForm = {
  title: "",
  description: "",
  eventDate: "",
  eventTime: "",
  imgUrl: "",
  venueId: "",
  vendorIds: [],
  totalBudget: "",
};

export default function EditEventPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const [form, setForm] = useState(initialForm);
  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventOrganizerId, setEventOrganizerId] = useState(null);

  const organizerId = useMemo(() => user?.id, [user]);

  useEffect(() => {
    if (authLoading || !eventId) return;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [eventRes, fullEventRes, venuesRes, vendorsRes, budgetRes] = await Promise.all([
          getEventById(eventId),
          getFullEvent(eventId),
          getVenues(),
          getVendors(),
          getBudgetByEventId(eventId).catch(() => ({ data: null })),
        ]);

        const event = eventRes?.data;
        const fullEvent = fullEventRes?.data;
        const availableVenues = Array.isArray(venuesRes?.data)
          ? venuesRes.data
          : [];
        const availableVendors = Array.isArray(vendorsRes?.data)
          ? vendorsRes.data
          : [];
        const mappedVendors = Array.isArray(fullEvent?.vendors)
          ? fullEvent.vendors
          : [];

        setVenues(availableVenues);
        setVendors(availableVendors);

        if (!event) {
          setError("Event not found.");
          return;
        }

        setEventOrganizerId(event.organizerId || null);

        const rawTime = event.eventTime || "";
        const normalizedTime = rawTime ? String(rawTime).slice(0, 5) : "";

        setForm({
          title: event.title || "",
          description: event.description || "",
          eventDate: event.eventDate || "",
          eventTime: normalizedTime,
          imgUrl: event.imgUrl || "",
          venueId: event.venueId != null ? String(event.venueId) : "",
          vendorIds: mappedVendors.map((v) => v.id),
          totalBudget:
            budgetRes?.data?.totalAmount != null
              ? String(budgetRes.data.totalAmount)
              : "",
        });
      } catch {
        setError("Could not load event details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVendorToggle = (vendorId) => {
    setForm((prev) => {
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
    () => venues.find((venue) => String(venue.id) === String(form.venueId)) || null,
    [venues, form.venueId]
  );

  const selectedVendors = useMemo(
    () => vendors.filter((vendor) => form.vendorIds.includes(vendor.id)),
    [vendors, form.vendorIds]
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
  const enteredBudgetAmount = normalizeAmount(form.totalBudget);
  const remainingBudgetPreview = enteredBudgetAmount - plannedExpenseTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const title = form.title.trim();
    const description = form.description.trim();
    const eventDate = form.eventDate;
    const eventTime = form.eventTime;
    const venueId = Number(form.venueId);
    const totalBudget = Number(form.totalBudget);

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (!description) {
      setError("Description is required.");
      return;
    }

    if (!eventDate) {
      setError("Event date is required.");
      return;
    }

    if (!eventTime) {
      setError("Event time is required.");
      return;
    }

    if (!venueId) {
      setError("Please choose a venue.");
      return;
    }

    if (Number.isNaN(totalBudget) || totalBudget < 0) {
      setError("Please provide a valid total budget.");
      return;
    }

    try {
      setSaving(true);

      await updateEvent(eventId, {
        title,
        description,
        eventDate,
        eventTime: `${eventTime}:00`,
        imgUrl: form.imgUrl.trim() || null,
        venueId,
        organizerId: organizerId || eventOrganizerId,
      });

      await syncVendorsForEvent(eventId, form.vendorIds);
      await setEventBudget(eventId, totalBudget);

      await clearAutoExpenses(eventId);

      const expenseRequests = [];
      const venuePrice = Number(selectedVenue?.price);
      if (!Number.isNaN(venuePrice) && venuePrice >= 0) {
        expenseRequests.push(addEventExpense(eventId, "Venue", venuePrice));
      }

      selectedVendors.forEach((vendor) => {
        const vendorPrice = Number(vendor?.price);
        if (!Number.isNaN(vendorPrice) && vendorPrice >= 0) {
          expenseRequests.push(
            addEventExpense(
              eventId,
              `Vendor: ${vendor.name || vendor.id}`,
              vendorPrice
            )
          );
        }
      });

      if (expenseRequests.length > 0) {
        await Promise.all(expenseRequests);
      }

      setSuccess("Event updated successfully.");
      setTimeout(() => {
        router.push("/organizer_dashboard/events");
      }, 700);
    } catch {
      setError("Could not update event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#231f52]">Edit Event</h1>
        <Link
          href="/organizer_dashboard/events"
          className="rounded-lg bg-[#dcd7f2] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
        >
          Back
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
          Loading event details...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#d8cef8] bg-[#f5f1ff] p-5"
        >
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#30295e]">
                Title
              </span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
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
                value={form.venueId}
                onChange={handleChange}
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
                value={form.description}
                onChange={handleChange}
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
                value={form.eventDate}
                onChange={handleChange}
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
                value={form.eventTime}
                onChange={handleChange}
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
                value={form.imgUrl}
                onChange={handleChange}
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
                value={form.totalBudget}
                onChange={handleChange}
                placeholder="Enter total budget"
                className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
                required
              />
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-[#30295e]">
              Vendors (edit selection)
            </p>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-[#d6cdf5] bg-white p-3">
              {vendors.length === 0 ? (
                <p className="text-sm text-[#6d6990]">No vendors available.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vendors.map((vendor) => {
                    const isChecked = form.vendorIds.includes(vendor.id);
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

          <div className="mt-5 rounded-xl border border-[#d6cdf5] bg-[#ece6ff] p-4">
            <p className="text-sm font-semibold text-[#2f2960]">Budget Preview</p>
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

          <div className="mt-5 flex items-center justify-end gap-3">
            <Link
              href="/organizer_dashboard/events"
              className="rounded-xl bg-[#ddd7f3] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#4f46e5] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
