import { Star } from "lucide-react";

export default function RatingList({ ratings }) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-slate-500">No ratings yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Recent Ratings</h2>

      <div className="space-y-4">
        {ratings.map((r) => (
          <div key={r._id} className="border-b pb-3">
            <div className="flex items-center gap-1">
              {[...Array(r.score)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {r.comment && (
              <p className="text-sm mt-1 text-slate-600">{r.comment}</p>
            )}

            <p className="text-xs text-slate-400 mt-1">
              — {r.from.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
