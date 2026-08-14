"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import { formatRupiah, apiFetch } from "@/lib/api";

export default function ManajemenPaketPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("paket");

  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tenants, setTenants] = useState<any[]>([]);
  const [isTenantsLoading, setIsTenantsLoading] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);

  const fetchTenants = async () => {
    setIsTenantsLoading(true);
    try {
      const res = await apiFetch<any[]>("/superadmin/tenants");
      if (res?.success) {
        setTenants(res.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data sekolah", error);
    } finally {
      setIsTenantsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const res = await apiFetch<any[]>("/superadmin/transactions");
      if (res?.success) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi", error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sekolah" && tenants.length === 0) {
      fetchTenants();
    }
    if (activeTab === "tagihan" && transactions.length === 0) {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<any[]>("/superadmin/paket");
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

  // Array of colors for cards to match the design aesthetics
  const cardThemes = [
    { bg: "bg-[#2563EB]", text: "text-blue-500", glow: "shadow-blue-500/20" },
    { bg: "bg-[#10B981]", text: "text-emerald-500", glow: "shadow-emerald-500/20" },
    { bg: "bg-[#EF4444]", text: "text-rose-500", glow: "shadow-rose-500/20" },
    { bg: "bg-[#8B5CF6]", text: "text-purple-500", glow: "shadow-purple-500/20" },
    { bg: "bg-[#F59E0B]", text: "text-amber-500", glow: "shadow-amber-500/20" },
  ];

  return (
    <DashboardLayout title="Manajemen Langganan & Paket" subtitle="Kelola Paket dan Status Berlangganan Sekolah">
      
      {/* Tabs & Action Button Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
        
        <div className="flex space-x-6 border-b border-white/10 w-full md:w-auto overflow-x-auto pb-px">
          <button 
            onClick={() => setActiveTab("paket")}
            className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === "paket" ? "border-[#10B981] text-[#10B981]" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Kelola Paket
          </button>
          <button 
            onClick={() => setActiveTab("sekolah")}
            className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === "sekolah" ? "border-[#10B981] text-[#10B981]" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Sekolah Berlangganan
          </button>
          <button 
            onClick={() => setActiveTab("tagihan")}
            className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === "tagihan" ? "border-[#10B981] text-[#10B981]" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Tagihan & Transaksi
          </button>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2 bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Paket Baru
        </button>
      </div>

      {/* Tab Content: Kelola Paket */}
      {activeTab === "paket" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">Memuat data paket...</div>
          ) : packages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">Belum ada paket tersedia.</div>
          ) : (
            packages.map((pkg, idx) => {
              const theme = cardThemes[idx % cardThemes.length];
              return (
                <div key={pkg.id} className={`bg-[#1A1F2C] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl ${theme.glow} transition-transform hover:-translate-y-1 duration-300`}>
                  
                  {/* Card Header (Color Block) */}
                  <div className={`${theme.bg} p-5 flex justify-between items-center`}>
                    <h3 className="text-xl font-bold text-white tracking-wide">{pkg.nama_paket}</h3>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <h4 className="text-3xl font-extrabold text-white">{formatRupiah(pkg.harga)}</h4>
                        <span className="text-sm font-medium text-slate-400 pb-1">/{pkg.durasi.toLowerCase().replace(' ', '')}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex gap-2">
                        <span className="text-slate-400 text-sm">Limit Siswa:</span>
                        <span className="text-slate-200 text-sm">{pkg.batas_siswa === 999999 ? "Tanpa Batas" : pkg.batas_siswa}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400 text-sm">Fitur:</span>
                        <span className="text-slate-200 text-sm">
                          {pkg.batas_siswa < 500 ? "Terbatas (Access A, B, C)" : pkg.batas_siswa < 1000 ? "Penuh (Access A-D, Support)" : "Semua Fitur + Priority Support"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                      <button 
                        onClick={() => handleOpenModal(pkg)}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(pkg.id)}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-5 border-t border-white/5">
                      <span className="text-sm text-slate-400">Status</span>
                      <button onClick={() => toggleStatus(pkg.id)}>
                        <span className={`text-sm font-bold ${pkg.status === 'AKTIF' ? 'text-[#10B981]' : 'text-slate-500'}`}>
                          {pkg.status}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Sekolah Berlangganan */}
      {activeTab === "sekolah" && (
        <div className="bg-[#1A1F2C] border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-black/20 border-b border-white/5 text-xs uppercase tracking-wider font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-5">Nama Sekolah / Klien</th>
                  <th className="px-6 py-5">Paket Aktif</th>
                  <th className="px-6 py-5 text-center">Penggunaan (Siswa)</th>
                  <th className="px-6 py-5">Admin Utama</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isTenantsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Memuat data pelanggan...</td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada sekolah yang berlangganan.</td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-base">{tenant.nama_sekolah}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tenant.alamat || "Alamat tidak tersedia"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          <Package className="w-3.5 h-3.5" />
                          {tenant.paket?.nama_paket || tenant.paket_berlangganan || "Tidak Diketahui"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-slate-200">{tenant._count?.siswa || 0} <span className="text-slate-500 font-normal">/ {tenant.paket?.batas_siswa === 999999 ? "∞" : tenant.paket?.batas_siswa || "∞"}</span></p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-300">{tenant.users?.[0]?.nama_lengkap || "-"}</p>
                        <p className="text-xs text-slate-500">{tenant.users?.[0]?.email || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          tenant.status === "AKTIF" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Tagihan & Transaksi */}
      {activeTab === "tagihan" && (
        <div className="bg-[#1A1F2C] border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-black/20 border-b border-white/5 text-xs uppercase tracking-wider font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-5">Tanggal Transaksi</th>
                  <th className="px-6 py-5">Nama Sekolah</th>
                  <th className="px-6 py-5">Paket SaaS</th>
                  <th className="px-6 py-5">Nominal Tagihan</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isTransactionsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Memuat riwayat transaksi...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada transaksi tercatat.</td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-300">
                          {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(trx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{trx.sekolah?.nama_sekolah || "-"}</td>
                      <td className="px-6 py-4 text-slate-300">{trx.paket?.nama_paket || "-"}</td>
                      <td className="px-6 py-4 font-extrabold text-[#10B981]">{formatRupiah(trx.nominal)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          trx.status === "LUNAS" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : trx.status === "GAGAL"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1A1F2C] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {isEditMode ? "Edit Paket" : "Tambah Paket Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" 
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
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" 
                      placeholder="Contoh: 1500000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Durasi Berlangganan</label>
                    <select 
                      name="durasi" 
                      value={formData.durasi} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="1 Bulan" className="bg-slate-800">1 Bulan</option>
                      <option value="6 Bulan" className="bg-slate-800">6 Bulan</option>
                      <option value="12 Bulan" className="bg-slate-800">12 Bulan (Tahunan)</option>
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
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" 
                    placeholder="Kosongkan jika tanpa batas (unlimited)" 
                  />
                  <p className="text-xs text-slate-500 mt-2">Batas jumlah siswa yang bisa ditambahkan oleh sekolah pada paket ini.</p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="paketForm"
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/30"
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
