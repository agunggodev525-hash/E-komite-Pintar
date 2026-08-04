"use client";

import { useEffect, useState } from "react";
import { apiFetch, formatRupiah } from "@/lib/api";
import { Building2, Users, Wallet, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy data untuk chart tren pendapatan (Januari - Juni)
const revenueData = [
  { month: "Jan", revenue: 12000000 },
  { month: "Feb", revenue: 15500000 },
  { month: "Mar", revenue: 13000000 },
  { month: "Apr", revenue: 18000000 },
  { month: "Mei", revenue: 21000000 },
  { month: "Jun", revenue: 25000000 },
];

export default function SuperAdminDashboard() {
  const [data, setData] = useState({
    totalKlien: 0,
    totalPengguna: 0,
    estimasiTransaksi: 0,
    statusSistem: "Memuat...",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiFetch<any>("/superadmin/analytics");
        if (res.success && res.data) {
          setData({
            totalKlien: res.data.totalKlien || 0,
            totalPengguna: res.data.totalPengguna || 0,
            estimasiTransaksi: res.data.estimasiTransaksi || 0,
            statusSistem: res.data.statusSistem || "Unknown",
          });
        }
      } catch (err) {
        console.error("Gagal memuat analitik:", err);
        setData((prev) => ({ ...prev, statusSistem: "Error" }));
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Halaman */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">SaaS Analytics</h2>
        <p className="text-slate-400 text-base">
          Pantau performa dan skala operasi platform E-Komite Pintar Anda secara real-time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Baris 1: 4 Card Metrik (Glass & Glow Effect) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Sekolah */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between h-full space-y-2">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl group-hover:bg-blue-400/10 transition-colors duration-500"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-blue-600 ring-1 ring-slate-900/5 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Sekolah
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {data.totalKlien}
                </h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-400">
                  <span className="text-emerald-500 font-bold">+3%</span> vs last month
                </p>
              </div>
            </div>

            {/* Card 2: Akun */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between h-full space-y-2">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-400/5 rounded-full blur-3xl group-hover:bg-purple-400/10 transition-colors duration-500"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-blue-600 ring-1 ring-slate-900/5 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Akun
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {data.totalPengguna}
                </h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-400">
                  <span className="text-emerald-500 font-bold">+5%</span> vs last month
                </p>
              </div>
            </div>

            {/* Card 3: Pemasukan (Gradient Text) */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between h-full space-y-2">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-blue-600 ring-1 ring-slate-900/5 shadow-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Pemasukan
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent pb-1 break-words">
                  {formatRupiah(data.estimasiTransaksi)}
                </h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-400">
                  <span className="text-emerald-500 font-bold">+12%</span> vs last month
                </p>
              </div>
            </div>

            {/* Card 4: Status Sistem (Gradient Text) */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between h-full space-y-2">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-400/5 rounded-full blur-3xl group-hover:bg-teal-400/10 transition-colors duration-500"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-blue-600 ring-1 ring-slate-900/5 shadow-sm">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Status Sistem
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent pb-1 break-words">
                  {data.statusSistem}
                </h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-400">
                  <span className="text-emerald-500 font-bold">100%</span> uptime
                </p>
              </div>
            </div>

          </div>

          {/* Baris 2: Main Line Chart (Upgrade Area Grafik) */}
          <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <h3 className="text-xl font-bold tracking-tight text-slate-800">
                Grafik Tren Pendapatan SaaS
              </h3>
              <select className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-slate-100 transition-all outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer text-slate-700">
                <option>Filter: 6 Bulan Terakhir</option>
                <option>Filter: Tahun Ini</option>
                <option>Filter: Tahun Lalu</option>
              </select>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 600 }}
                    tickFormatter={(value) => `Rp ${value / 1000000}M`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      color: "#1e293b",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    itemStyle={{ color: "#3B82F6", fontWeight: "900" }}
                    formatter={(value: any) => [formatRupiah(Number(value)), "Pendapatan"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#3B82F6", stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
