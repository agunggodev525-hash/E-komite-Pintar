"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ============================================
// CashFlowChart — Tren Arus Kas Bulanan
// ============================================

interface CashFlowChartProps {
  pemasukan?: number[];
  pengeluaran?: number[];
}

const DEFAULT_PEMASUKAN = [0, 40000, 80000, 80000, 120000, 120000, 120000];
const DEFAULT_PENGELUARAN = [0, 0, 0, 0, 0, 0, 0];
const DAYS = [1, 5, 10, 15, 20, 25, 30];

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatRupiahFull(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#e2e8f0",
          marginBottom: 8,
        }}
      >
        Hari ke-{label}
      </p>
      {payload.map((entry: any) => (
        <p
          key={entry.name}
          style={{
            fontSize: 12,
            color: entry.color,
            margin: "4px 0",
            fontWeight: 500,
          }}
        >
          {entry.name}: {formatRupiahFull(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function CashFlowChart({
  pemasukan = DEFAULT_PEMASUKAN,
  pengeluaran = DEFAULT_PENGELUARAN,
}: CashFlowChartProps) {
  const chartData = useMemo(
    () =>
      DAYS.map((day, i) => ({
        day: day.toString(),
        Pemasukan: pemasukan[i] ?? 0,
        Pengeluaran: pengeluaran[i] ?? 0,
      })),
    [pemasukan, pengeluaran]
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-slate-900/50">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Tren Arus Kas Bulanan
        </h2>
      </div>

      {/* Chart Body */}
      <div className="p-6">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatRupiahShort}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                align="right"
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingBottom: 16,
                  fontSize: 12,
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              />

              <Line
                type="monotone"
                dataKey="Pemasukan"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: "#34d399",
                  stroke: "#0f172a",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 7, stroke: "#34d399", strokeWidth: 2 }}
              />

              <Line
                type="monotone"
                dataKey="Pengeluaran"
                stroke="rgba(251, 113, 133, 0.6)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  r: 4,
                  fill: "rgba(251, 113, 133, 0.8)",
                  stroke: "#0f172a",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, stroke: "#fb7185", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
