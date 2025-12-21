import { cookies, headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Download, Share2 } from "lucide-react";

// custom components
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineChart from "@/components/profile/charts/TripsLineChart";

// --- BACKEND LOGIC (Do not touch - works for the hackathon) ---
async function getDealerProfile(id) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  // auto-detect protocol so it works on localhost and vercel
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/profile/dealer/${id}`,
    {
      cache: "no-store", // disable cache so updates show immediately
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!res.ok) throw new Error("Profile not found");
  return res.json();
}

// --- MAIN PAGE COMPONENT ---
export default async function DealerPublicProfile({ params }) {
  // Next.js 15 requires awaiting params
  const { id } = await params;

  let data;
  try {
    data = await getDealerProfile(id);
    
    // Quick sanity check: if the API returns 200 but empty objects, crash here to trigger fallback
    if (!data?.user) throw new Error("Incomplete Data");

  } catch (error) {
    // If backend blows up or ID is wrong, show this cleaner 404 state
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Unavailable</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          We couldn't load this dealer's information. It might have been removed or the ID is incorrect.
        </p>
        <Link 
          href="/warehouse/dealers" 
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  // Handle null checks so the UI doesn't break if a field is missing
  const dealerEmail = data.user?.email || "";
  const shareSubject = `Check out ${data.user?.name || 'this dealer'}'s profile`;
  const shareBody = `I found this dealer profile on Ascendo:`;

  return (
    <div className="min-h-screen ml-5 pb-12">
      
      {/* Sticky Header: Keeps navigation accessible while scrolling huge data lists */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/warehouse/dealers"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>

          <div className="flex items-center gap-3">
            {/* Hack: Using mailto for share button to avoid writing a client component for navigator.share */}
            <a
              href={`mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Share via Email"
            >
              <Share2 className="w-4 h-4" />
            </a>
            
            {/* Primary CTA */}
            <a
              href={`mailto:${dealerEmail}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
            >
              <Mail className="w-4 h-4" />
              Contact Dealer
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
          <ProfileHeader user={data.user} rating={data.stats?.avgRating || 0} />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: KPIs and Quick Actions (Requires 1/3 width on large screens) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Performance Overview
              </h3>

              <div className="space-y-4 flex-grow">
                {/* Metrics Stack */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <StatCard
                    label="Total Trips"
                    value={data.stats?.totalTrips || 0}
                    subtext="All time record"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <StatCard
                    label="Completed"
                    value={data.stats?.completedTrips || 0}
                    subtext="Successfully delivered"
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <StatCard
                    label="Rating"
                    value={data.stats?.avgRating?.toFixed(1) || "N/A"}
                    subtext="Average client score"
                  />
                </div>
              </div>

              {/* Dummy Download Button for MVP demo purposes */}
              <a 
                href="#"
                download="performance-report.pdf" 
                className="w-full mt-6 flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Download Report
              </a>
            </div>
          </div>

          {/* Right: Charts & Reviews (Requires 2/3 width) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Monthly Activity</h3>
                {/* This select is visual only for MVP, functionality requires client state */}
                <div className="text-sm bg-slate-50 text-slate-500 rounded-md py-1 px-3 border border-slate-200">
                  Last 6 Months
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                {/* Fallback if chart data is missing */}
                {data.charts?.monthlyTrips ? (
                  <TripsLineChart data={data.charts.monthlyTrips} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No chart data available
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Client Reviews</h3>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {data.ratings?.length || 0}
                </span>
              </div>

              {(!data.ratings || data.ratings.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-400 italic">No reviews yet for this dealer.</p>
                </div>
              ) : (
                <RatingList ratings={data.ratings} />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}