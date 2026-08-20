"use client";
import useSWR from "swr";
import { formatRupiah, apiFetch } from "@/lib/api";
import { Receipt, Wallet, TrendingUp, CreditCard, ChevronRight, Activity } from "lucide-react";

export default function KepalaSekolahDashboard() {
  const fetcher = (url: string) => apiFetch<any>(url).then((res) => res.data);

  const { data, error, isLoading } = useSWR("/dashboard/sekolah", fetcher);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Memuat data finansial...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-red-500/20 rounded-full">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-red-300">Koneksi Terputus</h3>
          <p className="text-sm">Gagal memuat data dashboard eksekutif. Silakan muat ulang halaman.</p>
        </div>
      </div>
    );
  }

  const {
    saldo,
    pertumbuhanSaldo,
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    pertumbuhanPengeluaran,
    persentaseLunas,
    pengeluaranTerbesar
  } = data;

  // Calculate percentages for SVG Donut Chart
  const totalArusKas = Number(totalPemasukanBulanIni) + Number(totalPengeluaranBulanIni);
  const percentPemasukan = totalArusKas > 0 ? Math.round((Number(totalPemasukanBulanIni) / totalArusKas) * 100) : 0;
  const percentPengeluaran = totalArusKas > 0 ? Math.round((Number(totalPengeluaranBulanIni) / totalArusKas) * 100) : 0;
  
  const statusFinansial = Number(totalPemasukanBulanIni) >= Number(totalPengeluaranBulanIni) ? 'Surplus' : 'Defisit';
  const statusColor = statusFinansial === 'Surplus' ? 'text-emerald-400' : 'text-rose-400';
  
  // SVG Chart Variables
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Convert percentage to stroke-dashoffset
  const offsetPemasukan = circumference - (percentPemasukan / 100) * circumference;
  const offsetPengeluaran = circumference - (percentPengeluaran / 100) * circumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Saldo */}
        <div className="relative group bg-white/50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Total Saldo</p>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                {formatRupiah(saldo)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
              <Wallet className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${Number(pertumbuhanSaldo) >= 0 ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
              <TrendingUp className={`w-3 h-3 ${Number(pertumbuhanSaldo) < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(Number(pertumbuhanSaldo))}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">vs bulan lalu</span>
          </div>
        </div>
        
        {/* Card 2: Pengumpulan */}
        <div className="relative group bg-white/50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Pengumpulan Bulan Ini</p>
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner">
                <CreditCard className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 drop-shadow-sm">{persentaseLunas}%</span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Lunas</span>
            </div>
          </div>

          <div className="relative z-10 w-full mt-auto">
            <div className="w-full bg-slate-200/50 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-white/20 dark:border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full relative"
                style={{ width: `${persentaseLunas}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
              {Number(persentaseLunas) >= 50 ? (
                <><span className="text-blue-600 dark:text-blue-400 font-bold">On track</span> <span>Mencapai target</span></>
              ) : (
                <><span className="text-amber-500 dark:text-amber-400 font-bold">Perlu dipantau</span> <span>Di bawah ekspektasi</span></>
              )}
            </p>
          </div>
        </div>

        {/* Card 3: Pengeluaran */}
        <div className="relative group bg-white/50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Pengeluaran (Bulan Ini)</p>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                {formatRupiah(totalPengeluaranBulanIni)}
              </h3>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl shadow-inner">
              <Receipt className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${Number(pertumbuhanPengeluaran) <= 0 ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
              <TrendingUp className={`w-3 h-3 ${Number(pertumbuhanPengeluaran) <= 0 ? 'rotate-180' : ''}`} />
              {Math.abs(Number(pertumbuhanPengeluaran))}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">vs bulan lalu</span>
          </div>
        </div>

      </div>

      {/* Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Kolom Kiri: Tabel 5 Pengeluaran */}
        <div className="lg:col-span-2 bg-white/50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 sm:px-8 sm:py-6 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              Top 5 Pengeluaran Bulan Ini
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/30">
                <tr>
                  <th className="px-6 sm:px-8 py-4 font-bold tracking-widest">Keterangan</th>
                  <th className="px-6 sm:px-8 py-4 font-bold tracking-widest text-right">Nominal</th>
                  <th className="px-6 sm:px-8 py-4 font-bold tracking-widest text-center">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {pengeluaranTerbesar.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-500">
                      <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="font-medium">Belum ada pengeluaran dicatat bulan ini.</p>
                    </td>
                  </tr>
                ) : (
                  pengeluaranTerbesar.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 sm:px-8 py-4 font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-4">{index + 1}.</span>
                        {item.keterangan}
                      </td>
                      <td className="px-6 sm:px-8 py-4 text-right font-bold text-rose-500 dark:text-rose-400 whitespace-nowrap">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-6 sm:px-8 py-4 text-center">
                        {item.nota ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm transition-transform group-hover:scale-110" title="Nota Tersedia">
                            <Receipt className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Custom SVG Donut Chart */}
        <div className="bg-white/50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-center items-center">
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-lg font-bold text-slate-900 dark:text-white w-full text-center mb-8 tracking-tight relative z-10">Peta Arus Kas</h2>
          
          <div className="relative w-52 h-52 flex items-center justify-center drop-shadow-xl z-10 group">
            {/* SVG Donut */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Circle */}
              <circle
                cx="80" cy="80" r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="16"
                fill="none"
              />
              {/* Pemasukan Circle */}
              {(percentPemasukan > 0 || percentPengeluaran > 0) && (
                <circle
                  cx="80" cy="80" r={radius}
                  className="stroke-emerald-400 dark:stroke-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-all duration-1000 ease-out"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offsetPemasukan}
                />
              )}
              {/* Pengeluaran Circle (Offset by Pemasukan length) */}
              {(percentPemasukan > 0 || percentPengeluaran > 0) && (
                <circle
                  cx="80" cy="80" r={radius}
                  className="stroke-rose-400 dark:stroke-rose-500 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)] transition-all duration-1000 ease-out delay-300"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offsetPengeluaran}
                  transform={`rotate(${(percentPemasukan / 100) * 360}, 80, 80)`}
                />
              )}
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
              <span className={`text-2xl font-black ${statusColor} drop-shadow-md`}>{statusFinansial}</span>
            </div>
          </div>
          
          <div className="w-full mt-10 space-y-4 relative z-10 px-4">
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Masuk ({percentPemasukan}%)</span>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(totalPemasukanBulanIni)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-500/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                <span className="text-sm font-bold text-rose-900 dark:text-rose-100">Keluar ({percentPengeluaran}%)</span>
              </div>
              <span className="font-black text-rose-600 dark:text-rose-400">{formatRupiah(totalPengeluaranBulanIni)}</span>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
