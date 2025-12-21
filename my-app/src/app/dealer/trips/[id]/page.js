"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  MapPin, 
  Truck, 
  User, 
  Warehouse, 
  CheckCircle2, 
  Loader2, 
  PackageOpen,
  ArrowRight,
  Phone,
  Box
} from "lucide-react";

export default function TripDetailPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const isDealer = pathname.startsWith("/dealer");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rated, setRated] = useState(false);
  const [checkingRating, setCheckingRating] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trip");
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  const checkRating = async () => {
    try {
      setCheckingRating(true);
      const res = await fetch(`/api/ratings/trip/${id}`, { credentials: "include" });
      const data = await res.json();
      setRated(data.rated);
    } catch {
      setRated(false);
    } finally {
      setCheckingRating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/trips/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success(`Trip marked as ${newStatus.replace("_", " ")}`);
      await fetchTrip(); 
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (trip?.status === "delivered") checkRating();
  }, [trip]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Trip not found</h2>
        <Link href="/dealer/dashboard" className="text-red-600 hover:underline mt-2">Return to Dashboard</Link>
      </div>
    );
  }

  const isDelivered = trip.status === "delivered";

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">
                <Box size={14} />
                ID: {trip._id.slice(-6).toUpperCase()}
              </div>
              <div className="flex items-center gap-4 text-2xl md:text-3xl font-bold text-gray-900">
                <span className="flex items-center gap-2">
                  <MapPin className="text-red-500" size={28} />
                  {trip.shipment?.source}
                </span>
                <ArrowRight className="text-gray-300" size={24} />
                <span className="flex items-center gap-2">
                  <MapPin className="text-gray-700" size={28} />
                  {trip.shipment?.destination}
                </span>
              </div>
            </div>
            <StatusBadge status={trip.status} />
          </div>

          {/* Background Decor */}
          <div className="absolute -right-10 -top-10 text-gray-50 opacity-50 pointer-events-none">
            <Truck size={200} />
          </div>
        </div>

        {/* Timeline */}
        <Timeline status={trip.status} />

        {/* Success Animation Banner (Only shows when Delivered) */}
        {isDelivered && (
          <div className="bg-green-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-green-200 overflow-hidden relative">
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm animate-bounce">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Shipment Completed!</h3>
                <p className="text-green-100">The goods have been successfully delivered.</p>
              </div>
            </div>
            
            {/* Confetti-like decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10"></div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard 
            icon={<Warehouse className="w-6 h-6 text-blue-600" />}
            title="Warehouse"
            value={trip.warehouse?.name || "Unknown"}
            subValue={trip.warehouse?.location}
            link={trip.warehouse ? `/dealer/profile/${trip.warehouse._id}` : null}
          />
          
          <InfoCard 
            icon={<User className="w-6 h-6 text-purple-600" />}
            title="Dealer Info"
            value={trip.dealer?.name || "Unknown"}
            subValue={
              <span className="flex items-center gap-1">
                <Phone size={12} /> {trip.dealer?.contact || "N/A"}
              </span>
            }
          />

          <InfoCard 
            icon={<Truck className="w-6 h-6 text-orange-600" />}
            title="Vehicle Details"
            value={trip.truck?.truckType || "N/A"}
            subValue={`Rate: ₹${trip.truck?.costPerKm}/km`}
          />
        </div>

        {/* Action Zone (Only for Dealer) */}
        {isDealer && !isDelivered && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500 mb-2">(Refresh the page to see status)</p>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Update Trip Status</h3>
            
            <div className="flex flex-wrap justify-center gap-4">
              {trip.status === "assigned" && (
                <ActionBtn 
                  label="Confirm Pickup"
                  icon={<PackageOpen size={20} />}
                  onClick={() => handleStatusUpdate("picked")}
                  loading={updating}
                />
              )}
              
              {trip.status === "picked" && (
                <ActionBtn 
                  label="Start Transit"
                  icon={<Truck size={20} />}
                  onClick={() => handleStatusUpdate("in_transit")}
                  loading={updating}
                />
              )}
              
              {trip.status === "in_transit" && (
                <ActionBtn 
                  label="Mark as Delivered"
                  icon={<CheckCircle2 size={20} />}
                  onClick={() => handleStatusUpdate("delivered")}
                  loading={updating}
                />
              )}
            </div>
          </div>
        )}

        {/* Rating Section (Only shown when Delivered) */}
        {isDelivered && !checkingRating && (
          <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            {!rated ? (
              <RatingSection tripId={trip._id} onSuccess={() => setRated(true)} />
            ) : (
              <div className="bg-white border border-green-100 shadow-sm p-8 rounded-3xl flex flex-col items-center text-center max-w-md w-full">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Feedback Submitted</h3>
                <p className="text-gray-500 mt-2">Thank you for rating this trip.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- SUB-COMPONENTS ---------------- */

function ActionBtn({ label, onClick, icon, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-red-200
        ${loading ? "opacity-70 cursor-wait" : ""}
      `}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : icon} 
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    assigned: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20",
    picked: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
    in_transit: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20",
    delivered: "bg-green-50 text-green-700 border-green-200 ring-green-500/20",
  };

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold border ring-1 capitalize ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function InfoCard({ icon, title, value, subValue, link }) {
  const Content = (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full hover:shadow-md hover:border-red-100 transition-all group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-red-50 transition-colors">
          {icon}
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      {subValue && <div className="text-sm text-gray-500 mt-1">{subValue}</div>}
    </div>
  );

  if (link && link !== "#") {
    return <Link href={link}>{Content}</Link>;
  }
  return Content;
}

function Timeline({ status }) {
  const steps = ["assigned", "picked", "in_transit", "delivered"];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 rounded-full -z-0"></div>
        
        {/* Progress Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-green-500 rounded-full -z-0 transition-all duration-700 ease-out"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm
                ${isCompleted 
                  ? "bg-green-500 border-green-500 text-white scale-110" 
                  : "bg-white border-gray-200 text-gray-300"
                }
              `}>
                {isCompleted ? <CheckCircle2 size={20} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <span className={`
                text-xs font-bold uppercase tracking-wider hidden md:block transition-colors duration-300
                ${isCompleted ? "text-gray-900" : "text-gray-400"}
                ${isCurrent ? "text-green-600 scale-105" : ""}
              `}>
                {step.replace("_", " ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================== MODERN RATING SECTION ================== */
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
      <div className="p-8 text-center bg-gradient-to-b from-white to-slate-50">
        <div className="text-6xl mb-4 animate-bounce filter drop-shadow-md select-none">
          {getEmoji()}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">How was your trip?</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Your feedback helps us improve our delivery quality for everyone.
        </p>
      </div>

      <div className="px-8 pb-6 flex justify-center w-full bg-slate-50">
        <div className="flex gap-2" onMouseLeave={() => setHoveredStar(0)}>
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

      <div className="bg-white p-6 border-t border-slate-100">
        <div className="relative mb-4">
          <textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[120px] text-sm"
          />
        </div>

        <button
          disabled={submitting || score === 0}
          onClick={submitRating}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 shadow-sm flex items-center justify-center gap-2
            ${
              submitting || score === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5"
            }
          `}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
}