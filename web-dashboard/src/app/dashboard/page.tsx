"use client";

import { useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, formatDate, apiFetch } from "@/lib/api";

// Import Dasbor Khusus
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import OrangTuaDashboard from "@/components/OrangTuaDashboard";
import KepalaSekolahDashboard from "@/components/KepalaSekolahDashboard";

// Chart harus di-load secara client-only (no SSR) karena recharts pakai DOM
const CashFlowChart = dynamic(() => import("@/components/CashFlowChart"), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl p-6 h-[360px] flex items-center justify-center transition-colors">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
    </div>
  ),
});

// ============================================
// Dashboard Home — Ringkasan Data
// ============================================

export default function DashboardPage() {
  const { user } = useAuth();
  
  const now = new Date();
  const [selectedPeriod, setSelectedPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const bulanNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const formatPeriodLabel = (val: string) => {
    const [y, m] = val.split("-");
    return `${bulanNames[parseInt(m) - 1]} ${y}`;
  };

  const shouldFetch = user?.role === "ADMIN_KOMITE";
  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);

  const { data: dashboardData, error: dashboardError } = useSWR(
    shouldFetch ? "/dashboard/admin" : null,
    fetcher
  );

  const { data: trendData, error: trendError } = useSWR(
    shouldFetch ? `/dashboard/admin/chart-trend?bulan=${selectedPeriod}` : null,
    fetcher
  );

  const data = dashboardData || {
    saldoKas: 0,
    totalMenunggak: 0,
    danaCair: 0,
    recentTransactions: [] as any[]
  };
  const loading = shouldFetch && !dashboardData && !dashboardError;

  const chartData = trendData?.chartData || [];
  const chartLoading = shouldFetch && !trendData && !trendError;

  const renderMetodeBadge = (metode: string) => {
    return (
      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-white rounded-full text-xs font-semibold tracking-wide border border-slate-200 dark:border-slate-600 shadow-sm transition-colors">
        {metode}
      </span>
    );
  };

  if (user?.role === "SUPER_ADMIN") {
    return (
      <DashboardLayout
        title="Pusat Kendali Utama"
        subtitle="SaaS Control Panel"
      >
        <SuperAdminDashboard />
      </DashboardLayout>
    );
  }

  if (user?.role === "ORANG_TUA") {
    return <OrangTuaDashboard />;
  }

  if (user?.role === "SEKOLAH") {
    return (
      <DashboardLayout
        title="Dashboard Eksekutif"
        subtitle={`Selamat datang, ${user?.nama_lengkap || "Kepala Sekolah"}!`}
      >
        <KepalaSekolahDashboard />
      </DashboardLayout>
    );
  }

  // Dashboard untuk ADMIN_KOMITE / SEKOLAH (jika fallback)
  return (
    <DashboardLayout
      title="Dashboard Utama"
      subtitle={`Selamat datang kembali, ${user?.nama_lengkap || "Admin"}!`}
      titleExtra={
        <div className="flex items-center gap-2.5 ml-0 lg:ml-4 flex-wrap mt-2 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-800 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all shadow-sm"
            style={{ appearance: "auto" }}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={val} value={val}>
                  Periode Bulan: {formatPeriodLabel(val)}
                </option>
              );
            })}
          </select>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Link 
              href="/dashboard/tagihan/buat" 
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <span>+ Buat Tagihan</span>
            </Link>
            <Link 
              href="/dashboard/pengeluaran" 
              className="px-4 py-2.5 bg-white dark:bg-navy-800/80 hover:bg-slate-50 dark:hover:bg-navy-700/80 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.1] hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <span>+ Catat Pengeluaran</span>
            </Link>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
        </div>
      ) : (
        <>
          {/* STAT CARDS PREMIUM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Card 1 — Saldo Kas */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border border-emerald-100 dark:border-emerald-500/15 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-t-2xl" />
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/[0.12] rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div className="relative z-10 p-5 pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-emerald-100 dark:border-emerald-500/30">
                    <span className="text-xl">💰</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Saldo Kas<br/>Saat Ini</span>
                </div>
                <h3 className="text-2xl sm:text-[1.7rem] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-1 truncate">
                  {formatRupiah(data.saldoKas)}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  <span className="text-emerald-600 dark:text-emerald-500 font-bold tracking-wide">Real-time</span> dari database
                </p>
              </div>
            </div>

            {/* Card 2 — Total Menunggak */}
            <div className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${data.totalMenunggak === 0 ? 'border-emerald-100 dark:border-emerald-500/15 dark:hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)]' : 'border-rose-100 dark:border-rose-500/15 dark:hover:shadow-[0_8px_32px_rgba(244,63,94,0.15)]'}`}>
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${data.totalMenunggak === 0 ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' : 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500'}`} />
              <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none ${data.totalMenunggak === 0 ? 'bg-emerald-500/10 dark:bg-emerald-500/[0.12]' : 'bg-rose-500/10 dark:bg-rose-500/[0.12]'}`} />
              <div className="relative z-10 p-5 pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border ${data.totalMenunggak === 0 ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-100 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/15 border-rose-100 dark:border-rose-500/30'}`}>
                    <span className="text-xl">⚠️</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Total<br/>Menunggak</span>
                </div>
                <h3 className={`text-2xl sm:text-[1.7rem] font-extrabold tracking-tight mb-1 truncate ${data.totalMenunggak === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {data.totalMenunggak} <span className="text-xl font-bold">Siswa</span>
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {data.totalMenunggak === 0 ? (
                    <><span className="text-emerald-600 dark:text-emerald-500 font-bold tracking-wide">Semua lunas</span> — Tidak ada tunggakan</>
                  ) : (
                    <><span className="text-rose-600 dark:text-rose-500 font-bold tracking-wide">Aktif</span> belum lunas</>
                  )}
                </p>
              </div>
            </div>

            {/* Card 3 — Dana Cair */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border border-blue-100 dark:border-blue-500/15 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-t-2xl" />
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 dark:bg-blue-500/[0.12] rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div className="relative z-10 p-5 pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-blue-100 dark:border-blue-500/30">
                    <span className="text-xl">🏦</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Dana Cair /<br/>Settlement</span>
                </div>
                <h3 className="text-2xl sm:text-[1.7rem] font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-1 truncate">
                  {formatRupiah(data.danaCair)}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                  Belum ada pencairan
                </p>
              </div>
            </div>
          </div>

          {/* Tren Arus Kas Bulanan Chart */}
          <div className="mb-6 sm:mb-8">
            <CashFlowChart chartData={chartData} loading={chartLoading} />
          </div>

          <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-colors">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                  <span className="text-sm">📄</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    5 Transaksi Masuk Terakhir
                  </h2>
                </div>
              </div>
              <Link href="/dashboard/laporan" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
                Lihat Semua Laporan <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Siswa
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Tagihan
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Nominal
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Metode
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Tgl Update
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-1">
                            <span className="text-lg">📭</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada transaksi lunas</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.recentTransactions.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.siswa}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{item.tagihan}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            + {formatRupiah(item.nominal)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {renderMetodeBadge(item.metode)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-400">
                            {item.tanggal ? formatDate(item.tanggal) : "-"}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
