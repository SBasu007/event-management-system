"use client";

import { useEffect, useState } from "react";
import { getVenues } from "@/services/event.service";

type VenueItem = {
	id: number;
	name?: string;
	imgUrl?: string;
	location?: string;
	capacity?: number;
	price?: number;
};

export default function VenuesPage() {
	const [venues, setVenues] = useState<VenueItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;

		const loadVenues = async () => {
			setLoading(true);
			setError("");

			try {
				const res = await getVenues();
				if (!mounted) return;
				setVenues(Array.isArray(res?.data) ? (res.data as VenueItem[]) : []);
			} catch {
				if (!mounted) return;
				setError("Could not load venues. Please try again.");
				setVenues([]);
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		loadVenues();

		return () => {
			mounted = false;
		};
	}, []);

	const formatCurrency = (value?: number) => {
		const amount = Number(value);
		if (Number.isNaN(amount)) return "Price not listed";

		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="h-[calc(100vh-130px)] flex flex-col rounded-2xl border border-[#ddd6fb] bg-[#efecfb] p-5 shadow-[0_14px_30px_rgba(79,70,229,0.08)]">
			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#231f52]">Venues</h1>
				<p className="mt-1 text-sm text-[#666286]">
					Browse available venue details.
				</p>
			</div>

			{loading ? (
				<div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
					Loading venues...
				</div>
			) : null}

			{!loading && error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
					{error}
				</div>
			) : null}

			{!loading && !error && venues.length === 0 ? (
				<div className="rounded-xl border border-[#ddd6fb] bg-[#f8f6ff] p-5 text-sm text-[#666286]">
					No venues found.
				</div>
			) : null}

			{!loading && !error && venues.length > 0 ? (
				<div className="flex-1 overflow-y-auto pr-2">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{venues.map((venue) => (
							<article
								key={venue.id}
								className="overflow-hidden rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] shadow-[0_10px_24px_rgba(79,70,229,0.08)]"
							>
								<div className="h-44 bg-[#e5ddff]">
									{venue.imgUrl ? (
										<img
											src={venue.imgUrl}
											alt={venue.name || "Venue"}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-[#666286]">
											Venue image unavailable
										</div>
									)}
								</div>

								<div className="p-4">
									<h2 className="text-lg font-bold text-[#2b265f]">
										{venue.name || "Unnamed Venue"}
									</h2>

									<div className="mt-3 space-y-1.5 text-sm text-[#4d4a75]">
										<p>
											<span className="font-semibold text-[#2b265f]">Location: </span>
											{venue.location || "Not specified"}
										</p>
										<p>
											<span className="font-semibold text-[#2b265f]">Capacity: </span>
											{venue.capacity != null ? `${venue.capacity} people` : "Not specified"}
										</p>
										<p>
											<span className="font-semibold text-[#2b265f]">Price: </span>
											{formatCurrency(venue.price)}
										</p>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
