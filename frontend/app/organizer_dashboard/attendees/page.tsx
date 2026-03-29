"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/AuthContext";
import { getEventsByOrganizerId } from "@/services/event.service";
import { getFullAttendeesByEvent } from "@/services/attendee.service";

type EventItem = {
    id: number;
    title: string;
    description?: string;
    eventDate?: string;
    eventTime?: string;
};

type UserInfo = {
    id?: string;
    name?: string;
    email?: string;
    contact?: string;
};

type FullAttendee = {
    id: number;
    event_id: number;
    user_id: string;
    status?: string;
    user?: UserInfo;
};

export default function AttendeesPage() {
    const { user, loading: authLoading } = useAuth();
    const organizerId = useMemo(() => user?.id, [user]);

    const [events, setEvents] = useState<EventItem[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");

    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState("");
    const [attendees, setAttendees] = useState<FullAttendee[]>([]);
    const [allAttendees, setAllAttendees] = useState<FullAttendee[]>([]);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [attendeesError, setAttendeesError] = useState("");
    const [generatingReport, setGeneratingReport] = useState(false);

    const loadEvents = useCallback(async () => {
        if (!organizerId) {
            setEvents([]);
            setEventsLoading(false);
            return;
        }

        setEventsLoading(true);
        setEventsError("");

        try {
            const res = await getEventsByOrganizerId(organizerId);
            setEvents(Array.isArray(res?.data) ? (res.data as EventItem[]) : []);
        } catch {
            setEventsError("Could not load your events. Please try again.");
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    }, [organizerId]);

    useEffect(() => {
        if (authLoading) return;
        loadEvents();
    }, [authLoading, loadEvents]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr?: string) => {
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

    const handleViewAttendees = async (event: EventItem) => {
        setSelectedEventId(event.id);
        setSelectedEventTitle(event.title || "Event");
        setAttendeesLoading(true);
        setAttendeesError("");

        try {
            const res = await getFullAttendeesByEvent(event.id);
            const list = Array.isArray(res?.data) ? (res.data as FullAttendee[]) : [];
            setAllAttendees(list);
            setAttendees(list.filter((attendee) => attendee.status === "rsvp"));
        } catch {
            setAttendeesError("Could not load attendee list for this event.");
            setAllAttendees([]);
            setAttendees([]);
        } finally {
            setAttendeesLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedEventId(null);
        setSelectedEventTitle("");
        setAllAttendees([]);
        setAttendees([]);
        setAttendeesError("");
    };

    const selectedEvent = useMemo(
        () => events.find((event) => event.id === selectedEventId) || null,
        [events, selectedEventId]
    );

    const handleGeneratePdfReport = () => {
        if (!selectedEventId) return;

        try {
            setGeneratingReport(true);
            const doc = new jsPDF({ unit: "pt", format: "a4" });
            let y = 48;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("Event Attendees Report", 40, y);
            y += 28;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(`Event: ${selectedEvent?.title || selectedEventTitle || "N/A"}`, 40, y);
            y += 18;
            doc.text(`Date: ${formatDate(selectedEvent?.eventDate)}`, 40, y);
            y += 18;
            doc.text(`Time: ${formatTime(selectedEvent?.eventTime)}`, 40, y);
            y += 18;
            doc.text(`Total Attendees: ${allAttendees.length}`, 40, y);
            y += 18;
            doc.text(
                `RSVP Attendees: ${allAttendees.filter((attendee) => attendee.status === "rsvp").length}`,
                40,
                y
            );
            y += 26;

            doc.setFont("helvetica", "bold");
            doc.text("Attendee Details", 40, y);
            y += 18;

            const lineHeight = 14;
            const pageBottom = 780;

            const drawTableHeader = () => {
                doc.setFont("helvetica", "bold");
                doc.text("Name", 40, y);
                doc.text("Email", 200, y);
                doc.text("Contact", 355, y);
                doc.text("Status", 490, y);
                y += 10;
                doc.line(40, y, 555, y);
                y += 16;
                doc.setFont("helvetica", "normal");
            };

            drawTableHeader();

            if (allAttendees.length === 0) {
                doc.text("No attendees found for this event.", 40, y);
            } else {
                allAttendees.forEach((attendee) => {
                    const name = attendee.user?.name || "Unknown";
                    const email = attendee.user?.email || "-";
                    const contact = attendee.user?.contact || "-";
                    const status = (attendee.status || "-").toUpperCase();

                    const nameLines = doc.splitTextToSize(name, 150);
                    const emailLines = doc.splitTextToSize(email, 145);
                    const contactLines = doc.splitTextToSize(contact, 125);
                    const statusLines = doc.splitTextToSize(status, 65);

                    const lineCount = Math.max(
                        nameLines.length,
                        emailLines.length,
                        contactLines.length,
                        statusLines.length
                    );
                    const rowHeight = lineCount * lineHeight + 6;

                    if (y + rowHeight > pageBottom) {
                        doc.addPage();
                        y = 48;
                        drawTableHeader();
                    }

                    doc.text(nameLines, 40, y);
                    doc.text(emailLines, 200, y);
                    doc.text(contactLines, 355, y);
                    doc.text(statusLines, 490, y);
                    y += rowHeight;
                });
            }

            const blobUrl = doc.output("bloburl");
            window.open(blobUrl, "_blank", "noopener,noreferrer");
        } catch {
            setAttendeesError("Could not generate PDF report. Please try again.");
        } finally {
            setGeneratingReport(false);
        }
    };

    return (
        <div className="h-[calc(100vh-130px)] flex flex-col rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#231f52]">Attendees</h1>
                    <p className="mt-1 text-sm text-[#666286]">
                        Select an event and view RSVP user details.
                    </p>
        </div>
                {selectedEventId ? (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-lg bg-[#dcd7f2] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
                    >
                        Back to Events
                    </button>
                ) : null}
            </div>

            {!selectedEventId ? (
                <>
                    {eventsLoading ? (
                        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
                            Loading events...
                        </div>
                    ) : null}

                    {!eventsLoading && eventsError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                            {eventsError}
                        </div>
                    ) : null}

                    {!eventsLoading && !eventsError && events.length === 0 ? (
                        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
                            No events found for this organizer.
                        </div>
                    ) : null}

                    {!eventsLoading && !eventsError && events.length > 0 ? (
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="flex flex-col gap-4">
                                {events.map((event) => (
                                    <article
                                        key={event.id}
                                        className="rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 shadow-[0_10px_24px_rgba(79,70,229,0.08)]"
                                    >
                                        <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap lg:justify-between">
                                            <div className="min-w-[180px] flex-1">
                                                <h2 className="text-lg font-bold text-[#2b265f]">{event.title}</h2>
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
                                                {/* <Link
                                                    href={`/events/${event.id}`}
                                                    className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
                                                >
                                                    Preview
                                                </Link> */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewAttendees(event)}
                                                    className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
                                                >
                                                    View Attendees
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 shadow-[0_10px_24px_rgba(79,70,229,0.08)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-[#2b265f]">
                                RSVP Attendees: {selectedEventTitle}
                            </h2>
                            <button
                                type="button"
                                onClick={handleGeneratePdfReport}
                                disabled={generatingReport || attendeesLoading}
                                className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {generatingReport ? "Generating PDF..." : "Generate PDF Report"}
                            </button>
                        </div>

                        {attendeesLoading ? (
                            <div className="mt-4 rounded-xl border border-[#ddd6fb] bg-white/70 p-4 text-sm text-[#666286]">
                                Loading attendee details...
                            </div>
                        ) : null}

                        {!attendeesLoading && attendeesError ? (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {attendeesError}
                            </div>
                        ) : null}

                        {!attendeesLoading && !attendeesError && attendees.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-[#ddd6fb] bg-white/70 p-4 text-sm text-[#666286]">
                                No RSVP attendees found for this event.
                            </div>
                        ) : null}

                        {!attendeesLoading && !attendeesError && attendees.length > 0 ? (
                            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ddd6fb] bg-white/80">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-[#ece6ff] text-[#2f2960]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Name</th>
                                            <th className="px-4 py-3 font-semibold">Email</th>
                                            <th className="px-4 py-3 font-semibold">Contact</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.map((attendee) => (
                                            <tr key={attendee.id} className="border-t border-[#eee8ff] text-[#4d4a75]">
                                                <td className="px-4 py-3">{attendee.user?.name || "Unknown"}</td>
                                                <td className="px-4 py-3">{attendee.user?.email || "-"}</td>
                                                <td className="px-4 py-3">{attendee.user?.contact || "-"}</td>
                                                <td className="px-4 py-3 uppercase">{attendee.status || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}