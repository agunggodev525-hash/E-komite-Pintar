"use client";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, formatDate } from "@/lib/api";

// ============================================
// Dashboard Home — Ringkasan Data
// ============================================

// Dummy data untuk demonstrasi
const dummyStats = {
  totalTagihan: 12,
  lunas: 8,
  belumBayar: 4,
  totalPemasukan: 15600000,
};

const dummyRecentTagihan = [
  {
    id: "1",
    siswa: "Ahmad Rizky",
    tagihan: "SPP Juli 2026",
    nominal: 750000,
    tanggal: "2026-07-28T10:00:00",
    status: "LUNAS",
    metode: "Midtrans"
  },
  {
    id: "2",
    siswa: "Siti Aisyah",
    tagihan: "SPP Juli 2026",
    nominal: 750000,
    tanggal: "2026-07-27T14:30:00",
    status: "LUNAS",
    metode: "Transfer"
  },
  {
    id: "3",
    siswa: "Budi Santoso",
    tagihan: "Kegiatan Outing",
    nominal: 350000,
    tanggal: "2026-07-25T09:15:00",
    status: "PENDING",
    metode: "Tunai"
  },
  {
    id: "4",
    siswa: "Dewi Lestari",
    tagihan: "SPP Juli 2026",
    nominal: 750000,
    tanggal: "",
    status: "BELUM_BAYAR",
    metode: "-"
  },
  {
    id: "5",
    siswa: "Fajar Nugroho",
    tagihan: "Seragam Baru",
    nominal: 450000,
    tanggal: "2026-07-20T11:00:00",
    status: "LUNAS",
    metode: "Tunai"
  },
];

// Import Dasbor Khusus
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import OrangTuaDashboard from "@/components/OrangTuaDashboard";
import KepalaSekolahDashboard from "@/components/KepalaSekolahDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  const renderMetodeBadge = (metode: string) => {
    if (metode === 'Tunai') return <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-md text-xs font-bold tracking-wide border border-white/10">Tunai</span>;
    if (metode === 'Midtrans') return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-bold tracking-wide border border-blue-400/20">Midtrans</span>;
    if (metode === 'Transfer') return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-bold tracking-wide border border-purple-400/20">Transfer</span>;
    return <span className="text-slate-500 text-xs">-</span>;
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

  // Dashboard untuk ADMIN_KOMITE / SEKOLAH
  return (
    <DashboardLayout
      title="Dashboard Utama"
      subtitle={`Selamat datang kembali, ${user?.nama_lengkap || "Admin"}!`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Saldo Kas Saat Ini</p>
          <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent pb-1">{formatRupiah(dummyStats.totalPemasukan)}</h3>
          <p className="text-xs font-medium text-slate-400">
            <span className="text-emerald-500 font-bold">+12%</span> vs last month
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Menunggak</p>
          <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-rose-400 to-red-600 bg-clip-text text-transparent pb-1">{dummyStats.belumBayar} Siswa</h3>
          <p className="text-xs font-medium text-slate-400">
            <span className="text-rose-500 font-bold">-2</span> vs last month
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group hover:-translate-y-1 transition-transform duration-300">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dana Cair / Settlement</p>
          <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent pb-1">{formatRupiah(12000000)}</h3>
          <p className="text-xs font-medium text-slate-400">
            <span className="text-blue-400 font-bold">Proses</span> ke Bank
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-white tracking-tight">
            5 Transaksi Masuk Terakhir
          </h2>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Lihat Semua
          </button>
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
              {dummyRecentTagihan.slice(0, 5).map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
