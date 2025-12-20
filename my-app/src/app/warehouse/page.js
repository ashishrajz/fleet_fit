import Link from "next/link";
import { headers, cookies } from "next/headers";

async function getShipments() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/shipments`,
    {
      cache: "no-store",
      headers: {
        // ✅ forward JWT cookie
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch shipments");
    return [];
  }

  return res.json();
}

export default async function WarehouseDashboard() {
  const shipments = await getShipments();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Shipments</h1>
        <Link
          href="/warehouse/shipments/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Shipment
        </Link>
      </div>

      {shipments.length === 0 ? (
        <p className="text-slate-500">No shipments yet</p>
      ) : (
        <div className="grid gap-4">
          {shipments.map((s) => (
            <Link
              key={s._id}
              href={`/warehouse/shipments/${s._id}`}
              className="p-4 bg-white rounded-xl shadow"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {s.source} → {s.destination}
                  </p>
                  <p className="text-sm text-slate-500">
                    Status: {s.status}
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
