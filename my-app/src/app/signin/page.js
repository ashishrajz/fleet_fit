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
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Account created");

      // Redirect directly to role dashboard
      router.push(role === "warehouse" ? "/warehouse" : "/dealer");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      {/* LEFT */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-12 xl:px-24 py-10 relative z-10 bg-white">

        {/* BRAND */}
        <div className="absolute top-6 left-12 xl:left-24 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center">
            <FaTruckFast />
          </div>
          <h1 className="font-bold text-xl">FitFleet</h1>
        </div>

        <div className="max-w-md mx-auto w-full mt-[80px]">
          <h1 className="text-4xl font-bold mb-3">Create account</h1>
          <p className="text-slate-500 mb-8">
            Start optimizing your fleet logistics today.
          </p>

          {/* ROLE TOGGLE */}
          <div className="flex p-1 bg-slate-100 rounded-full mb-8">
            <button
              onClick={() => setRole("warehouse")}
              className={`flex-1 py-2.5 rounded-full ${
                role === "warehouse"
                  ? "bg-white font-semibold shadow border"
                  : "text-slate-500"
              }`}
            >
              Warehouse User
            </button>

            <button
              onClick={() => setRole("dealer")}
              className={`flex-1 py-2.5 rounded-full ${
                role === "dealer"
                  ? "bg-white font-semibold shadow border"
                  : "text-slate-500"
              }`}
            >
              Truck Dealer
            </button>
          </div>

          {/* FORM */}
          <div className="flex flex-col gap-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="input"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="input"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="input"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-red-600 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-sm text-center mt-3">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-red-600 font-bold cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE — unchanged */}
      <div className="hidden lg:flex w-1/2 h-full relative">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Page;
