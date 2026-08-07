"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, formatDate } from "@/lib/api";

// Import Dasbor Khusus
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import OrangTuaDashboard from "@/components/OrangTuaDashboard";
import KepalaSekolahDashboard from "@/components/KepalaSekolahDashboard";

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

  useEffect(() => {
    // Hanya ambil data jika user adalah ADMIN_KOMITE
    if (user?.role === "ADMIN_KOMITE") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
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

  const renderMetodeBadge = (metode: string) => {
    if (metode.includes('Tunai')) return <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-md text-xs font-bold tracking-wide border border-white/10">Tunai</span>;
    if (metode.includes('Midtrans')) return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-bold tracking-wide border border-blue-400/20">Midtrans</span>;
    if (metode.includes('Transfer')) return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-bold tracking-wide border border-purple-400/20">Transfer</span>;
    return <span className="text-slate-500 text-xs">{metode}</span>;
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
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Saldo Kas Saat Ini</p>
              <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent pb-1">{formatRupiah(data.saldoKas)}</h3>
              <p className="text-xs font-medium text-slate-400">
                <span className="text-emerald-500 font-bold">Real-time</span> dari database
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Menunggak</p>
              <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-rose-400 to-red-600 bg-clip-text text-transparent pb-1">{data.totalMenunggak} Siswa</h3>
              <p className="text-xs font-medium text-slate-400">
                <span className="text-rose-500 font-bold">Aktif</span> belum lunas
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dana Cair / Settlement</p>
              <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent pb-1">{formatRupiah(data.danaCair)}</h3>
              <p className="text-xs font-medium text-slate-400">
                <span className="text-blue-400 font-bold">Via Midtrans</span> sukses
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-white tracking-tight">
                5 Transaksi Masuk Terakhir
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/30 border-b border-white/10">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Siswa
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Tagihan
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Nominal
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Metode
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-slate-300">
                      Tgl Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
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
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                          {item.siswa}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{item.tagihan}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-400 whitespace-nowrap">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-6 py-4">
                          {renderMetodeBadge(item.metode)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
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
