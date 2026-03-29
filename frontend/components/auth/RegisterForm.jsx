"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth.service";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    is_attendee: true,
    is_organizer: false,
    is_admin: false,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(form);

      alert("Registered successfully!");

      router.push("/login");

    } catch (err) {
      alert("Error registering");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-7 shadow-[0_18px_35px_rgba(79,70,229,0.12)]"
    >
      <h2 className="text-2xl font-bold text-[#231f52]">Register</h2>
      <p className="mt-1 text-sm text-[#666286]">
        Create your account to start organizing and managing events.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#30295e]">
            Name
          </label>
          <input
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#30295e]">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#30295e]">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
            required
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458]">
          <input
            type="checkbox"
            name="is_organizer"
            checked={form.is_organizer}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 accent-[#4f46e5]"
          />
          <span>
            I also want to organize events
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
        >
          Register
        </button>
      </div>
    </form>
  );
}