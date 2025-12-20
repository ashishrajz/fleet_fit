import Link from "next/link";
import { headers, cookies } from "next/headers";

async function getTrips() {
    const headersList = await headers();
    const cookieStore = await cookies();
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
  
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  

export default async function DealerTripsPage() {
  const trips = await getTrips();

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Active Trips</h1>

      {trips.length === 0 ? (
        <p className="text-slate-500">No trips yet</p>
      ) : (
        <div className="space-y-4">
          {trips.map(t => (
            <Link
              key={t._id}
              href={`/dealer/trips/${t._id}`}
              className="block bg-white p-6 rounded-xl shadow hover:shadow-md"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {t.shipment.source} → {t.shipment.destination}
                  </p>
                  <p className="text-sm text-slate-500">
                    Status: {t.status}
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                Warehouse: {t.warehouse?.name || "Unknown Warehouse"}

                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
