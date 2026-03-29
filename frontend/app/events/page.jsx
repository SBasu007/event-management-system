"use client";

import { useEffect, useRef, useState } from "react";
import { getEvents } from "@/services/event.service";
import EventCard from "@/components/EventCard";

export default function EventsPage() {
  const PAGE_SIZE = 6;
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getEvents()
      .then((res) => {
        if (!isMounted) return;

        const payload = Array.isArray(res?.data) ? res.data : [];
        setEvents(payload);
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err) => {
        if (!isMounted) return;

        console.error("Error fetching events:", err);
        setError("Unable to load events right now. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        setVisibleCount((prev) => {
          if (prev >= events.length) return prev;
          return Math.min(prev + PAGE_SIZE, events.length);
        });
      },
      {
        rootMargin: "200px 0px",
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [events.length]);

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efecfb]">
      <section className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#231f52]">Events </h1>
          <p className="mt-1 text-sm text-[#666286]">Scroll to explore upcoming events.</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#dcd7f2] bg-[#f6f3ff] p-4 sm:p-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[22rem] animate-pulse rounded-lg border border-[#dcd7f2] bg-[#ede9ff]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="rounded-lg border border-[#dcd7f2] bg-[#f9f7ff] p-6 text-center text-sm text-[#666286]">
            No events found.
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleEvents.map((event) => (
                <li key={event.id ?? event.event_id ?? `${event.title}-${event.eventDate ?? event.event_date}`}>
                  <EventCard
                    eventId={event.event_id ?? event.id}
                    title={event.title}
                    description={event.description}
                    event_date={event.event_date ?? event.eventDate}
                    event_time={event.event_time ?? event.eventTime}
                    img_url={event.img_url ?? event.imgUrl}
                  />
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-8" />

            {hasMore && (
              <p className="pt-2 text-center text-xs font-medium uppercase tracking-wide text-[#666286]">
                Loading more events...
              </p>
            )}
          </>
        )}
        </div>
      </section>
      </div>
  );
}