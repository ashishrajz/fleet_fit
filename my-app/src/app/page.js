'use client'
import Image from "next/image";
import {
  FaTruckMoving,
  FaLeaf,
  FaRoute,
  FaHandHoldingUsd,
  FaUpload,
  FaCogs,
  FaCheckCircle,
} from "react-icons/fa";

import { useRouter } from "next/navigation";

// Brand Colors
const primary = "text-[#EA2831]";
const primaryBg = "bg-[#EA2831]";
const primaryGradient = "bg-gradient-to-r from-[#EA2831] to-[#D41F26]";
const subtleRedBg = "bg-[#FFF5F5]";


export default function Home() {

  const router=useRouter()

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#EA2831] selection:text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex cursor-pointer items-center gap-3">
            <div className={`${primaryGradient} flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-red-500/20`}>
              <FaTruckMoving className="text-xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              FleetFit
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#how-it-works" className="hover:text-[#EA2831] transition-colors">
              How it works
            </a>
            <a href="#dealers" className="hover:text-[#EA2831] transition-colors">
              For Dealers
            </a>
            <button className={`${primaryGradient} rounded-full px-6 py-2.5 text-white shadow-md hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300`} onClick={()=>router.push('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative mx-auto flex w-fullflex-col items-center gap-12 px-6 pt-32 pb-20 lg:flex-row lg:pt-40 lg:pb-32">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-gradient-to-br from-red-50 via-orange-50 to-transparent opacity-70 blur-3xl" />

        <div className="flex-1 space-y-8">
         

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Logistics, but it <br />
            actually <span className="bg-gradient-to-r from-[#EA2831] to-orange-600 bg-clip-text text-transparent">makes sense.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            Stop shipping air. We connect warehouses with truck dealers instantly to fill empty space. It is simple: <strong className="text-slate-900">fuller trucks, lower costs, and a happier planet.</strong>
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button className={`${primaryGradient} group flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor:pointer`} onClick={()=>router.push('/signin')}>
             Get Started
              <FaRoute className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
            
          </div>

          <div className="flex items-center gap-6 pt-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" /> No signup fees
            </span>
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" /> Real-time tracking
            </span>
          </div>
        </div>

        {/* Hero Image / Graphic */}
        <div className="relative w-full max-w-lg lg:w-1/2">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
            <img
              src="https://img.freepik.com/free-photo/transport-logistics-products_23-2151541856.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Logistics Dashboard"
              className="h-[400px] w-full object-cover"
            />
            
            {/* Floating Card UI */}
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${primaryBg} flex h-10 w-10 items-center justify-center rounded-full text-white`}>
                    <FaLeaf />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Route Optimized</p>
                    <p className="text-xs text-slate-500">London → Manchester</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">-24% CO₂</p>
                  <p className="text-[10px] text-slate-400">Saved this trip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PROBLEM / SOLUTION STATEMENT */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why is shipping still so <span className="text-[#EA2831]">complicated?</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Warehouses are stuck making phone calls. Trucks are driving around half-empty. 
            It’s a mess of spreadsheets and wasted fuel. <br /><br />
            <strong>FleetFit fixes the fragmentation.</strong> We built a platform that speaks both "Warehouse" and "Trucker," automatically matching the right load to the right vehicle.
          </p>
        </div>
      </section>

      {/* FEATURES - Bento Style */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<FaCogs className="text-2xl text-blue-600" />}
              bgClass="bg-blue-50"
              title="We do the math"
              description="Forget manual calculations. Our engine checks weight, dimensions, and timing to create the perfect loading plan instantly."
            />
            <FeatureCard
              icon={<FaHandHoldingUsd className="text-2xl text-emerald-600" />}
              bgClass="bg-emerald-50"
              title="Fuller trucks, fatter margins"
              description="When you combine shipments intelligently, cost per unit drops. Warehouses save money, and truckers earn more per mile."
            />
            <FeatureCard
              icon={<FaLeaf className="text-2xl text-green-600" />}
              bgClass="bg-green-50"
              title="Sustainability isn't just a buzzword"
              description="Fewer empty runs mean less fuel burned. We track your CO₂ savings automatically so you can hit your green targets."
            />
          </div>
        </div>
      </section>

      {/* WAREHOUSE WORKFLOW */}
      <section id="how-it-works" className="relative overflow-hidden border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 md:text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#EA2831]">For Warehouses</span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              From "Upload" to "On the Road" in minutes
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <Step
              number="01"
              icon={<FaUpload />}
              title="Upload your list"
              desc="Just drop in your shipment details. Pickup, drop-off, size, and weight. We handle the rest."
            />
            <Step
              number="02"
              icon={<FaRoute />}
              title="Get the perfect match"
              desc="Our system scans available fleets nearby. It groups compatible loads to fill the truck efficiently."
            />
            <Step
              number="03"
              icon={<FaCheckCircle />}
              title="Track & Relax"
              desc="Confirm the booking and watch the truck move in real-time on your dashboard. No phone calls needed."
            />
          </div>
        </div>
      </section>

      {/* DEALER SECTION (Dark Mode) */}
      <section id="dealers" className="bg-[#0F172A] py-24 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row">
          
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200">
              <FaTruckMoving /> <span>For Truck Owners & Dealers</span>
            </div>
            
            <h2 className="text-3xl font-bold sm:text-4xl leading-tight">
              Keep your wheels turning. <br />
              <span className="text-blue-400">Stop driving empty.</span>
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed">
              Register your fleet once. We'll keep sending you verified, high-quality loads that match your route—including that elusive return trip.
            </p>

            <ul className="space-y-4">
              {[
                "Get paid for return legs (Backhauling)",
                "One-click booking acceptance",
                "Reduce idle time by 30%"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <FaCheckCircle size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="mt-4 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-500 hover:-translate-y-1 transition-all">
              Register My Fleet
            </button>
          </div>

          {/* Dealer Stats Card */}
          <div className="relative w-full lg:w-1/2">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/80 p-8 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-700 pb-4">
                <h3 className="font-semibold text-white">Fleet Performance</h3>
                <span className="text-xs text-slate-400">Last 30 Days</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Fill Rate</p>
                  <p className="mt-1 text-3xl font-bold text-white">94%</p>
                  <span className="text-xs text-green-400">↑ 12% vs last month</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Empty Km</p>
                  <p className="mt-1 text-3xl font-bold text-white">4.2%</p>
                  <span className="text-xs text-green-400">↓ Lowest ever</span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-400 uppercase">Revenue Boost</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-50 border border-slate-100 p-8 text-center sm:p-16">
          <h2 className="text-3xl font-bold text-slate-900">Ready to optimize your logistics?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Join the warehouses and dealers saving time, money, and CO₂ with FleetFit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className={`${primaryGradient} w-full rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:-translate-y-1 transition sm:w-auto`}>
              Get Started for Free
            </button>
            <button className="w-full rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition sm:w-auto">
              Request a Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
               <div className={`${primaryGradient} flex h-8 w-8 items-center justify-center rounded-lg text-white`}>
                <FaTruckMoving className="text-sm" />
              </div>
              <span className="text-lg font-bold text-slate-900">FleetFit</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Making logistics human again. We connect the dots between warehouses and trucks to create a cleaner, smarter supply chain.
            </p>
          </div>
          
          <div className="flex gap-16 text-sm">
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-[#EA2831]">Shippers</a></li>
                <li><a href="#" className="hover:text-[#EA2831]">Carriers</a></li>
                <li><a href="#" className="hover:text-[#EA2831]">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-[#EA2831]">About</a></li>
                <li><a href="#" className="hover:text-[#EA2831]">Sustainability</a></li>
                <li><a href="#" className="hover:text-[#EA2831]">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-100 px-6 pt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FleetFit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Sub-components for cleaner code

function FeatureCard({ icon, title, description, bgClass }) {
  return (
    <div className="group rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass}`}>
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, icon, title, desc }) {
  return (
    <div className="relative flex flex-col gap-4">
      <span className="text-5xl font-black text-slate-100/80 absolute -top-4 -left-4 -z-10 select-none">
        {number}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EA2831]/10 text-[#EA2831]">
          <span className="text-xl">{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-slate-600 leading-relaxed pl-14">
        {desc}
      </p>
    </div>
  );
}