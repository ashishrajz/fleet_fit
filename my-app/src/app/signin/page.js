"use client";

import { FaTruckFast } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("warehouse");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Account created");
      router.push(role === "warehouse" ? "/warehouse" : "/dealer");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
      
      {/* LEFT */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10">

        {/* BRAND */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg">
            <FaTruckFast />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            FitFleet
          </span>
        </div>

        {/* CARD */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Create account
          </h1>
          <p className="text-slate-500 mt-2 mb-8">
            Optimize your fleet operations with ease.
          </p>

          {/* ROLE TOGGLE */}
          <div className="relative flex bg-slate-100 rounded-full p-1 mb-8">
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow transition-all duration-300 ${
                role === "dealer" ? "translate-x-full" : ""
              }`}
            />
            <button
              onClick={() => setRole("warehouse")}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition ${
                role === "warehouse" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              Warehouse User
            </button>
            <button
              onClick={() => setRole("dealer")}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition ${
                role === "dealer" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              Truck Dealer
            </button>
          </div>

          {/* INPUTS */}
          <div className="space-y-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400
              focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400
              focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400
              focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group w-full mt-7 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500
            py-4 text-white font-bold shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
            <FaArrowRight className="group-hover:translate-x-1 transition" />
          </button>

          <p className="text-sm text-center mt-5 text-slate-500">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="font-semibold text-red-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </div>
  );
};

export default Page;
