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
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded w-80 space-y-4">
      <h2 className="text-xl font-bold">Register</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        className="border p-2 w-full"
      />

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

      <button className="bg-green-500 text-white p-2 w-full">
        Register
      </button>
    </form>
  );
}