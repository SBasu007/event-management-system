"use client";

import { useState } from "react";
import { loginUser } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [statusTab, setStatusTab] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (statusTab.message) {
      setStatusTab({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      console.log("TOKEN:", res.data?.token);

      if (!res.data?.token) {
        setStatusTab({
          type: "error",
          message: "Login failed. No token received.",
        });
        return;
      }

      //  use context
      login(res.data.token);

      setStatusTab({
        type: "success",
        message: "Login successful. Redirecting...",
      });

      // better navigation
      setTimeout(() => {
        window.location.href = "/";
      }, 800);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setStatusTab({
        type: "error",
        message: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-[#ddd6fb] bg-[#f8f6ff] p-7 shadow-[0_18px_35px_rgba(79,70,229,0.12)]"
    >
      <h2 className="text-2xl font-bold text-[#231f52]">Login</h2>
      <p className="mt-1 text-sm text-[#666286]">
        Welcome back. Continue managing your events.
      </p>

      <div className="mt-5 space-y-4">
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#d6cdf5] bg-white px-3 py-2.5 text-sm text-[#2a2458] outline-none transition focus:border-[#4f46e5]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
        >
          Login
        </button>

        {statusTab.message ? (
          <div
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              statusTab.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {statusTab.message}
          </div>
        ) : null}
      </div>
    </form>
  );
}