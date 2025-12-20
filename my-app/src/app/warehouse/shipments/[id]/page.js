import Link from "next/link";
import { headers, cookies } from "next/headers";
import { Package, MapPin, Calendar, Box } from "lucide-react";

async function getShipment(id) {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/shipments/${id}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!res.ok) throw new Error("Failed to load shipment");
  return res.json();
}

export default async function ShipmentDetail({ params }) {
  const { id } = await params;
  const shipment = await getShipment(id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shipment Overview</h1>
        <p className="text-slate-500 mt-1">
          Track and manage your shipment in real time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-red-600" />
              <h2 className="text-xl font-semibold">Route</h2>
            </div>
            <p className="text-lg font-medium">
              {shipment.source} → {shipment.destination}
            </p>
          </div>

          {/* Shipment Info */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-red-600" />
              <h2 className="text-xl font-semibold">Shipment Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500">Weight</p>
                <p className="font-semibold">{shipment.weight} kg</p>
              </div>

              <div>
                <p className="text-slate-500">Volume</p>
                <p className="font-semibold">{shipment.volume} m³</p>
              </div>

              <div>
                <p className="text-slate-500">Boxes</p>
                <p className="font-semibold">{shipment.boxes}</p>
              </div>

              <div>
                <p className="text-slate-500">Deadline</p>
                <p className="font-semibold">
                  {new Date(shipment.deadline).toDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Shipment Status</h2>

            <ul className="space-y-3">
              {[
                "created",
                "requested",
                "approved",
                "picked",
                "in_transit",
                "delivered",
              ].map((status) => {
                const active = shipment.status === status;
                return (
                  <li
                    key={status}
                    className={`flex items-center gap-3 ${
                      active
                        ? "text-red-600 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${
                        active ? "bg-red-600" : "bg-slate-300"
                      }`}
                    />
                    {status.replace("_", " ")}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CTA */}
          {shipment.status === "created" && (
            <div>
              <Link
                href={`/warehouse/shipments/${shipment._id}/optimize`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Find Best Truck
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: VISUAL */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-48 bg-slate-100 flex items-center justify-center">
            <Box className="w-16 h-16 text-slate-400" />
          </div>

          <div className="p-6">
            <h3 className="font-semibold mb-2">Shipment Visual</h3>
            <p className="text-sm text-slate-500">
              This area can later show a map, route visualization, or live
              tracking once the shipment is in transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
