"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getFullEvent } from "@/services/event.service";
import { bookEvent,getUserBookings } from "@/services/attendee.service";
import { useAuth } from "@/context/AuthContext";

export default function EventDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    getFullEvent(id)
      .then((res) => {
        if (!isMounted) return;
        setEvent(res.data ?? null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading event details:", err);
        setError("Unable to load event details right now. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch user bookings when user auth is complete
  useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;
    const userId = user?.id || user?.user_id || user?.userId || user?.sub;

    if (!userId) return;

    getUserBookings(userId)
      .then((res) => {
        if (!isMounted) return;
        setUserBookings(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching user bookings:", err);
        setUserBookings([]);
      });

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const eventDate = event?.eventDate ?? event?.event_date;
  const eventTime = event?.eventTime ?? event?.event_time;
  const eventImage = event?.imgUrl ?? event?.img_url ?? event?.imageUrl;
  const venueImage = event?.venue?.imgUrl ?? event?.venue?.img_url ?? event?.venue?.imageUrl;
  const vendors = Array.isArray(event?.vendors) ? event.vendors : [];

  // Check if user already registered for this event
  const eventIdNum = id ? Number(id) : null;
  const isAlreadyRegistered = userBookings.some(
    (booking) => booking.event_id === eventIdNum || Number(booking.event_id) === eventIdNum
  );

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date to be announced";

  const formattedTime = eventTime
    ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Time to be announced";

  const formatPrice = (price) => {
    if (price == null || Number.isNaN(Number(price))) return "Price not listed";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleRsvp = async () => {
    if (authLoading || rsvpLoading) return;

    if (!user) {
      window.alert("Please login first to RSVP for this event.");
      router.push("/login");
      return;
    }
    // Extract userId from user object (try multiple possible field names)
    const userId = user?.id || user?.user_id || user?.userId || user?.sub;
    
    // Extract eventId and ensure it's a number
    const eventId = id ? Number(id) : null;

    if (!userId || !eventId) {
      window.alert(`Missing details - userId: ${userId}, eventId: ${eventId}. Please refresh and try again.`);
      return;
    }

    // Check if already registered
    const isAlreadyRegistered = userBookings.some(
      (booking) => booking.event_id === eventId || Number(booking.event_id) === eventId
    );

    if (isAlreadyRegistered) {
      window.alert("You have already registered for this event!");
      return;
    }

    try {
      setRsvpLoading(true);

      // console.log("RSVP Debug - userId:", userId, "eventId:", eventId, "user object:", user);

      await bookEvent({
        userId,
        eventId,
        status: "rsvp", 
      });

      setRsvpDone(true);
      window.alert("RSVP successful");
      router.push("/bookings");
    } catch (err) {
      console.error("RSVP failed:", err);
      const message = err?.response?.data?.error || "RSVP failed. Please try again.";
      window.alert(message);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-72 rounded-3xl border border-[#dcd7f2] bg-[#f6f3ff]" />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="h-56 rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] lg:col-span-2" />
            <div className="h-56 rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] p-6 text-center text-sm text-[#666286]">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="text-sm font-semibold text-[#4f46e5] transition hover:text-[#4338ca]"
          >
            Back to events
          </Link>
          <span className="rounded-full border border-[#dcd7f2] bg-[#f6f3ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#666286]">
            Event Details
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] shadow-sm">
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="p-4 sm:p-5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#231f52] sm:text-3xl">
                {event.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#666286]">
                {event.description || "Details coming soon."}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-[#dcd7f2] bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#666286]">Date</p>
                  <p className="mt-1 text-sm font-semibold text-[#231f52]">{formattedDate}</p>
                </div>
                <div className="rounded-xl border border-[#dcd7f2] bg-white/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#666286]">Time</p>
                  <p className="mt-1 text-sm font-semibold text-[#231f52]">{formattedTime}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleRsvp}
                  disabled={authLoading || rsvpLoading || rsvpDone || isAlreadyRegistered}
                  className="inline-flex items-center justify-center rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:-translate-y-0.5 hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#4f46e5]"
                >
                  {authLoading ? "Loading..." : isAlreadyRegistered ? "Already Registered" : rsvpLoading ? "Submitting..." : rsvpDone ? "RSVP Requested" : "RSVP Now"}
                </button>
              </div>
              {rsvpDone && (
                <p className="mt-2 text-xs font-medium text-[#4f46e5]">
                  Great choice. We have noted your interest in this event.
                </p>
              )}
              {isAlreadyRegistered && !rsvpDone && (
                <p className="mt-2 text-center text-xs font-medium text-[#4f46e5]">
                  You are already registered for this event.
                </p>
              )}
            </div>

            <div className="p-3 sm:p-4 lg:p-5">
              <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl border border-[#dcd7f2] bg-[#ede9ff] sm:max-w-[360px]">
              {eventImage ? (
                <img
                  src={eventImage}
                  alt={event.title}
                  className="h-52 w-full object-cover sm:h-60"
                />
              ) : (
                <div className="flex h-52 items-center justify-center p-6 text-center text-sm font-semibold text-[#666286] sm:h-60">
                  Event visual will be updated soon.
                </div>
              )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] p-4 xl:col-span-2">
            <h2 className="text-xl font-bold text-[#231f52]">Venue</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr]">
              <div className="overflow-hidden rounded-xl border border-[#dcd7f2] bg-[#ede9ff]">
                {venueImage ? (
                  <img
                    src={venueImage}
                    alt={event.venue?.name || "Venue"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-28 items-center justify-center p-3 text-center text-xs font-semibold text-[#666286]">
                    Venue image unavailable
                  </div>
                )}
              </div>

              <div className="grid gap-1.5 text-sm text-[#666286]">
                <p>
                  <span className="font-semibold text-[#231f52]">Name:</span>{" "}
                  {event.venue?.name || "Venue not announced"}
                </p>
                <p>
                  <span className="font-semibold text-[#231f52]">Location:</span>{" "}
                  {event.venue?.location || "Location not announced"}
                </p>
                <p>
                  <span className="font-semibold text-[#231f52]">Capacity:</span>{" "}
                  {event.venue?.capacity ? `${event.venue.capacity} attendees` : "Not specified"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] p-4">
            <h2 className="text-xl font-bold text-[#231f52]">Vendors</h2>

            {vendors.length === 0 ? (
              <p className="mt-3 text-sm text-[#666286]">Vendor details will be shared soon.</p>
            ) : (
              <ul className="mt-3 grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
                {vendors.map((vendor) => (
                  <li
                    key={vendor.id}
                    className="rounded-xl border border-[#dcd7f2] bg-white/80 p-2.5"
                  >
                    <p className="text-sm font-semibold text-[#231f52]">{vendor.name}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#666286]">
                      {vendor.type || "Service"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}