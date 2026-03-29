"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-[#efecfb] px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">

        <h1 className="mt-8 max-w-3xl text-[clamp(2.3rem,6vw,4.5rem)] font-extrabold leading-[1.03] text-[#231f52]">
          Organize your very
          <br />
          own <span className="italic text-[#4f46e5]">event</span>
        </h1>

        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#666286]">
          The editorial approach to event management. Host, manage, and scale
          your experiences with us.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/organizer_dashboard"
            className="rounded-xl bg-[#4f46e5] px-10 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
          >
            Host Event
          </Link>
          <Link
            href="/events"
            className="rounded-xl bg-[#dcd7f2] px-10 py-3 text-sm font-semibold text-[#312e5a] transition hover:-translate-y-0.5 hover:bg-[#d1caee]"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </section>
  );
}
