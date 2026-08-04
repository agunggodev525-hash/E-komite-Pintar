"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatRupiah } from "@/lib/api";
import { Plus, Camera, UploadCloud, X, Search, FileText } from "lucide-react";

// Data dummy sementara
const dummyPengeluaranList = [
  { id: "P-001", tanggal: "2026-07-02", keterangan: "Beli Alat Tulis Kantor", nominal: 150000, kategori: "Operasional", hasNota: true },
  { id: "P-002", tanggal: "2026-07-05", keterangan: "Konsumsi Rapat Guru", nominal: 300000, kategori: "Konsumsi", hasNota: true },
  { id: "P-003", tanggal: "2026-07-10", keterangan: "Fotokopi Soal Ujian", nominal: 250000, kategori: "Akademik", hasNota: false },
  { id: "P-004", tanggal: "2026-07-12", keterangan: "Perbaikan Kipas Angin Kelas", nominal: 180000, kategori: "Pemeliharaan", hasNota: true },
  { id: "P-005", tanggal: "2026-07-15", keterangan: "Uang Muka Baju Seragam", nominal: 2500000, kategori: "Inventaris", hasNota: true },
];

export default function PengeluaranPage() {
  const [pengeluaran, setPengeluaran] = useState(dummyPengeluaranList);
  
  // States for Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formNominal, setFormNominal] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formKategori, setFormKategori] = useState("");
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
    // Fake upload process
    alert("File " + (e.dataTransfer.files[0]?.name || "") + " disimulasikan terupload!");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeterangan || !formNominal || !formTanggal) return;
    
    const newItem = {
      id: "P-" + Math.floor(Math.random() * 1000),
      tanggal: formTanggal,
      keterangan: formKeterangan,
      nominal: parseInt(formNominal.replace(/[^0-9]/g, '') || "0"),
      kategori: formKategori || "Lain-lain",
      hasNota: true
    };
    
    setPengeluaran([newItem, ...pengeluaran]);
    setShowAddModal(false);
    setFormKeterangan("");
    setFormNominal("");
    setFormTanggal("");
    setFormKategori("");
  };

  return (
    <DashboardLayout
      title="Manajemen Pengeluaran Kas"
      subtitle="Kelola arus kas keluar dan pantau bukti pengeluaran"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 items-center w-full sm:w-80 shadow-xl">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Cari pengeluaran..." 
            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-400"
          />
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_10px_rgba(244,63,94,0.2)] hover:-translate-y-0.5 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Catat Pengeluaran Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/30 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-300">Tanggal</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-300">Keterangan</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-300">Kategori</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-300">Nominal</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-300 text-center">Bukti Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pengeluaran.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{item.tanggal}</td>
                  <td className="px-6 py-4 font-medium text-white">{item.keterangan}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/20 uppercase tracking-wide">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-400 whitespace-nowrap">
                    - {formatRupiah(item.nominal)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.hasNota ? (
                      <button 
                        onClick={() => setPreviewImage("/nota-dummy.jpg")} // We'll just show a dummy placeholder modal
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-semibold transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-800 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                Tambah Pengeluaran Baru
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Keterangan</label>
                <textarea 
                  required
                  rows={2}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Deskripsi pengeluaran..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Kategori</label>
                <select 
                  required
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Acara">Acara</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nominal (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">Rp</span>
                    <input 
                      required
                      type="number"
                      value={formNominal}
                      onChange={(e) => setFormNominal(e.target.value)}
                      placeholder="150000"
                      className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tanggal</label>
                  <input 
                    required
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Bukti Nota / Kuitansi</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-rose-400 bg-rose-500/10' : 'border-white/20 bg-slate-900/50 hover:bg-slate-900'}`}
                >
                  <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-rose-400' : 'text-slate-500'}`} />
                  <p className="text-sm font-medium text-slate-300 mb-1">Klik atau Tarik Foto Nota ke Sini (Maks 2MB)</p>
                  <button type="button" className="mt-4 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors">
                    Jelajahi File
                  </button>
                </div>
              </div>
            </form>
            
            <div className="p-5 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-400 font-medium hover:bg-white/10 transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
              >
                Simpan Pengeluaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Preview Foto Nota */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-[60vh] bg-slate-900/50 flex items-center justify-center">
              {/* Dummy Image Placeholder */}
              <div className="text-center">
                <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Gambar Kuitansi Fisik</p>
                <p className="text-slate-500 text-sm">(Preview Mode)</p>
              </div>
            </div>
            <div className="p-5 bg-slate-900/50 border-t border-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">Bukti_Transaksi.jpg</p>
                <p className="text-xs text-slate-400">Diunggah pada 2026-07-02</p>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-semibold rounded-lg transition-colors">
                Unduh
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
