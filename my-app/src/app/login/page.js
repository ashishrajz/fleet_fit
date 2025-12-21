"use client";

import React, { useState } from "react";
import { FaTruckFast, FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Reusable Input
const InputField = ({ label, type, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 outline-none transition-all 
      focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-500/10 placeholder:text-zinc-400"
    />
  </div>
);

const Page = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Safe role access
      const role = data.user?.role;

      if (!role) {
        toast.error("User role missing");
        return;
      }

      // Redirect by role
      router.push(`/${role}`);

      toast.success("Logged in successfully");

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white grid lg:grid-cols-2">
      {/* LEFT */}
      <div className="flex flex-col justify-center px-8 sm:px-12 xl:px-24 py-12 relative">

        {/* LOGO */}
        <div className="absolute top-8 left-8 sm:left-12 xl:left-24 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <FaTruckFast className="text-lg" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">
            FitFleet
          </span>
        </div>

        {/* FORM */}
        <div className="max-w-md w-full mx-auto mt-10 lg:mt-0">
          <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-zinc-500 mb-8 text-lg">
            Please enter your details to sign in.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputField
              label="Email Address"
              type="email"
              placeholder="alex@fitfleet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="group w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? "Signing in..." : "Sign In"}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Don't have an account?{" "}
            <a href="/register" className="text-red-600 font-bold hover:underline">
              Sign up free
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden lg:block relative p-4 h-full">
        <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop"
            alt="Highway transport"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Page;
