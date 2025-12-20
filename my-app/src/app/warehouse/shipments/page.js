import Link from "next/link";
import { cookies, headers } from "next/headers";

async function getShipments() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");

  const res = await fetch(`http://${host}/api/shipments`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch shipments");
  }

  return res.json();
}

export default async function WarehouseShipmentsPage() {
  const shipments = await getShipments();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Shipments</h1>

        <Link
          href="/warehouse/shipments/new"
          className="bg-red-600 text-white px-5 py-2 rounded-xl font-medium"
        >
          + Create Shipment
        </Link>
      </div>

      {/* Empty state */}
      {shipments.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500">
          No shipments created yet
        </div>
      )}

      {/* Shipments list */}
      <div className="grid gap-4">
        {shipments.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-xl p-6 shadow flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">
                {s.source} → {s.destination}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Status:{" "}
                <span className="font-medium capitalize">
                  {s.status.replace("_", " ")}
                </span>
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Created on {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/warehouse/shipments/${s._id}`}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
              >
                View
              </Link>

              {s.status === "created" && (
                <Link
                  href={`/warehouse/shipments/${s._id}/optimize`}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium"
                >
                  Find Trucks
                </Link>
              )}

              {s.status !== "created" && s.trip && (
                <Link
                  href={`/warehouse/trips/${s.trip}`}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium"
                >
                  View Trip
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
