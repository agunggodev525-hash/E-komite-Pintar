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
  const { data: riwayatData, mutate: mutateRiwayat } = useSWR("/sekolah-paket/riwayat", fetcher);

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
          <button onClick={() => mutate()} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
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
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-800 dark:text-rose-300">Status Sekolah: NONAKTIF</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">Sistem Anda sedang ditangguhkan. Silakan beli paket langganan untuk mengaktifkan kembali layanan secara penuh.</p>
          </div>
        </div>
      )}

      {statusSekolah === "AKTIF" && sisaHari >= 0 && sisaHari <= 7 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300">Peringatan: Langganan Hampir Berakhir</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
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
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[1, 6, 12].map(duration => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedDuration === duration ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
            className={`bg-white dark:bg-slate-900 rounded-2xl border ${isCurrentPlan ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-white/10'} p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
          >
            {isCurrentPlan && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SAAT INI
              </div>
            )}
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
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
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                isCurrentPlan
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {isCurrentPlan ? 'Sedang Digunakan' : 'Berlangganan Sekarang'}
            </button>
          </div>
        )})}
        {tersedia.length === 0 && (
          <div className="col-span-3 text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10">
            <p className="text-slate-500">Belum ada paket yang tersedia saat ini.</p>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Riwayat Transaksi Anda</h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Paket</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Nominal</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                riwayat.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(tx.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {tx.paket?.nama_paket || '-'}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatRupiah(tx.nominal)}
                    </td>
                    <td className="px-6 py-4">
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
