import { Star } from "lucide-react";

export default function ProfileHeader({ user, rating }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-slate-500 capitalize">{user.role}</p>
        <p className="text-xs text-slate-400 mt-1">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}
