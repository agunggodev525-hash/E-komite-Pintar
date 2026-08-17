"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, formatRupiah } from "@/lib/api";
import { Bell, Clock, History, HelpCircle, Book, Home, FileText, PieChart, User, Vote, CheckCircle2, Heart } from "lucide-react";
import StatusBadge from "./StatusBadge";
import SkeletonLoader from "./SkeletonLoader";
import toast from "react-hot-toast";

export default function OrangTuaDashboard() {
  const { user } = useAuth();
  
  const { data: tagihanData, error: tagihanError, isLoading: tagihanLoading } = useSWR(
    "/tagihan/siswa/dummy-siswa-id",
    (url) => apiFetch<any>(url).then((res) => res.data)
  );

  const { data: votingData, error: votingError, isLoading: votingLoading, mutate: mutateVoting } = useSWR(
    "/voting",
    (url) => apiFetch<any[]>(url).then((res) => res.data)
  );

  const siswaInfo = tagihanData?.siswa || null;
  const summary = tagihanData?.summary || { total_tagihan: 0, lunas: 0, pending: 0, belum_bayar: 0 };
  const tagihan = tagihanData?.tagihan || [];
  const votingAktif = votingData || [];

  const loading = tagihanLoading || votingLoading;
  
  const [isPaying, setIsPaying] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Hitung total sisa tagihan dari tagihan yang belum lunas
  const totalTagihanBelumDibayar = tagihan
    .filter(t => t.status_bayar !== 'LUNAS')
    .reduce((acc, t) => {
      const diskon = t.pembayaran?.nominal_diskon || 0;
      const dibayar = t.pembayaran?.nominal_dibayar || 0;
      return acc + Math.max(0, t.nominal - diskon - dibayar);
    }, 0);

  const handleBayarSekarang = async (tagihanItem: any) => {
    try {
      setIsPaying(true);
      const res = await apiFetch<any>("/pembayaran/checkout", {
        method: "POST",
        body: JSON.stringify({
          tagihan_id: tagihanItem.id,
          siswa_id: siswaInfo?.id
        })
      });

      if (res.success && res.data.redirect_url) {
        toast.success("Mengarahkan ke pembayaran...");
        // Arahkan ke halaman Midtrans
        window.location.href = res.data.redirect_url;
      } else {
        toast.error(res.message || "Gagal menginisiasi pembayaran.");
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan: " + error.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleVote = async (voting_id: string, kandidat_id: string) => {
    try {
      setIsVoting(true);

      // Optimistic UI Update: langsung ubah UI seolah-olah sukses
      mutateVoting(
        (currentData: any[]) => {
          if (!currentData) return currentData;
          return currentData.map((v) =>
            v.id === voting_id ? { ...v, hasVoted: true } : v
          );
        },
        false // Jangan revalidate langsung
      );

      const res = await apiFetch<any>("/voting/vote", {
        method: "POST",
        body: JSON.stringify({ voting_id, kandidat_id })
      });
      
      if (res.success) {
        toast.success("Suara Anda berhasil dicatat!");
        mutateVoting(); // Background sync data asli dari server
      } else {
        toast.error(res.message || "Gagal memberikan suara.");
        mutateVoting(); // Rollback UI jika gagal
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem.");
      mutateVoting(); // Rollback UI jika gagal
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md sm:max-w-lg mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 p-4 space-y-6 pt-10">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-3xl p-4">
          <SkeletonLoader type="card" count={1} className="!h-16 w-3/4" />
          <SkeletonLoader type="circle" count={1} />
        </div>
        <SkeletonLoader type="card" count={1} className="!h-32" />
        <div className="grid grid-cols-4 gap-3">
          <SkeletonLoader type="card" count={4} className="!h-20" />
        </div>
        <SkeletonLoader type="card" count={3} className="!h-24" />
      </div>
    );
  }

  return (
    <div className="max-w-md sm:max-w-lg mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 relative shadow-2xl overflow-x-hidden overflow-y-auto pb-32">
      
      {/* 1. Header Profil */}
      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900 rounded-b-3xl shadow-sm z-10 relative">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Selamat Datang,</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.nama_lengkap || "Bapak/Ibu Wali"}</h1>
          {siswaInfo && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Wali dari: {siswaInfo.nama_siswa} (Kelas {siswaInfo.kelas})</p>
          )}
        </div>
        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <Bell className="w-6 h-6 text-slate-600" />
          {summary.belum_bayar > 0 && (
            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </div>

      {/* Konten Utama */}
      <div className="p-4 space-y-6">
        
        {/* 2. Card Tagihan Utama (Hero Section) */}
        <div className="bg-gradient-to-br from-navy-800 to-blue-600 rounded-2xl p-6 shadow-[0_10px_30px_rgba(30,58,138,0.3)] relative overflow-hidden">
          {/* Ornamen / Pattern abstrak */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Total Sisa Tagihan</p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {totalTagihanBelumDibayar === 0 ? "Lunas 🎉" : formatRupiah(totalTagihanBelumDibayar)}
              </h2>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="text-white/80 text-xs">
                <span className="font-bold text-white text-base">{summary.belum_bayar + summary.pending}</span> Tagihan Menunggu
              </div>
              <div className="text-white/80 text-xs text-right">
                <span className="font-bold text-emerald-300 text-base">{summary.lunas}</span> Sudah Lunas
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Menu (Grid 4) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 px-1">Akses Cepat</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "E-Voting", icon: Vote, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Keuangan", icon: PieChart, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Donasi", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
              { label: "Informasi", icon: Bell, color: "text-purple-500", bg: "bg-purple-50" },
            ].map((menu, i) => (
              <button key={i} onClick={() => toast.success(`Fitur ${menu.label} segera hadir!`)} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl ${menu.bg} flex items-center justify-center transition-transform group-hover:-translate-y-1 group-active:scale-95 shadow-sm`}>
                  <menu.icon className={`w-6 h-6 ${menu.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{menu.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Widget E-Voting */}
        {votingAktif.length > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Vote className="w-4 h-4 text-emerald-500" />
                E-Voting Komite Aktif
              </h3>
            </div>
            
            <div className="space-y-4">
              {votingAktif.map(voting => (
                <div key={voting.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{voting.judul}</h4>
                  <p className="text-xs text-slate-500 mb-4">{voting.deskripsi}</p>
                  
                  {voting.hasVoted ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm text-emerald-800 font-medium">Terima kasih! Anda sudah menyumbangkan suara.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Pilih salah satu kandidat:</p>
                      {voting.kandidat.map((kand: any) => (
                        <button
                          key={kand.id}
                          onClick={() => {
                            if (window.confirm(`Yakin ingin memberikan suara untuk ${kand.nama_kandidat}?`)) {
                              handleVote(voting.id, kand.id);
                            }
                          }}
                          disabled={isVoting}
                          className="w-full text-left p-3 border border-slate-200 dark:border-white/10 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
                        >
                          {kand.nama_kandidat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 5. Daftar Tagihan Anak */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rincian Tagihan</h3>
            <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">{tagihan.length} Data</span>
          </div>
          
          <div className="space-y-3">
            {tagihan.length === 0 ? (
              <div className="text-center py-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10">
                <p className="text-sm text-slate-500">Belum ada tagihan/data</p>
              </div>
            ) : (
              tagihan.map(item => {
                const diskon = item.pembayaran?.nominal_diskon || 0;
                const dibayar = item.pembayaran?.nominal_dibayar || 0;
                const sisa = Math.max(0, item.nominal - diskon - dibayar);

                return (
                  <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.judul}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Batas: {new Date(item.tenggat_waktu).toLocaleDateString('id-ID')}</p>
                      </div>
                      <StatusBadge status={item.status_bayar} />
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        {diskon > 0 && (
                          <p className="text-xs text-emerald-600 font-medium mb-0.5">Ada Diskon: -{formatRupiah(diskon)}</p>
                        )}
                        {item.status_bayar === 'LUNAS' ? (
                          <p className="text-sm font-bold text-slate-500 line-through">{formatRupiah(item.nominal)}</p>
                        ) : (
                          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Sisa: {formatRupiah(sisa)}</p>
                        )}
                      </div>
                      
                      {item.status_bayar !== 'LUNAS' && (
                        <button 
                          onClick={() => handleBayarSekarang(item)}
                          disabled={isPaying}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 6. Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 px-6 py-3 flex justify-between items-center z-50">
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
