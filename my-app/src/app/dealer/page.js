import { headers, cookies } from "next/headers";

async function getDealerStats() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/dealer/stats`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map(c => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  return res.json();
}

export default async function DealerDashboard() {
  const stats = await getDealerStats();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dealer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Trucks" value={stats.trucks} />
        <StatCard label="Pending Requests" value={stats.requests} />
        <StatCard label="Active Trips" value={stats.trips} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-slate-500">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
