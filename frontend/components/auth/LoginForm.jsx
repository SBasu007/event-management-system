"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      console.log("TOKEN:", res.data?.token);

      if (!res.data?.token) {
        alert("No token received");
        return;
      }

      // ✅ use context
      login(res.data.token);

      alert("Logged in successfully!");

      // ✅ better navigation
      window.location.href = "/";

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded w-80 space-y-4">
      <h2 className="text-xl font-bold">Login</h2>

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <button className="bg-blue-500 text-white p-2 w-full">
        Login
      </button>
    </form>
  );
}