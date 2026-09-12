"use client";

import { useState } from "react";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, CreditCard, Package, Clock, AlertTriangle } from "lucide-react";
import { formatRupiah, apiFetch } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import toast from "react-hot-toast";

export default function LanggananSaaSPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data, error, mutate } = useSWR("/sekolah-paket", fetcher);
  const { data: riwayatData } = useSWR("/sekolah-paket/riwayat", fetcher);

  const tersedia = data?.tersedia || [];
  const langgananSaatIni = data?.langganan_saat_ini;
  const statusSekolah = data?.status_sekolah || "NONAKTIF";
  const langgananBerakhir = data?.langganan_berakhir;
  const riwayat = riwayatData || [];

  // Hitung sisa hari
  let sisaHari = -1;
  if (langgananBerakhir) {
    const expiryDate = new Date(langgananBerakhir);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleCheckout = async (paketId: string) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch<any>("/sekolah-paket/checkout", {
        method: "POST",
        body: JSON.stringify({ paket_id: paketId, durasi_bulan: selectedDuration })
      });

      if (res.success && res.data.redirectUrl) {
        toast.success("Mengarahkan ke halaman pembayaran...");
        window.location.assign(res.data.redirectUrl);
      } else {
        toast.error(res.message || "Gagal menginisiasi pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan server");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data && !error) {
    return (
      <DashboardLayout title="Langganan SaaS" subtitle="Memuat data langganan...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Langganan SaaS">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gagal Memuat Data</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Pastikan server backend (Render) sudah selesai diperbarui dan sedang aktif.</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-slate-200 dark:bg-navy-700/50 hover:bg-slate-300 dark:hover:bg-navy-700 rounded-lg transition-colors font-bold text-sm">
            Coba Lagi
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Langganan SaaS" 
      subtitle="Pilih dan kelola paket langganan aplikasi untuk sekolah Anda"
    >
      
      {statusSekolah === "NONAKTIF" && (
        <div className="mb-6 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-rose-800 dark:text-rose-300 text-lg">Status Sekolah: NONAKTIF</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400/80 mt-1 font-medium leading-relaxed">Sistem Anda sedang ditangguhkan. Silakan beli paket langganan untuk mengaktifkan kembali layanan secara penuh.</p>
          </div>
        </div>
      )}

      {statusSekolah === "AKTIF" && sisaHari >= 0 && sisaHari <= 7 && (
        <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-4 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg">Peringatan: Langganan Hampir Berakhir</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1 font-medium leading-relaxed">
              Masa aktif langganan Anda tersisa <strong>{sisaHari} hari</strong> lagi. Segera lakukan perpanjangan agar akses sistem tidak terputus secara otomatis.
            </p>
          </div>
        </div>
      )}

      {langgananSaatIni && statusSekolah === "AKTIF" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Paket Aktif Saat Ini</p>
              <h2 className="text-2xl font-bold">{langgananSaatIni.nama_paket}</h2>
              <div className="flex items-center gap-2 mt-2 text-emerald-50 text-sm">
                <Clock className="w-4 h-4" />
                <span>Durasi: {langgananSaatIni.durasi}</span>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30 text-center">
              <span className="block text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">Status</span>
              <span className="font-bold text-white tracking-wide">AKTIF</span>
            </div>
          </div>
          {langgananBerakhir && (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <span className="text-emerald-100 text-sm">Berakhir pada:</span>
              <span className="text-white font-bold">{new Date(langgananBerakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 md:mb-0">Paket Tersedia</h3>
        <div className="flex items-center bg-slate-100 dark:bg-navy-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          {[1, 6, 12].map(duration => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedDuration === duration ? 'bg-white dark:bg-navy-700/50 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {duration} Bulan
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {tersedia.map((paket: any) => {
          const isCurrentPlan = langgananSaatIni?.id === paket.id && statusSekolah === 'AKTIF';
          const displayedPrice = paket.harga * selectedDuration;
          
          return (
          <div 
            key={paket.id} 
            className={`bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-3xl border ${isCurrentPlan ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 dark:border-white/[0.07]'} p-7 flex flex-col justify-between shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-xl transition-all relative overflow-hidden`}
          >
            {isCurrentPlan && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SAAT INI
              </div>
            )}
            <div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-500/20">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{paket.nama_paket}</h4>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                {formatRupiah(displayedPrice)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">per {selectedDuration} Bulan</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Batas maksimal: <strong>{paket.batas_siswa === 999999 ? 'Tanpa Batas' : paket.batas_siswa} Siswa</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Akses seluruh fitur dashboard</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Dukungan pelanggan prioritas</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleCheckout(paket.id)}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 mt-4 ${
                isCurrentPlan
                  ? 'bg-slate-100 dark:bg-navy-700/50 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {isCurrentPlan ? 'Sedang Digunakan' : 'Berlangganan Sekarang'}
            </button>
          </div>
        )})}
        {tersedia.length === 0 && (
          <div className="col-span-3 text-center py-16 bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/[0.07] shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Belum ada paket yang tersedia saat ini.</p>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Riwayat Transaksi Anda</h3>
      <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Paket</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                riwayat.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(tx.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {tx.paket?.nama_paket || '-'}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                      {formatRupiah(tx.nominal)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </DashboardLayout>
  );
}
