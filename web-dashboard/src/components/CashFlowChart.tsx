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

interface ChartDataPoint {
  day: number;
  pemasukan: number;
  pengeluaran: number;
}

interface CashFlowChartProps {
  chartData?: ChartDataPoint[];
  loading?: boolean;
}

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
  chartData,
  loading = false,
}: CashFlowChartProps) {
  const data = useMemo(() => {
    if (chartData && chartData.length > 0) {
      return chartData.map((item) => ({
        day: item.day.toString(),
        Pemasukan: item.pemasukan,
        Pengeluaran: item.pengeluaran,
      }));
    }
    // Fallback jika tidak ada data
    return [
      { day: "1", Pemasukan: 0, Pengeluaran: 0 },
      { day: "5", Pemasukan: 0, Pengeluaran: 0 },
      { day: "10", Pemasukan: 0, Pengeluaran: 0 },
      { day: "15", Pemasukan: 0, Pengeluaran: 0 },
      { day: "20", Pemasukan: 0, Pengeluaran: 0 },
      { day: "25", Pemasukan: 0, Pengeluaran: 0 },
      { day: "30", Pemasukan: 0, Pengeluaran: 0 },
    ];
  }, [chartData]);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden transition-colors relative group animate-float-subtle">
      {/* Decorative glow behind chart */}
      <div className="absolute top-10 left-20 w-32 h-32 bg-cyan-neon/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-neon/20 transition-colors duration-700"></div>
      {/* Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-colors relative z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
          Tren Arus Kas Bulanan
        </h2>
      </div>

      {/* Chart Body */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-neon"></div>
          </div>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
              >
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
                  stroke="#00f3ff"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#00f3ff",
                    stroke: "#050B14",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 8, stroke: "#00f3ff", strokeWidth: 3 }}
                  style={{ filter: "drop-shadow(0px 0px 8px rgba(0, 243, 255, 0.5))" }}
                />

                <Line
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#ff00ff"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#ff00ff",
                    stroke: "#050B14",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 8, stroke: "#ff00ff", strokeWidth: 3 }}
                  style={{ filter: "drop-shadow(0px 0px 8px rgba(255, 0, 255, 0.5))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
