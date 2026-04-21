"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function DevSignupPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/dev-signup", form);

      toast.success(res.data.message);

      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-6 rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">
          Dev Admin Signup
        </h1>

        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/20 outline-none"
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/20 outline-none"
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/20 outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/20 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}