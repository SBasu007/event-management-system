"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/AuthContext";
import {
	addEventExpense,
	deleteExpenseById,
	getBudgetByEventId,
	getEventsByOrganizerId,
	getExpensesByEventId,
	getRemainingBudgetByEventId,
	updateExpenseById,
} from "@/services/event.service";

type EventItem = {
	id: number;
	title: string;
	description?: string;
	eventDate?: string;
	eventTime?: string;
};

type ExpenseItem = {
	id: number;
	eventId?: number;
	event_id?: number;
	category?: string;
	amount?: number;
};

export default function ExpensesPage() {
	const { user, loading: authLoading } = useAuth();
	const organizerId = useMemo(() => user?.id, [user]);

	const [events, setEvents] = useState<EventItem[]>([]);
	const [eventsLoading, setEventsLoading] = useState(true);
	const [eventsError, setEventsError] = useState("");

	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [selectedEventTitle, setSelectedEventTitle] = useState("");

	const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
	const [expensesLoading, setExpensesLoading] = useState(false);
	const [expensesError, setExpensesError] = useState("");

	const [category, setCategory] = useState("");
	const [amount, setAmount] = useState("");
	const [savingExpense, setSavingExpense] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
	const [editCategory, setEditCategory] = useState("");
	const [editAmount, setEditAmount] = useState("");
	const [updatingExpense, setUpdatingExpense] = useState(false);
	const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);
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

	const loadExpenses = useCallback(async (eventId: number) => {
		setExpensesLoading(true);
		setExpensesError("");

		try {
			const res = await getExpensesByEventId(eventId);
			setExpenses(Array.isArray(res?.data) ? (res.data as ExpenseItem[]) : []);
		} catch {
			setExpensesError("Could not load expenses for this event.");
			setExpenses([]);
		} finally {
			setExpensesLoading(false);
		}
	}, []);

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

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 2,
		}).format(value);

	const formatCurrencyForPdf = (value: number) => {
		const safeValue = Number.isNaN(Number(value)) ? 0 : Number(value);
		return `INR ${safeValue.toLocaleString("en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	};

	const totalExpense = useMemo(
		() =>
			expenses.reduce((sum, expense) => {
				const amountValue = Number(expense.amount);
				return sum + (Number.isNaN(amountValue) ? 0 : amountValue);
			}, 0),
		[expenses]
	);

	const selectedEvent = useMemo(
		() => events.find((event) => event.id === selectedEventId) || null,
		[events, selectedEventId]
	);

	const handleManageExpenses = async (event: EventItem) => {
		setSelectedEventId(event.id);
		setSelectedEventTitle(event.title || "Event");
		setCategory("");
		setAmount("");
		setSaveError("");
		setEditingExpenseId(null);
		setEditCategory("");
		setEditAmount("");
		await loadExpenses(event.id);
	};

	const clearSelection = () => {
		setSelectedEventId(null);
		setSelectedEventTitle("");
		setExpenses([]);
		setExpensesError("");
		setCategory("");
		setAmount("");
		setSaveError("");
		setEditingExpenseId(null);
		setEditCategory("");
		setEditAmount("");
	};

	const handleStartEdit = (expense: ExpenseItem) => {
		setEditingExpenseId(expense.id);
		setEditCategory(expense.category || "");
		setEditAmount(expense.amount != null ? String(expense.amount) : "");
		setSaveError("");
	};

	const handleCancelEdit = () => {
		setEditingExpenseId(null);
		setEditCategory("");
		setEditAmount("");
	};

	const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSaveError("");

		if (!selectedEventId) return;

		const trimmedCategory = category.trim();
		const amountValue = Number(amount);

		if (!trimmedCategory) {
			setSaveError("Expense category is required.");
			return;
		}

		if (Number.isNaN(amountValue) || amountValue <= 0) {
			setSaveError("Please enter a valid expense amount.");
			return;
		}

		try {
			setSavingExpense(true);
			await addEventExpense(selectedEventId, trimmedCategory, amountValue);
			setCategory("");
			setAmount("");
			await loadExpenses(selectedEventId);
		} catch {
			setSaveError("Could not add expense. Please try again.");
		} finally {
			setSavingExpense(false);
		}
	};

	const handleUpdateExpense = async (expenseId: number) => {
		setSaveError("");

		if (!selectedEventId) return;

		const trimmedCategory = editCategory.trim();
		const amountValue = Number(editAmount);

		if (!trimmedCategory) {
			setSaveError("Expense category is required.");
			return;
		}

		if (Number.isNaN(amountValue) || amountValue <= 0) {
			setSaveError("Please enter a valid expense amount.");
			return;
		}

		try {
			setUpdatingExpense(true);
			await updateExpenseById(expenseId, trimmedCategory, amountValue);
			handleCancelEdit();
			await loadExpenses(selectedEventId);
		} catch {
			setSaveError("Could not update expense. Please try again.");
		} finally {
			setUpdatingExpense(false);
		}
	};

	const handleDeleteExpense = async (expenseId: number) => {
		setSaveError("");

		if (!selectedEventId) return;

		try {
			setDeletingExpenseId(expenseId);
			await deleteExpenseById(expenseId);
			if (editingExpenseId === expenseId) {
				handleCancelEdit();
			}
			await loadExpenses(selectedEventId);
		} catch {
			setSaveError("Could not delete expense. Please try again.");
		} finally {
			setDeletingExpenseId(null);
		}
	};

	const handleGeneratePdfReport = async () => {
		if (!selectedEventId) return;

		try {
			setGeneratingReport(true);
			setSaveError("");

			const [budgetRes, remainingRes] = await Promise.all([
				getBudgetByEventId(selectedEventId).catch(() => ({ data: null })),
				getRemainingBudgetByEventId(selectedEventId).catch(() => ({ data: null })),
			]);

			const totalBudget = Number(budgetRes?.data?.totalAmount);
			const remainingBudget = Number(remainingRes?.data);
			const spentBudget =
				!Number.isNaN(totalBudget) && !Number.isNaN(remainingBudget)
					? Math.max(0, totalBudget - remainingBudget)
					: totalExpense;

			const doc = new jsPDF({ unit: "pt", format: "a4" });
			let y = 48;

			doc.setFont("helvetica", "bold");
			doc.setFontSize(20);
			doc.text("Event Budget & Expense Report", 40, y);
			y += 28;

			doc.setFont("helvetica", "normal");
			doc.setFontSize(12);
			doc.text(`Event: ${selectedEvent?.title || selectedEventTitle || "N/A"}`, 40, y);
			y += 18;
			doc.text(`Date: ${formatDate(selectedEvent?.eventDate)}`, 40, y);
			y += 18;
			doc.text(`Time: ${formatTime(selectedEvent?.eventTime)}`, 40, y);
			y += 24;

			doc.setFont("helvetica", "bold");
			doc.text("Budget Summary", 40, y);
			y += 18;
			doc.setFont("helvetica", "normal");
			doc.text(
				`Total Budget: ${Number.isNaN(totalBudget) ? "Not set" : formatCurrencyForPdf(totalBudget)}`,
				40,
				y
			);
			y += 16;
			doc.text(
				`Total Expenses: ${formatCurrencyForPdf(totalExpense)}`,
				40,
				y
			);
			y += 16;
			doc.text(
				`Spent: ${formatCurrencyForPdf(spentBudget)}`,
				40,
				y
			);
			y += 16;
			doc.text(
				`Remaining Budget: ${
					Number.isNaN(remainingBudget) ? "Not available" : formatCurrencyForPdf(remainingBudget)
				}`,
				40,
				y
			);
			y += 26;

			doc.setFont("helvetica", "bold");
			doc.text("Expense Breakdown", 40, y);
			y += 18;
			doc.setFont("helvetica", "normal");

			if (expenses.length === 0) {
				doc.text("No expenses recorded for this event.", 40, y);
			} else {
				doc.text("Category", 40, y);
				doc.text("Amount", 430, y);
				y += 12;
				doc.line(40, y, 555, y);
				y += 18;

				expenses.forEach((expense) => {
					const amountValue = Number(expense.amount);
					const categoryText = expense.category || "-";
					const amountText = formatCurrencyForPdf(Number.isNaN(amountValue) ? 0 : amountValue);

					doc.text(categoryText, 40, y, { maxWidth: 360 });
					doc.text(amountText, 430, y);
					y += 18;

					if (y > 780) {
						doc.addPage();
						y = 48;
					}
				});
			}

			const blobUrl = doc.output("bloburl");
			window.open(blobUrl, "_blank", "noopener,noreferrer");
		} catch {
			setSaveError("Could not generate PDF report. Please try again.");
		} finally {
			setGeneratingReport(false);
		}
	};

	return (
		<div className="h-[calc(100vh-130px)] flex flex-col rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-[#231f52]">Expenses</h1>
					<p className="mt-1 text-sm text-[#666286]">
						Select an event, add expenses, and track total expense amount.
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
												<button
													type="button"
													onClick={() => handleManageExpenses(event)}
													className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
												>
													Add Expense
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
								Expenses: {selectedEventTitle}
							</h2>
							<button
								type="button"
								onClick={handleGeneratePdfReport}
								disabled={generatingReport}
								className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{generatingReport ? "Generating PDF..." : "Generate PDF Report"}
							</button>
						</div>

						<form
							onSubmit={handleAddExpense}
							className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#d6cdf5] bg-white/80 p-4 md:grid-cols-[1.4fr_1fr_auto]"
						>
							<input
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								placeholder="Expense category (e.g. Marketing, Snacks)"
								className="w-full rounded-lg border border-[#d6cdf5] bg-white px-3 py-2 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
							/>
							<input
								type="number"
								min="0"
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="Amount"
								className="w-full rounded-lg border border-[#d6cdf5] bg-white px-3 py-2 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
							/>
							<button
								type="submit"
								disabled={savingExpense}
								className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{savingExpense ? "Adding..." : "Add Expense"}
							</button>
						</form>

						{saveError ? (
							<div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								{saveError}
							</div>
						) : null}

						<div className="mt-4 rounded-xl border border-[#d6cdf5] bg-[#ece6ff] px-4 py-3 text-sm text-[#2f2960]">
							<span className="font-semibold">Total Expenses: </span>
							{formatCurrency(totalExpense)}
						</div>

						{expensesLoading ? (
							<div className="mt-4 rounded-xl border border-[#ddd6fb] bg-white/70 p-4 text-sm text-[#666286]">
								Loading expense details...
							</div>
						) : null}

						{!expensesLoading && expensesError ? (
							<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
								{expensesError}
							</div>
						) : null}

						{!expensesLoading && !expensesError && expenses.length === 0 ? (
							<div className="mt-4 rounded-xl border border-[#ddd6fb] bg-white/70 p-4 text-sm text-[#666286]">
								No expenses recorded for this event yet.
							</div>
						) : null}

						{!expensesLoading && !expensesError && expenses.length > 0 ? (
							<div className="mt-4 overflow-x-auto rounded-xl border border-[#ddd6fb] bg-white/80">
								<table className="min-w-full text-left text-sm">
									<thead className="bg-[#ece6ff] text-[#2f2960]">
										<tr>
											<th className="px-4 py-3 font-semibold">Category</th>
											<th className="px-4 py-3 font-semibold">Amount</th>
											<th className="px-4 py-3 font-semibold">Actions</th>
										</tr>
									</thead>
									<tbody>
										{expenses.map((expense) => {
											const amountValue = Number(expense.amount);
											const isEditing = editingExpenseId === expense.id;
											return (
												<tr
													key={expense.id}
													className="border-t border-[#eee8ff] text-[#4d4a75]"
												>
													<td className="px-4 py-3">
														{isEditing ? (
															<input
																value={editCategory}
																onChange={(e) => setEditCategory(e.target.value)}
																className="w-full rounded-md border border-[#d6cdf5] bg-white px-2 py-1 text-sm outline-none focus:border-[#4f46e5]"
															/>
														) : (
															expense.category || "-"
														)}
													</td>
													<td className="px-4 py-3">
														{isEditing ? (
															<input
																type="number"
																min="0"
																step="0.01"
																value={editAmount}
																onChange={(e) => setEditAmount(e.target.value)}
																className="w-full rounded-md border border-[#d6cdf5] bg-white px-2 py-1 text-sm outline-none focus:border-[#4f46e5]"
															/>
														) : (
															formatCurrency(Number.isNaN(amountValue) ? 0 : amountValue)
														)}
													</td>
													<td className="px-4 py-3">
														<div className="flex items-center gap-2">
															{isEditing ? (
																<>
																	<button
																		type="button"
																		onClick={() => handleUpdateExpense(expense.id)}
																		disabled={updatingExpense}
																		className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
																	>
																		{updatingExpense ? "Saving..." : "Save"}
																	</button>
																	<button
																		type="button"
																		onClick={handleCancelEdit}
																		className="rounded-md bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-300"
																	>
																		Cancel
																	</button>
																</>
															) : (
																<>
																	<button
																		type="button"
																		onClick={() => handleStartEdit(expense)}
																		className="rounded-md bg-[#4f46e5] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#4338ca]"
																	>
																		Edit
																	</button>
																	<button
																		type="button"
																		onClick={() => handleDeleteExpense(expense.id)}
																		disabled={deletingExpenseId === expense.id}
																		className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
																	>
																		{deletingExpenseId === expense.id ? "Deleting..." : "Delete"}
																	</button>
																</>
															)}
														</div>
													</td>
												</tr>
											);
										})}
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
