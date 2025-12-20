"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TripDetailPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const isDealer = pathname.startsWith("/dealer");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rated, setRated] = useState(false);
  const [checkingRating, setCheckingRating] = useState(false);

  // ---------------- FETCH TRIP ----------------
  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch trip");
      }

      const data = await res.json();
      setTrip(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trip");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CHECK IF ALREADY RATED ----------------
  const checkRating = async () => {
    try {
      setCheckingRating(true);
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

  if (loading) {
    return <p className="p-8">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="p-8 text-red-500">Trip not found</p>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">
          {trip.shipment?.source} → {trip.shipment?.destination}
        </h1>
        <p className="text-slate-500">
          Status: <b>{trip.status}</b>
        </p>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6">
        <EntityCard
          title="Warehouse"
          name={trip.warehouse?.name || "Unknown"}
          link={
            trip.warehouse
              ? `/dealer/profile/${trip.warehouse._id}`
              : "#"
          }
        />
        <EntityCard
          title="Dealer"
          name={trip.dealer?.name || "Unknown"}
          
        />
      </div>

      {/* Truck */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Truck</h2>
        <p>{trip.truck?.truckType}</p>
        <p>Cost / km: ₹{trip.truck?.costPerKm}</p>
      </div>

      {/* Dealer Status Actions */}
      {isDealer && (
        <div className="flex gap-4">
          {trip.status === "assigned" && (
            <StatusButton
              label="Mark Picked"
              status="picked"
              id={id}
              onDone={fetchTrip}
            />
          )}
          {trip.status === "picked" && (
            <StatusButton
              label="Mark In Transit"
              status="in_transit"
              id={id}
              onDone={fetchTrip}
            />
          )}
          {trip.status === "in_transit" && (
            <StatusButton
              label="Mark Delivered"
              status="delivered"
              id={id}
              onDone={fetchTrip}
            />
          )}
        </div>
      )}

      {/* Rating Section (Dealer → Warehouse) */}
      {trip.status === "delivered" && !checkingRating && (
        <>
          {!rated ? (
            <RatingSection
              tripId={trip._id}
              onSuccess={() => setRated(true)}
            />
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
              You have already rated this warehouse
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function EntityCard({ title, name, link }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <Link href={link} className="text-lg font-semibold text-red-600">
        {name}
      </Link>
    </div>
  );
}

function StatusButton({ label, status, id, onDone }) {
  const update = async () => {
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
    onDone();
  };

  return (
    <button
      onClick={update}
      className="bg-red-600 text-white px-5 py-2 rounded-xl"
    >
      {label}
    </button>
  );
}

function RatingSection({ tripId, onSuccess }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRating = async () => {
    try {
      setSubmitting(true);

      const res = await fetch("/api/ratings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, score, comment }),
      });

      if (!res.ok) throw new Error();

      toast.success("Rating submitted");
      onSuccess();
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">Rate this warehouse</h2>

      <select
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="border rounded px-3 py-2 mb-3"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} ⭐
          </option>
        ))}
      </select>

      <textarea
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <button
        disabled={submitting}
        onClick={submitRating}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
