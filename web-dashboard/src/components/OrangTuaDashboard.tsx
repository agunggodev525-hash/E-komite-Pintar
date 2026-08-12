"use client";

import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/lib/api";
import { Bell, Clock, History, HelpCircle, Book, Home, FileText, PieChart, User } from "lucide-react";

export default function OrangTuaDashboard() {
  const { user } = useAuth();
  
  // Dummy data
  const namaSiswa = "Budi Santoso";
  const kelasSiswa = "X-A";
  const totalTagihan = 500000;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 relative shadow-2xl overflow-hidden pb-20">
      
      {/* 1. Header Profil */}
      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900 rounded-b-3xl shadow-sm z-10 relative">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">Selamat Pagi,</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.nama_lengkap || "Bapak/Ibu"}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Wali dari: {namaSiswa} (Kelas {kelasSiswa})</p>
        </div>
        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* Konten Utama */}
      <div className="p-4 space-y-6">
        
        {/* 2. Card Tagihan Utama (Hero Section) */}
        <div className="bg-gradient-to-br from-navy-800 to-blue-500 rounded-2xl p-6 shadow-[0_10px_30px_rgba(30,58,138,0.3)] relative overflow-hidden">
          {/* Ornamen / Pattern abstrak */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Total Tagihan Belum Dibayar</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{formatRupiah(totalTagihan)}</h2>
            
            <button className="w-full mt-6 bg-white hover:bg-slate-50 text-blue-900 font-bold rounded-full py-3 px-6 transition-all shadow-md active:scale-[0.98]">
              Bayar Sekarang
            </button>
          </div>
        </div>

        {/* 3. Quick Menu (Grid 4) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 px-1">Akses Cepat</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Riwayat", icon: History, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Cicilan", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Buku Kas", icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Bantuan", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-50" },
            ].map((menu, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl ${menu.bg} flex items-center justify-center transition-transform group-hover:-translate-y-1 group-active:scale-95 shadow-sm`}>
                  <menu.icon className={`w-6 h-6 ${menu.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-600">{menu.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Tambahan Daftar Tagihan Mendatang untuk mengisi kekosongan visual */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tagihan Mendatang</h3>
            <button className="text-xs font-semibold text-blue-600">Lihat Semua</button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-4 border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">SPP Agustus 2026</p>
                <p className="text-xs text-slate-600 dark:text-slate-500 dark:text-slate-400">Jatuh tempo: 10 Ags 2026</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(750000)}</p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Navigation Bar */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 dark:border-white/10 px-6 py-3 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Tagihan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors">
          <PieChart className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Laporan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Profil</span>
        </button>
      </div>
      
    </div>
  );
}
