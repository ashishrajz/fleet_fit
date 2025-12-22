"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function TripsLineCharts({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No trip data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        {/* 🔥 THIS IS WHAT YOU WERE MISSING */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="count"
          stroke="#dc2626"          // 🔥 visible red
          strokeWidth={3}           // 🔥 thick
          dot={{ r: 4 }}             // 🔥 visible points
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
