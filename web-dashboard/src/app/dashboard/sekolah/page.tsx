"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ============================================
// Page: Manajemen Klien / Sekolah (SUPER_ADMIN)
// ============================================

export default function SekolahPage() {
  const { impersonate } = useAuth();
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [selectedSekolah, setSelectedSekolah] = useState<any>(null);
  const [newPackage, setNewPackage] = useState("BASIC");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_sekolah: "",
    alamat: "",
    paket_berlangganan: "BASIC",
    admin_nama: "",
    admin_email: "",
    admin_password: "",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch<any>("/superadmin/tenants");
      if (res.success && res.data) {
        setSekolahList(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      
      const res = await apiFetch("/superadmin/tenants", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          nama_sekolah: "",
          alamat: "",
          paket_berlangganan: "BASIC",
          admin_nama: "",
          admin_email: "",
          admin_password: "",
        });
        loadData(); // Refresh list
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat tenant baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      // Optimistic UI update
      setSekolahList(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus === "AKTIF" ? "NONAKTIF" : "AKTIF" } : s));
      
      const res = await apiFetch(`/superadmin/tenants/${id}/status`, {
        method: "PATCH"
      });

      if (!res.success) {
        // Revert if failed
        setSekolahList(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus } : s));
        alert("Gagal mengubah status tenant");
      }
    } catch (error) {
      setSekolahList(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus } : s));
      console.error(error);
    }
  }

  const handleImpersonate = async (id: string) => {
    try {
      const res = await apiFetch<any>(`/superadmin/tenants/${id}/impersonate`, {
        method: "POST"
      });
      if (res.success && res.data) {
        impersonate(res.data.token, res.data.user);
      } else {
        alert(res.message || "Gagal masuk sebagai klien.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan sistem.");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm("Yakin ingin mereset password admin sekolah ini ke default (komite1234)?")) {
      return;
    }
    
    try {
      const res = await apiFetch(`/superadmin/tenants/${id}/reset-password`, {
        method: "POST"
      });
      if (res.success) {
        alert("Berhasil! Password telah diubah menjadi komite1234.");
      } else {
        alert(res.message || "Gagal mereset password.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan sistem.");
    }
  };

  const handleUpdatePackage = async () => {
    if(!selectedSekolah) return;
    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/superadmin/tenants/${selectedSekolah.id}`, {
        method: "PUT",
        body: JSON.stringify({ paket_berlangganan: newPackage })
      });
      if (res.success) {
        setIsEditPackageModalOpen(false);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert(e.message || "Gagal mengubah paket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Manajemen Klien Sekolah">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-white-60 text-sm mt-1">
            Pusat kendali untuk mengelola seluruh komite sekolah yang terdaftar pada platform.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex items-center gap-2"
        >
          <span className="text-lg">+</span> Tambah Sekolah Baru
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-navy-800 rounded-2xl border border-white-10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white-60 whitespace-nowrap">
            <thead className="bg-navy-900 text-white font-medium">
              <tr>
                <th className="px-6 py-5">Nama Sekolah</th>
                <th className="px-6 py-5">Kontak Admin</th>
                <th className="px-6 py-5">Paket</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white-10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-navy-600 border-t-gold-400 rounded-full animate-spin"></div>
                      <span className="text-white-40 font-medium">Memuat data klien...</span>
                    </div>
                  </td>
                </tr>
              ) : sekolahList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <span className="text-4xl">🏢</span>
                      <p className="text-white-40 font-medium">Belum ada sekolah yang terdaftar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sekolahList.map((sk: any) => {
                  const admin = sk.users?.[0] || {};
                  return (
                    <tr
                      key={sk.id}
                      className="hover:bg-white-5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{sk.nama_sekolah}</p>
                        <p className="text-xs text-white-40 mt-0.5 truncate max-w-[200px]">{sk.alamat || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white-80">{admin.nama_lengkap || '-'}</p>
                        <p className="text-xs text-white-40 mt-0.5">{admin.email || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {sk.paket_berlangganan === 'PREMIUM' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gold-400/20 to-gold-500/20 text-gold-400 border border-gold-400/30">
                            👑 Premium
                          </span>
                        ) : sk.paket_berlangganan === 'ENTERPRISE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-400/20 to-purple-500/20 text-purple-400 border border-purple-400/30">
                            🚀 Enterprise
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-400/10 text-blue-400 border border-blue-400/20">
                            ⭐ Basic
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleStatus(sk.id, sk.status)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-navy-900 ${
                            sk.status === "AKTIF" ? "bg-emerald-500" : "bg-navy-600"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sk.status === "AKTIF" ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleImpersonate(sk.id)}
                            title="Impersonate / Login Sebagai Klien"
                            className="w-9 h-9 rounded-xl bg-navy-700 hover:bg-cyan-500/20 border border-white-10 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSekolah(sk);
                              setNewPackage(sk.paket_berlangganan);
                              setIsEditPackageModalOpen(true);
                            }}
                            title="Ubah Paket"
                            className="w-9 h-9 rounded-xl bg-navy-700 hover:bg-gold-500/20 border border-white-10 flex items-center justify-center text-gold-400 hover:text-gold-300 transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleResetPassword(sk.id)}
                            title="Reset Password Klien"
                            className="w-9 h-9 rounded-xl bg-navy-700 hover:bg-orange-500/20 border border-white-10 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <div className="relative bg-navy-800 border border-white-10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white-10 flex justify-between items-center bg-navy-900/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-gold-400">🏫</span> Tambah Sekolah Baru
              </h3>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white-5 text-white-60 hover:text-white hover:bg-status-gagal-bg hover:text-status-gagal transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-semibold text-white">Data Sekolah</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white-80 mb-1.5">
                    Nama Sekolah
                  </label>
                  <input
                    required
                    type="text"
                    name="nama_sekolah"
                    value={formData.nama_sekolah}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                    placeholder="Contoh: SMA Negeri 1 Nusantara"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white-80 mb-1.5">
                      Paket Langganan
                    </label>
                    <div className="relative">
                      <select
                        name="paket_berlangganan"
                        value={formData.paket_berlangganan}
                        onChange={handleInputChange}
                        className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors appearance-none font-medium"
                      >
                        <option value="BASIC">⭐ Basic</option>
                        <option value="PREMIUM">👑 Premium</option>
                        <option value="ENTERPRISE">🚀 Enterprise</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-white-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white-80 mb-1.5">
                      Alamat Singkat
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                      placeholder="Kota/Provinsi"
                    />
                  </div>
                </div>

                {/* Dynamic UI: Info Paket */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {formData.paket_berlangganan === 'BASIC' && (
                    <div className="p-4 bg-blue-50/50 rounded-xl shadow-inner border border-blue-200/20">
                      <p className="text-sm text-blue-100 font-medium leading-relaxed">
                        ⭐ Paket Basic: Maksimal 100 Siswa. Pembayaran Manual & Ekspor Laporan. (Tanpa WhatsApp Gateway).
                      </p>
                    </div>
                  )}
                  {formData.paket_berlangganan === 'PREMIUM' && (
                    <div className="p-4 border-yellow-400 border bg-yellow-50/30 rounded-xl shadow-inner">
                      <p className="text-sm text-yellow-100 font-medium leading-relaxed">
                        👑 Paket Premium: Maksimal 250 Siswa. Akses penuh Payment Gateway, Cicilan, dan WhatsApp Broadcast.
                      </p>
                    </div>
                  )}
                  {formData.paket_berlangganan === 'ENTERPRISE' && (
                    <div className="p-4 bg-slate-800 text-white rounded-xl shadow-inner border border-slate-700">
                      <p className="text-sm font-medium leading-relaxed">
                        🚀 Paket Enterprise: Tanpa Batas Siswa. Multi-Branch, White-labeling App, & Prioritas Support 24/7.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-white-10 my-6"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-semibold text-white">Akun Admin Komite</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-80 mb-1.5">
                    Nama Ketua/Bendahara
                  </label>
                  <input
                    required
                    type="text"
                    name="admin_nama"
                    value={formData.admin_nama}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                    placeholder="Nama lengkap admin"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white-80 mb-1.5">
                      Email Login
                    </label>
                    <input
                      required
                      type="email"
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleInputChange}
                      className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                      placeholder="admin@sekolah.id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white-80 mb-1.5">
                      Password Sementara
                    </label>
                    <input
                      required
                      type="password"
                      name="admin_password"
                      value={formData.admin_password}
                      onChange={handleInputChange}
                      className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white-10 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-medium text-white-60 hover:text-white hover:bg-white-5 transition-colors w-full sm:w-auto text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 w-full sm:w-auto text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Sekolah"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Ubah Paket */}
      {isEditPackageModalOpen && selectedSekolah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white-10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-white-10 flex justify-between items-center bg-navy-800/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📦</span> Ubah Paket Sekolah
              </h3>
              <button 
                onClick={() => setIsEditPackageModalOpen(false)}
                className="text-white-40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <p className="text-white-60 text-sm mb-2">Sekolah yang dipilih:</p>
                <p className="text-white font-bold text-lg">{selectedSekolah.nama_sekolah}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white-80 mb-2">
                  Pilih Paket Baru
                </label>
                <div className="relative">
                  <select
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="w-full bg-navy-950 border border-white-10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="BASIC">⭐ Paket Basic (Maks. 100 Siswa)</option>
                    <option value="PREMIUM">👑 Paket Premium (Maks. 250 Siswa)</option>
                    <option value="ENTERPRISE">🚀 Paket Enterprise (Tanpa Batas Siswa)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white-40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-white-10 flex justify-end gap-3 bg-navy-800/30">
              <button 
                onClick={() => setIsEditPackageModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-white-60 hover:text-white hover:bg-white-5 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleUpdatePackage}
                disabled={isSubmitting || newPackage === selectedSekolah.paket_berlangganan}
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_25px_rgba(255,193,7,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
