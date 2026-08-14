"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, formatDate } from "@/lib/api";

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
  
  const [data, setData] = useState({
    saldoKas: 0,
    totalMenunggak: 0,
    danaCair: 0,
    recentTransactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  // Chart trend data
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Period filter
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

  useEffect(() => {
    // Hanya ambil data jika user adalah ADMIN_KOMITE
    if (user?.role === "ADMIN_KOMITE") {
      fetchDashboardData();
    } else if (user) {
      // Untuk role lain, tidak ada data yang perlu dimuat — reset loading
      setLoading(false);
    }
  }, [user]);

  // Fetch chart data saat period berubah
  useEffect(() => {
    if (user?.role === "ADMIN_KOMITE") {
      fetchChartTrend(selectedPeriod);
    }
  }, [user, selectedPeriod]);

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem("ekomite_token");
      const res = await fetch("/api/backend/dashboard/admin", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Gagal mengambil data dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  async function fetchChartTrend(bulan: string) {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("ekomite_token");
      const res = await fetch(`/api/backend/dashboard/admin/chart-trend?bulan=${bulan}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setChartData(json.data.chartData);
      }
    } catch (e) {
      console.error("Gagal mengambil data chart:", e);
    } finally {
      setChartLoading(false);
    }
  };

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
        <div className="flex items-center gap-2 sm:gap-3 ml-0 lg:ml-4 flex-wrap">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400/50"
            style={{ appearance: "auto" }}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={val} value={val} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300">
                  Periode Bulan: {formatPeriodLabel(val)}
                </option>
              );
            })}
          </select>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link 
              href="/dashboard/tagihan/buat" 
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              + Buat Tagihan
            </Link>
            <Link 
              href="/dashboard/pengeluaran" 
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap border border-slate-600"
            >
              + Catat Pengeluaran
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-all duration-300">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Saldo Kas Saat Ini</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-600 bg-clip-text text-transparent pb-1 break-words">{formatRupiah(data.saldoKas)}</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">Real-time</span> dari database
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-all duration-300">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total Menunggak</p>
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-br ${data.totalMenunggak === 0 ? 'from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-600' : 'from-rose-600 to-red-800 dark:from-rose-400 dark:to-red-600'} bg-clip-text text-transparent pb-1`}>{data.totalMenunggak} Siswa</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {data.totalMenunggak === 0 ? (
                  <><span className="text-emerald-600 dark:text-emerald-500 font-bold">Semua lunas</span> — Tidak ada tunggakan</>
                ) : (
                  <><span className="text-rose-600 dark:text-rose-500 font-bold">Aktif</span> belum lunas</>
                )}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-all duration-300">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Dana Cair / Settlement</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-400 dark:to-indigo-600 bg-clip-text text-transparent pb-1 break-words">{formatRupiah(data.danaCair)}</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Belum ada pencairan
              </p>
            </div>
          </div>

          {/* Tren Arus Kas Bulanan Chart */}
          <div className="mb-6 sm:mb-8">
            <CashFlowChart chartData={chartData} loading={chartLoading} />
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg dark:shadow-xl transition-colors">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                5 Transaksi Masuk Terakhir
              </h2>
              <Link href="/dashboard/laporan" className="text-sm font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                Lihat Semua &gt;
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10 transition-colors">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Siswa
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Tagihan
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Nominal
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Metode
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Tgl Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Belum ada transaksi lunas.
                      </td>
                    </tr>
                  ) : (
                    data.recentTransactions.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {item.siswa}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.tagihan}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-6 py-4">
                          {renderMetodeBadge(item.metode)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.tanggal ? formatDate(item.tanggal) : "-"}
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
