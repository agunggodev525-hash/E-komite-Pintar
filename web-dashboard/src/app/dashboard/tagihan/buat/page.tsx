"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, formatRupiah } from "@/lib/api";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ============================================
// Halaman Buat Tagihan
// ============================================

export default function BuatTagihanPage() {
  const { user } = useAuth();
  
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [nominal, setNominal] = useState("");
  const [tenggatWaktu, setTenggatWaktu] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // RBAC Check
  if (user?.role !== "ADMIN_KOMITE") {
    return (
      <DashboardLayout title="Akses Ditolak">
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center">
          <p className="text-rose-600 text-lg font-semibold mb-2">Akses Ditolak</p>
          <p className="text-slate-600">Halaman ini khusus untuk Admin Komite.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!judul.trim() || !nominal || !tenggatWaktu) {
      setError("Judul, nominal, dan tenggat waktu wajib diisi.");
      return;
    }

    const nominalValue = parseFloat(nominal.replace(/[^0-9]/g, ''));
    if (isNaN(nominalValue) || nominalValue <= 0) {
      setError("Nominal harus berupa angka lebih dari 0.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch<any>("/tagihan", {
        method: "POST",
        body: JSON.stringify({
          judul,
          deskripsi,
          nominal: nominalValue,
          tenggat_waktu: new Date(tenggatWaktu).toISOString(),
        }),
      });

      if (res.success) {
        setSuccess(res.message || "Tagihan berhasil disebarkan ke seluruh siswa!");
        setJudul("");
        setDeskripsi("");
        setNominal("");
        setTenggatWaktu("");
      } else {
        setError(res.message || "Gagal membuat tagihan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Buat Tagihan Massal"
      subtitle="Publikasikan tagihan baru ke seluruh siswa"
    >
      <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Form Tagihan</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem akan secara otomatis mendistribusikan tagihan ini ke seluruh akun siswa.</p>
        </div>

        <div className="p-6 sm:p-8">
          {success && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-800 font-bold">Berhasil Disebarkan!</p>
                <p className="text-emerald-600 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-800 font-bold">Gagal Menyimpan</p>
                <p className="text-rose-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="judul" className="block text-sm font-semibold text-slate-700 mb-2">
                Judul Tagihan
              </label>
              <input
                id="judul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: SPP Bulan Juli 2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-semibold text-slate-700 mb-2">
                Deskripsi <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                id="deskripsi"
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tambahkan detail tagihan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nominal" className="block text-sm font-semibold text-slate-700 mb-2">
                  Nominal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                  <input
                    id="nominal"
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="250000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tenggatWaktu" className="block text-sm font-semibold text-slate-700 mb-2">
                  Batas Akhir Pembayaran
                </label>
                <input
                  id="tenggatWaktu"
                  type="date"
                  value={tenggatWaktu}
                  onChange={(e) => setTenggatWaktu(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all [color-scheme:light]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gold-400 hover:bg-gold-500 text-slate-900 font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(251,191,36,0.2)] hover:shadow-[0_8px_25px_rgba(251,191,36,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses Tagihan...
                  </>
                ) : (
                  "Sebarkan Tagihan Sekarang"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
