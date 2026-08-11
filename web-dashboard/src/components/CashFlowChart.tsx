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
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
          Tren Arus Kas Bulanan
        </h2>
      </div>

      {/* Chart Body */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
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
                  stroke="#fb7185"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: "#fb7185",
                    stroke: "#0f172a",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7, stroke: "#fb7185", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
