"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Placeholder theoretical curve so the chart has shape. Real data lands in v2.
const PLACEHOLDER = [
  { n: 10, theoretical: 33, measured: null },
  { n: 100, theoretical: 664, measured: null },
  { n: 1000, theoretical: 9966, measured: null },
  { n: 10000, theoretical: 132877, measured: null },
  { n: 100000, theoretical: 1660964, measured: null },
];

export function EmpiricalChart() {
  return (
    <div className="h-64 w-full rounded-lg border border-edge bg-panel p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={PLACEHOLDER}>
          <CartesianGrid stroke="#23262d" strokeDasharray="3 3" />
          <XAxis
            dataKey="n"
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            label={{
              value: "input size (n)",
              position: "insideBottom",
              offset: -4,
              fill: "#6b7280",
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            label={{
              value: "ops",
              angle: -90,
              position: "insideLeft",
              fill: "#6b7280",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#13151a",
              border: "1px solid #23262d",
              color: "#e6e8eb",
            }}
          />
          <Line
            type="monotone"
            dataKey="theoretical"
            stroke="#34d399"
            strokeDasharray="4 4"
            dot={false}
            name="theoretical"
          />
          <Line
            type="monotone"
            dataKey="measured"
            stroke="#f59e0b"
            dot={{ r: 3 }}
            name="measured (v2)"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
