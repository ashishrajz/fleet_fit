"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { GiTwoCoins } from "react-icons/gi";
import { FaTruckFast, FaLocationDot, FaCheck, FaBoxOpen } from "react-icons/fa6";

export default function TripDetailPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const isDealer = pathname.startsWith("/dealer");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rated, setRated] = useState(false);
  const [checkingRating, setCheckingRating] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load trip");
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      toast.error("Could not load trip");
    } finally {
      setLoading(false);
    }
  };

  const checkRating = async () => {
    setCheckingRating(true);
    try {
      const res = await fetch(`/api/ratings/trip/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setRated(data.rated);
    } catch {
      setRated(false);
    } finally {
      setCheckingRating(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (trip?.status === "delivered") {
      checkRating();
    }
  }, [trip]);

  const updateStatus = async (status) => {
    const res = await fetch(`/api/trips/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated");
    fetchTrip();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "in_transit": return "bg-blue-100 text-blue-700 border-blue-200";
      case "picked": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><span className="loading loading-spinner text-red-600"></span> Loading...</div>;
  if (!trip) return <div className="p-8 text-center text-red-500 font-bold">Trip not found</div>;

  const isDelivered = trip.status === "delivered";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      
      {isDelivered && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center h-20 w-20 mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <div className="relative inline-flex rounded-full h-20 w-20 bg-green-500 items-center justify-center shadow-lg">
               <FaCheck className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-1">Delivered Successfully</h1>
          <p className="text-green-600">The shipment has reached its destination.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Trip ID: {trip._id.slice(-6)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(trip.status)}`}>
                {trip.status.replace("_", " ")}
              </span>
            </div>
          </div>
          
          {isDealer && !isDelivered && (
             <div className="flex gap-3">
               {trip.status === "assigned" && (
                 <ActionBtn onClick={() => updateStatus("picked")} label="Mark Picked" icon={<FaBoxOpen />} />
               )}
               {trip.status === "picked" && (
                 <ActionBtn onClick={() => updateStatus("in_transit")} label="Start Transit" icon={<FaTruckFast />} />
               )}
               {trip.status === "in_transit" && (
                 <ActionBtn onClick={() => updateStatus("delivered")} label="Mark Delivered" icon={<FaCheck />} />
               )}
             </div>
           )}
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
           <div className="flex flex-col items-center">
              <FaLocationDot className="text-slate-400" />
              <div className="h-8 w-0.5 bg-slate-300 my-1"></div>
              <FaLocationDot className="text-red-500" />
           </div>
           <div className="flex flex-col gap-4 w-full">
              <div>
                 <p className="text-xs text-slate-500">Source</p>
                 <h3 className="font-semibold text-slate-800">{trip.shipment?.source}</h3>
              </div>
              <div>
                 <p className="text-xs text-slate-500">Destination</p>
                 <h3 className="font-semibold text-slate-800">{trip.shipment?.destination}</h3>
              </div>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <h3 className="text-slate-500 font-medium mb-4 flex items-center gap-2">
             <FaTruckFast className="text-slate-400"/> Logistics Info
           </h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-full text-xl shadow-sm text-red-600"><FaTruckFast/></div>
                   <div>
                      <p className="text-xs text-slate-500">Truck Type</p>
                      <p className="font-semibold text-slate-800 capitalize">{trip.truck?.truckType || "N/A"}</p>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-full text-xl shadow-sm text-yellow-600"><GiTwoCoins/></div>
                   <div>
                      <p className="text-xs text-slate-500">Cost per KM</p>
                      <p className="font-semibold text-slate-800">₹{trip.truck?.costPerKm || 0}</p>
                   </div>
                </div>
             </div>
           </div>
        </div>

        <div className="flex flex-col gap-6">
          <EntityCard
            title="Warehouse"
            name={trip.warehouse?.name}
            icon={<FaBoxOpen />}
          />
          <EntityCard
            title="Dealer"
            name={trip.dealer?.name}
            icon={<FaTruckFast />}
            link={trip.dealer?._id ? `/warehouse/profile/${trip.dealer._id}` : null}
          />
        </div>
      </div>

      {isDelivered && !checkingRating && (
        <div className="animate-in slide-in-from-bottom-4 duration-700">
          {!rated ? (
            <RatingSection
              tripId={trip._id}
              onSuccess={() => setRated(true)}
            />
          ) : (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-center justify-center gap-2 text-green-700">
              <FaCheck className="bg-green-200 rounded-full p-1 text-xl" />
              <span className="font-medium">You have submitted feedback for this trip.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EntityCard({ title, name, link, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{title}</p>
        {name ? (
          link ? (
            <Link href={link} className="text-lg font-bold text-slate-800 hover:text-red-600 transition-colors flex items-center gap-2">
              {name} 
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">View</span>
            </Link>
          ) : (
             <p className="text-lg font-bold text-slate-800">{name}</p>
          )
        ) : (
          <p className="text-slate-400 italic">Not Assigned</p>
        )}
      </div>
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-red-400/40 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm transform transition duration-300 group-hover:-translate-y-1 group-hover:scale-105">
            <div className="text-2xl text-red-400 drop-shadow-[0_3px_6px_rgba(255,0,0,0.6)]">
            {icon}
            </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-red-200"
    >
      {icon} {label}
    </button>
  );
}

function RatingSection({ tripId, onSuccess }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const getEmoji = () => {
    if (score === 0) return "🤔";
    if (score <= 2) return "😔";
    if (score === 3) return "😐";
    if (score === 4) return "🙂";
    return "🤩";
  };

  const submitRating = async () => {
    if (!score) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, score, comment }),
      });

      if (!res.ok) throw new Error("Rating failed");
      toast.success("Rating submitted");
      onSuccess();
    } catch {
      toast.error("Could not submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
      <div className="p-8 text-center">
        <div className="text-5xl mb-4 animate-bounce filter drop-shadow-sm">
          {getEmoji()}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">How was your trip?</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Your feedback helps us improve our delivery quality for everyone.
        </p>
      </div>

      <div className="px-8 pb-6 flex justify-center w-full">
        <div className="flex gap-3" onMouseLeave={() => setHoveredStar(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoveredStar(star)}
              className="group focus:outline-none transition-transform duration-200 active:scale-95 hover:scale-110"
            >
              <svg
                className={`w-10 h-10 transition-colors duration-200 ${
                  star <= (hoveredStar || score)
                    ? "text-yellow-400 fill-current drop-shadow-sm"
                    : "text-slate-200 fill-transparent stroke-current stroke-2"
                }`}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <div className="relative mb-4">
          <textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[120px] text-sm"
          />
        </div>

        <button
          disabled={submitting || score === 0}
          onClick={submitRating}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 shadow-sm
            ${
              submitting || score === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5"
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
}