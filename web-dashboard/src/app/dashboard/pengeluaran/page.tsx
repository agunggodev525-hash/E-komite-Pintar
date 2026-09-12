"use client";

import { useState } from "react";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { formatRupiah, apiFetch, formatDate } from "@/lib/api";
import { Plus, Camera, UploadCloud, X, Search, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { TableRowSkeleton } from "@/components/Skeleton";

export default function PengeluaranPage() {
  const fetcher = (url: string) => apiFetch<any[]>(url).then(res => res.data);
  const { data, error, mutate: fetchPengeluaran } = useSWR("/pengeluaran", fetcher);
  const pengeluaran = data || [];
  const loading = !data && !error;

  // States for Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formNominal, setFormNominal] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formKategori, setFormKategori] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file melebihi batas 2MB.');
        return;
      }
      setFormFile(file);
    } else if (file) {
      toast.error('Hanya file gambar yang diperbolehkan.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeterangan || !formNominal || !formTanggal) return;
    
    try {
      // Gunakan FormData agar file nota bisa ikut dikirim
      const formDataPayload = new FormData();
      formDataPayload.append('tanggal', formTanggal);
      formDataPayload.append('keterangan', formKeterangan);
      formDataPayload.append('nominal', String(parseInt(formNominal.replace(/[^0-9]/g, '') || "0")));
      formDataPayload.append('kategori', formKategori || 'Lain-lain');
      if (formFile) {
        formDataPayload.append('nota', formFile);
      }

      await apiFetch("/pengeluaran", {
        method: "POST",
        body: formDataPayload,
      });
      
      toast.success("Pengeluaran berhasil dicatat!");
      setShowAddModal(false);
      setFormKeterangan("");
      setFormNominal("");
      setFormTanggal("");
      setFormKategori("");
      setFormFile(null);
      fetchPengeluaran();
    } catch (error: any) {
      toast.error("Gagal menyimpan pengeluaran: " + error.message);
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Pengeluaran Kas"
      subtitle="Kelola arus kas keluar dan pantau bukti pengeluaran"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex bg-white dark:bg-navy-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 items-center w-full sm:w-80 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Cari pengeluaran..." 
            className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Catat Pengeluaran Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tanggal</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Keterangan</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Kategori</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Nominal</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Bukti Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] relative">
              {loading ? (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              ) : pengeluaran.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 text-sm">Belum ada data pengeluaran.</td>
                </tr>
              ) : pengeluaran.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.tanggal)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.keterangan}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-500 dark:text-rose-400 whitespace-nowrap">
                    - {formatRupiah(item.nominal)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.nota_url ? (
                      <button 
                        onClick={() => setPreviewImage(item.nota_url)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        title="Lihat Foto Nota"
                      >
                        <Camera className="w-4 h-4 text-blue-400" />
                        Lihat Foto
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Form Tambah Pengeluaran */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025] rounded-t-3xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                Catat Pengeluaran
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="form-pengeluaran" onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Keterangan</label>
                <textarea 
                  required
                  rows={2}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Deskripsi pengeluaran..."
                  className="w-full px-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
                <select 
                  required
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Acara">Acara</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nominal (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                    <input 
                      required
                      type="number"
                      value={formNominal}
                      onChange={(e) => setFormNominal(e.target.value)}
                      placeholder="150000"
                      className="w-full pl-10 pr-3 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
                  <input 
                    required
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bukti Nota / Kuitansi</label>
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-navy-800/50 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                >
                  <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-500'}`} />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Klik atau Tarik Foto Nota ke Sini (Maks 2MB)</p>
                  <button type="button" className="mt-4 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20 rounded-lg text-xs font-bold text-slate-700 dark:text-white shadow-sm transition-colors">
                    Jelajahi File
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {formFile && <p className="mt-2 text-xs font-bold text-rose-500 dark:text-rose-400">Terpilih: {formFile.name}</p>}
                </div>
              </div>
            </form>
            
            <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.025] flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button 
                form="form-pengeluaran"
                type="submit"
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 text-sm"
              >
                Simpan Pengeluaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Preview Foto Nota */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="relative max-w-3xl w-full bg-white dark:bg-navy-900 border border-slate-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-rose-500 text-white rounded-xl transition-colors z-10 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full max-h-[70vh] bg-slate-100/50 dark:bg-black/50 flex items-center justify-center overflow-auto p-4">
              <img 
                src={previewImage} 
                alt="Bukti Nota" 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>
            <div className="p-5 bg-slate-50 dark:bg-white/[0.025] border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Bukti Nota Pengeluaran</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all max-w-[250px] truncate">{previewImage}</p>
              </div>
              <a 
                href={previewImage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Unduh Nota
              </a>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
