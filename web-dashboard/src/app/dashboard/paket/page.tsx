"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, X, Package, CheckCircle2 } from "lucide-react";
import { formatRupiah, apiFetch } from "@/lib/api";
import { useEffect } from "react";

export default function ManajemenPaketPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/superadmin/paket");
      if (res?.success) {
        setPackages(res.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data paket", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const [formData, setFormData] = useState({
    nama_paket: "",
    harga: "",
    durasi: "1 Bulan",
    batas_siswa: "",
  });

  const handleOpenModal = (pkg?: any) => {
    if (pkg) {
      setIsEditMode(true);
      setActiveId(pkg.id);
      setFormData({
        nama_paket: pkg.nama_paket,
        harga: pkg.harga.toString(),
        durasi: pkg.durasi,
        batas_siswa: pkg.batas_siswa === 999999 ? "" : pkg.batas_siswa.toString(),
      });
    } else {
      setIsEditMode(false);
      setActiveId(null);
      setFormData({
        nama_paket: "",
        harga: "",
        durasi: "1 Bulan",
        batas_siswa: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_paket: formData.nama_paket,
      harga: parseInt(formData.harga) || 0,
      durasi: formData.durasi,
      batas_siswa: formData.batas_siswa ? parseInt(formData.batas_siswa) : 999999,
    };

    try {
      if (isEditMode && activeId) {
        const res = await apiFetch(`/superadmin/paket/${activeId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res?.success) fetchPackages();
      } else {
        const res = await apiFetch("/superadmin/paket", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res?.success) fetchPackages();
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan paket", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus paket ini?")) {
      try {
        const res = await apiFetch(`/superadmin/paket/${id}`, { method: "DELETE" });
        if (res?.success) fetchPackages();
      } catch (error) {
        console.error("Gagal menghapus paket", error);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const res = await apiFetch(`/superadmin/paket/${id}/status`, { method: "PATCH" });
      if (res?.success) fetchPackages();
    } catch (error) {
      console.error("Gagal mengubah status paket", error);
    }
  };

  return (
    <DashboardLayout title="Manajemen Paket" subtitle="Kelola Paket dan Status Berlangganan Sekolah">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-sm text-slate-400">Atur harga dan limitasi fitur untuk sekolah yang berlangganan.</p>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Tambah Paket Baru
        </button>
      </div>

      {/* Table Data */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 border-b border-white/10 text-xs uppercase tracking-wider font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-5">Nama Paket</th>
                <th className="px-6 py-5">Harga / Durasi</th>
                <th className="px-6 py-5 text-center">Batas Siswa</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Memuat data paket...</td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada paket tersedia.</td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-white text-base">{pkg.nama_paket}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-emerald-400">{formatRupiah(pkg.harga)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Per {pkg.durasi}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                        {pkg.batas_siswa === 999999 ? "Tanpa Batas" : pkg.batas_siswa}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleStatus(pkg.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                          pkg.status === "AKTIF" 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                            : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700"
                        }`}
                      >
                        {pkg.status === "AKTIF" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {pkg.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(pkg)}
                          title="Edit Paket"
                          className="p-2 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 rounded-lg transition-colors border border-slate-700 hover:border-blue-500/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pkg.id)}
                          title="Hapus Paket"
                          className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition-colors border border-slate-700 hover:border-rose-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                {isEditMode ? "Edit Paket" : "Tambah Paket Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form id="paketForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nama Paket</label>
                  <input 
                    required 
                    type="text" 
                    name="nama_paket" 
                    value={formData.nama_paket} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" 
                    placeholder="Contoh: Paket Enterprise" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Harga (Rp)</label>
                    <input 
                      required 
                      type="number" 
                      name="harga" 
                      value={formData.harga} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" 
                      placeholder="Contoh: 1500000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Durasi Berlangganan</label>
                    <select 
                      name="durasi" 
                      value={formData.durasi} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="1 Bulan">1 Bulan</option>
                      <option value="6 Bulan">6 Bulan</option>
                      <option value="12 Bulan">12 Bulan (Tahunan)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Batas Maksimal Siswa</label>
                  <input 
                    type="number" 
                    name="batas_siswa" 
                    value={formData.batas_siswa} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" 
                    placeholder="Kosongkan jika tanpa batas (unlimited)" 
                  />
                  <p className="text-xs text-slate-500 mt-2">Batas jumlah siswa yang bisa ditambahkan oleh sekolah pada paket ini.</p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-transparent border border-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="paketForm"
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg hover:shadow-blue-600/30"
              >
                {isEditMode ? "Simpan Perubahan" : "Simpan Paket"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
