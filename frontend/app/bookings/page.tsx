"use client";

import { useAuth } from "@/context/AuthContext";
import { getUserBookings } from "@/services/attendee.service";
import { getEventById } from "@/services/event.service";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BookingWithEvent = {
    id: number;
    event_id: number;
    user_id: string;
    created_at?: string;
    event?: {
        id?: number;
        title?: string;
        description?: string;
        eventDate?: string;
        event_date?: string;
        eventTime?: string;
        event_time?: string;
        imgUrl?: string | null;
        img_url?: string | null;
        imageUrl?: string | null;
    };
};

export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [userBookings, setUserBookings] = useState<BookingWithEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<"upcoming" | "past">("upcoming");

    useEffect(() => {
        if (authLoading) return;

        const userId = user?.id ?? user?.user_id ?? user?.userId ?? user?.sub;
        if (!userId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const bookingRes = await getUserBookings(userId);
                const bookings = Array.isArray(bookingRes?.data) ? bookingRes.data : [];

                const enrichedBookings = await Promise.all(
                    bookings.map(async (booking: BookingWithEvent) => {
                        try {
                            const eventRes = await getEventById(booking.event_id);
                            return { ...booking, event: eventRes?.data ?? undefined };
                        } catch {
                            return { ...booking, event: undefined };
                        }
                    })
                );

                if (!isMounted) return;
                setUserBookings(enrichedBookings);
            } catch (err) {
                if (!isMounted) return;
                console.error("Failed to load bookings:", err);
                setError("Unable to load your bookings right now. Please try again.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadBookings();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredBookings = useMemo(() => {
        return userBookings.filter((booking) => {
            const dateRaw = booking.event?.eventDate ?? booking.event?.event_date;
            if (!dateRaw) return activeFilter === "upcoming";

            const eventDate = new Date(dateRaw);
            eventDate.setHours(0, 0, 0, 0);

            return activeFilter === "upcoming" ? eventDate >= today : eventDate < today;
        });
    }, [activeFilter, userBookings, today]);

    const formatDate = (date?: string) => {
        if (!date) return "Date unavailable";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            weekday: "short",
        });
    };

    const formatTime = (time?: string) => {
        if (!time) return "Time unavailable";
        return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-6xl flex-col rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] p-4 sm:p-5">
                <h1 className="text-center text-2xl font-bold text-[#231f52] sm:text-3xl">My Bookings</h1>

                <div className="mt-4 flex justify-center">
                    <div className="inline-flex rounded-xl border border-[#dcd7f2] bg-white/70 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveFilter("upcoming")}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                activeFilter === "upcoming"
                                    ? "bg-[#4f46e5] text-white"
                                    : "text-[#666286] hover:bg-[#ede9ff]"
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter("past")}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                activeFilter === "past"
                                    ? "bg-[#4f46e5] text-white"
                                    : "text-[#666286] hover:bg-[#ede9ff]"
                            }`}
                        >
                            Past
                        </button>
                    </div>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    {authLoading || loading ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-48 animate-pulse rounded-xl border border-[#dcd7f2] bg-[#ede9ff]"
                                />
                            ))}
                        </div>
                    ) : !user ? (
                        <div className="rounded-xl border border-[#dcd7f2] bg-white p-6 text-center text-sm text-[#666286]">
                            Please log in to view your bookings.
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="rounded-xl border border-[#dcd7f2] bg-white p-6 text-center text-sm text-[#666286]">
                            No {activeFilter} bookings found.
                        </div>
                    ) : (
                        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredBookings.map((booking) => {
                                const event = booking.event;
                                const title = event?.title ?? "Event";
                                const description = event?.description ?? "No description available.";
                                const eventDate = event?.eventDate ?? event?.event_date;
                                const eventTime = event?.eventTime ?? event?.event_time;
                                const eventImage = event?.imgUrl ?? event?.img_url ?? event?.imageUrl;
                                const eventId = booking.event_id ?? event?.id;

                                return (
                                    <li
                                        key={booking.id}
                                        className="overflow-hidden rounded-xl border border-[#dcd7f2] bg-white shadow-sm"
                                    >
                                        <div className="h-56 bg-[#ede9ff]">
                                            {eventImage ? (
                                                <img src={eventImage} alt={title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs font-semibold text-[#666286]">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 p-3">
                                            <h2 className="line-clamp-1 text-base font-bold text-[#231f52]">{title}</h2>
                                            <p className="line-clamp-2 text-xs text-[#666286]">{description}</p>
                                            <div className="text-xs font-medium text-[#4f46e5]">
                                                {formatDate(eventDate)} • {formatTime(eventTime)}
                                            </div>

                                            {eventId ? (
                                                <Link
                                                    href={`/events/${eventId}`}
                                                    className="inline-block rounded-lg bg-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4338ca]"
                                                >
                                                    View Event
                                                </Link>
                                            ) : null}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
        </div>
            </div>
        </div>
    );
}