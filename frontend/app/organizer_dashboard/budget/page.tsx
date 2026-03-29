"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getBudgetByEventId,
  getEventsByOrganizerId,
  getExpensesByEventId,
  getRemainingBudgetByEventId,
} from "@/services/event.service";

type EventItem = {
  id: number;
  title: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
};

type EventBudgetCard = {
  event: EventItem;
  totalBudget: number;
  remainingBudget: number;
  spentBudget: number;
  spentPercent: number;
  expenseCount: number;
  hasBudget: boolean;
};

export default function BudgetPage() {
  const { user, loading: authLoading } = useAuth();
  const organizerId = useMemo(() => user?.id, [user]);

  const [cards, setCards] = useState<EventBudgetCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const loadBudgetCards = useCallback(async () => {
    if (!organizerId) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const eventsRes = await getEventsByOrganizerId(organizerId);
      const events = Array.isArray(eventsRes?.data)
        ? (eventsRes.data as EventItem[])
        : [];

      const cardPromises = events.map(async (event) => {
        const [budgetRes, remainingRes, expensesRes] = await Promise.all([
          getBudgetByEventId(event.id).catch(() => ({ data: null })),
          getRemainingBudgetByEventId(event.id).catch(() => ({ data: null })),
          getExpensesByEventId(event.id).catch(() => ({ data: [] })),
        ]);

        const totalBudgetRaw = Number(budgetRes?.data?.totalAmount);
        const remainingRaw = Number(remainingRes?.data);
        const expensesList = Array.isArray(expensesRes?.data) ? expensesRes.data : [];

        const hasBudget = !Number.isNaN(totalBudgetRaw) && totalBudgetRaw >= 0;
        const totalBudget = hasBudget ? totalBudgetRaw : 0;

        const remainingBudget =
          !Number.isNaN(remainingRaw) && remainingRaw >= 0
            ? remainingRaw
            : hasBudget
              ? totalBudget
              : 0;

        const spentBudget = hasBudget
          ? Math.max(0, totalBudget - remainingBudget)
          : 0;

        const spentPercent = hasBudget && totalBudget > 0
          ? Math.min(100, Math.max(0, (spentBudget / totalBudget) * 100))
          : 0;

        return {
          event,
          totalBudget,
          remainingBudget,
          spentBudget,
          spentPercent,
          expenseCount: expensesList.length,
          hasBudget,
        } as EventBudgetCard;
      });

      const resolvedCards = await Promise.all(cardPromises);
      setCards(resolvedCards);
    } catch {
      setError("Could not load budget overview. Please try again.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    if (authLoading) return;
    loadBudgetCards();
  }, [authLoading, loadBudgetCards]);

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#231f52]">Budget Overview</h1>
          <p className="mt-1 text-sm text-[#666286]">
            Track budget usage event-wise.
          </p>
        </div>
        <button
          type="button"
          onClick={loadBudgetCards}
          className="rounded-lg bg-[#dcd7f2] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
          Loading budget cards...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && cards.length === 0 ? (
        <div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
          No events found for this organizer.
        </div>
      ) : null}

      {!loading && !error && cards.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-4">
            {cards.map((card) => (
              <article
                key={card.event.id}
                className="rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 shadow-[0_10px_24px_rgba(79,70,229,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#2b265f]">{card.event.title}</h2>
                    <p className="mt-1 text-sm text-[#666286]">
                      {card.event.description || "No description available."}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/70 px-3 py-2 text-xs text-[#3d3970]">
                    <div>
                      <span className="font-semibold text-[#2b265f]">Date: </span>
                      {formatDate(card.event.eventDate)}
                    </div>
                    <div>
                      <span className="font-semibold text-[#2b265f]">Time: </span>
                      {formatTime(card.event.eventTime)}
                    </div>
                  </div>
                </div>

                {!card.hasBudget ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Budget not set for this event yet.
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-[#3d3970] sm:grid-cols-4">
                      <div className="rounded-lg bg-white/70 px-3 py-2">
                        <span className="font-semibold text-[#2b265f]">Total Budget: </span>
                        {formatCurrency(card.totalBudget)}
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                        <span className="font-semibold text-red-800">Spent: </span>
                        {formatCurrency(card.spentBudget)}
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700">
                        <span className="font-semibold text-green-800">Remaining: </span>
                        {formatCurrency(card.remainingBudget)}
                      </div>
                      <div className="rounded-lg bg-white/70 px-3 py-2">
                        <span className="font-semibold text-[#2b265f]">Expenses: </span>
                        {card.expenseCount}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#5f5a88]">
                        <span className="text-red-700">Spent {card.spentPercent.toFixed(1)}%</span>
                        <span className="text-green-700">
                          Remaining {(100 - card.spentPercent).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all"
                          style={{ width: `${card.spentPercent}%` }}
                        />
                      </div>

                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${Math.max(0, 100 - card.spentPercent)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


    