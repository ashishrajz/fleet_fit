import { cookies, headers } from "next/headers";
import Link from "next/link";

async function getTrips() {
  const cookieStore = await cookies();
  const headersList = await headers();

  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/trips`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!res.ok) {
    console.error("Trips fetch failed:", await res.text());
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function WarehouseTripsPage() {
  const trips = await getTrips();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Trips</h1>

      {trips.length === 0 ? (
        <p className="text-slate-500">No trips yet</p>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <Link
              key={trip._id}
              href={`/warehouse/trips/${trip._id}`}
              className="block bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">
                {trip.shipment?.source} → {trip.shipment?.destination}
              </p>
              <p className="text-sm text-slate-500">
                Status: {trip.status}
              </p>
              <p className="text-sm text-slate-400">
                Dealer: {trip.dealer?.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
