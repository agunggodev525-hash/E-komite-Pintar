"use client";
import { formatRupiah } from "@/lib/api";
import { Receipt } from "lucide-react";

export default function KepalaSekolahDashboard() {
  const dummyStats = {
    saldo: 45500000,
    pengeluaranBulanIni: 12500000,
    persentaseLunas: 85, // 85%
    totalPemasukanBulanIni: 25000000
  };

  const dummyPengeluaran = [
    { id: 1, keterangan: "Perbaikan Atap Aula Utama", nominal: 5000000, nota: true },
    { id: 2, keterangan: "Pembelian AC Kelas XII", nominal: 3500000, nota: true },
    { id: 3, keterangan: "Subsidi Lomba Tingkat Nasional", nominal: 2500000, nota: true },
    { id: 4, keterangan: "Cetak Buku Panduan Komite", nominal: 1000000, nota: false },
    { id: 5, keterangan: "Konsumsi Rapat Wali Murid", nominal: 500000, nota: true },
  ];

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest relative z-10">Total Saldo Komite</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent pb-1 break-words relative z-10">{formatRupiah(dummyStats.saldo)}</h3>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 relative z-10">
            <span className="text-emerald-500 font-bold">+15%</span> vs last month
          </p>
        </div>
        
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl group-hover:bg-blue-400/10 transition-colors duration-500"></div>
          <div className="flex justify-between items-end relative z-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Pengumpulan Bulan Ini</p>
            <span className="text-sm font-bold text-blue-400">{dummyStats.persentaseLunas}% Lunas</span>
          </div>
          <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden relative z-10 border border-white/5 mt-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${dummyStats.persentaseLunas}%` }}></div>
          </div>
          <p className="text-xs font-medium text-slate-400 relative z-10 mt-2">
            <span className="text-blue-400 font-bold">On track</span> mencapai target
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col justify-between h-full space-y-2 group relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-400/5 rounded-full blur-3xl group-hover:bg-rose-400/10 transition-colors duration-500"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest relative z-10">Total Pengeluaran Bulan Ini</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-rose-400 to-red-600 bg-clip-text text-transparent pb-1 break-words relative z-10">{formatRupiah(dummyStats.pengeluaranBulanIni)}</h3>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 relative z-10">
            <span className="text-rose-500 font-bold">-5%</span> vs last month
          </p>
        </div>
      </div>

      {/* Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Kolom Kiri: Tabel 5 Pengeluaran */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden transition-colors">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">5 Pengeluaran Terbesar Bulan Ini</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 dark:text-slate-300">Keterangan</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Nominal</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {dummyPengeluaran.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-slate-900 dark:text-white text-sm">{item.keterangan}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-rose-400 whitespace-nowrap text-sm">{formatRupiah(item.nominal)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      {item.nota ? (
                        <span className="inline-flex items-center justify-center p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20" title="Nota Tersedia">
                          <Receipt className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Donut Chart Statis */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
          
          <h2 className="text-lg font-bold text-slate-900 dark:text-white w-full text-left mb-6 tracking-tight relative z-10">Pemasukan vs Pengeluaran</h2>
          
          {/* Simple CSS Donut Chart Dark Variant */}
          <div className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-lg" 
               style={{
                 background: `conic-gradient(#10b981 0% 66%, #f43f5e 66% 100%)`
               }}>
            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center shadow-inner relative z-10">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
              <span className="text-xl font-black text-emerald-400">Surplus</span>
            </div>
            {/* Dark border ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white dark:border-slate-900 opacity-50"></div>
          </div>
          
          <div className="w-full mt-8 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Pemasukan (66%)</span>
              </div>
              <span className="font-bold text-emerald-400">{formatRupiah(dummyStats.totalPemasukanBulanIni)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Pengeluaran (34%)</span>
              </div>
              <span className="font-bold text-rose-400">{formatRupiah(dummyStats.pengeluaranBulanIni)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
