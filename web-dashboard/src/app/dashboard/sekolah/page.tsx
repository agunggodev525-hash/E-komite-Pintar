"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

// ============================================
// Page: Manajemen Klien / Sekolah (SUPER_ADMIN)
// ============================================

export default function SekolahPage() {
  const { impersonate } = useAuth();
  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data: sekolahListResponse, error: sekolahError, mutate: loadData } = useSWR("/superadmin/tenants", fetcher);
  const { data: paketListResponse, error: paketError } = useSWR("/superadmin/paket", fetcher);
  
  const sekolahList = sekolahListResponse || [];
  const paketList = paketListResponse || [];
  
  // Optimistic UI state for toggle status
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, string>>({});

  const isLoading = (!sekolahListResponse && !sekolahError) || (!paketListResponse && !paketError);
  const errorMsg = (sekolahError || paketError) ? "Terjadi kesalahan sistem." : "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [selectedSekolah, setSelectedSekolah] = useState<any>(null);
  const [newPackage, setNewPackage] = useState("BASIC");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nama_sekolah: "",
    alamat: "",
    paket_berlangganan: "",
    admin_nama: "",
    admin_email: "",
    admin_password: "",
  });

  useEffect(() => {
    if (paketList.length > 0 && !formData.paket_berlangganan) {
      setFormData(prev => ({ ...prev, paket_berlangganan: paketList[0].id }));
    }
  }, [paketList]);

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
          paket_berlangganan: paketList.length > 0 ? paketList[0].id : "",
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
    // Terapkan Optimistic UI
    const newStatus = currentStatus === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    setOptimisticStatus(prev => ({ ...prev, [id]: newStatus }));

    try {
      const res = await apiFetch(`/superadmin/tenants/${id}/status`, {
        method: "PATCH"
      });

      if (!res.success) {
        alert("Gagal mengubah status tenant");
        // Revert on failure
        setOptimisticStatus(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      } else {
        loadData();
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
      // Revert on failure
      setOptimisticStatus(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
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

  const handleDeleteSekolah = async (id: string, namaSekolah: string) => {
    if (!window.confirm(`⚠️ PERINGATAN DESTRUKTIF\n\nApakah Anda yakin ingin menghapus permanen sekolah "${namaSekolah}"?\n\nSeluruh data (Siswa, Tagihan, Riwayat Pembayaran) akan ikut terhapus dan tidak bisa dikembalikan!`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/sekolah/${id}`, {
        method: "DELETE"
      });
      if (res.success || !res.message?.toLowerCase().includes('gagal')) {
        alert("Sekolah berhasil dihapus.");
        loadData();
      } else {
        alert(res.message || "Gagal menghapus sekolah.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setIsSubmitting(false);
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
      {/* Header Description & Toolbar */}
      <div className="mb-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
          Pusat kendali untuk mengelola seluruh komite sekolah yang terdaftar pada platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari nama sekolah..." 
              className="w-full rounded-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-2.5 pl-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm dark:shadow-none"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-extrabold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Tambah Sekolah Baru
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-5">Nama Sekolah</th>
                <th className="px-6 py-5">Kontak Admin</th>
                <th className="px-6 py-5">Paket</th>
                <th className="px-6 py-5">Berakhir Pada</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-navy-600 border-t-gold-400 rounded-full animate-spin"></div>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">Memuat data klien...</span>
                    </div>
                  </td>
                </tr>
              ) : sekolahList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <span className="text-4xl">🏢</span>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Belum ada sekolah yang terdaftar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sekolahList.map((sk: any) => {
                  const admin = sk.users?.[0] || {};
                  return (
                    <tr
                      key={sk.id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 dark:from-blue-500/20 to-blue-600/10 dark:to-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {sk.nama_sekolah.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium text-sm">{sk.nama_sekolah}</p>
                          <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">{sk.alamat || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{admin.nama_lengkap || '-'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{admin.email || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {sk.paket ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 text-xs font-semibold">
                            📦 {sk.paket.nama_paket}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-500/10 border border-slate-500/30 text-slate-400 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_0_10px_rgba(100,116,139,0.15)]">
                            {sk.paket_berlangganan || 'Tidak Diketahui'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sk.langganan_berakhir ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${new Date(sk.langganan_berakhir) < new Date() ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {new Date(sk.langganan_berakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleStatus(sk.id, optimisticStatus[sk.id] || sk.status)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
                            (optimisticStatus[sk.id] || sk.status) === "AKTIF" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (optimisticStatus[sk.id] || sk.status) === "AKTIF" ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full p-1 w-fit">
                            <button 
                              onClick={() => handleImpersonate(sk.id)}
                              title="Impersonate / Login Sebagai Klien"
                              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedSekolah(sk);
                                // Ensure valid initial value matching options
                                const validPackage = paketList.find((p: any) => p.id === sk.paket_id);
                                setNewPackage(validPackage ? validPackage.id : (paketList.length > 0 ? paketList[0].id : ""));
                                setIsEditPackageModalOpen(true);
                              }}
                              title="Ubah Paket"
                              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleResetPassword(sk.id)}
                              title="Reset Password Klien"
                              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteSekolah(sk.id, sk.nama_sekolah)}
                              title="Hapus Klien Sekolah"
                              className="p-2 rounded-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
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
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-gold-400">🏫</span> Tambah Sekolah Baru
              </h3>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Data Sekolah</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Sekolah
                  </label>
                  <input
                    required
                    type="text"
                    name="nama_sekolah"
                    value={formData.nama_sekolah}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors appearance-none font-medium"
                      >
                        {paketList.length === 0 && <option value="">Memuat paket...</option>}
                        {paketList.map((p) => (
                          <option key={p.id} value={p.id}>
                            📦 {p.nama_paket} - Rp {p.harga.toLocaleString('id-ID')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Kota/Provinsi"
                    />
                  </div>
                </div>

                {/* Dynamic UI: Info Paket */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {paketList.filter(p => p.id === formData.paket_berlangganan).map(p => (
                    <div key={p.id} className="p-4 bg-blue-500/10 rounded-xl shadow-inner border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium leading-relaxed">
                        Maksimal Siswa: {p.batas_siswa === 999999 ? 'Tanpa Batas' : p.batas_siswa} Siswa. <br/>
                        Durasi Berlangganan: {p.durasi}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-6"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Akun Admin Komite</h4>
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto text-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">📦</span> Ubah Paket Sekolah
              </h3>
              <button 
                onClick={() => setIsEditPackageModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Sekolah yang dipilih:</p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{selectedSekolah.nama_sekolah}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Paket Baru
                </label>
                <div className="relative">
                  <select
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                  >
                    {paketList.map((p) => (
                      <option key={p.id} value={p.id}>
                        📦 {p.nama_paket} (Maks. {p.batas_siswa === 999999 ? 'Tanpa Batas' : p.batas_siswa} Siswa)
                      </option>
                    ))}
                  </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 dark:text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/30">
              <button 
                onClick={() => setIsEditPackageModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleUpdatePackage}
                disabled={isSubmitting || !newPackage}
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
      {(sekolahError || paketError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal memuat data</p>
            <p className="text-sm">{sekolahError?.message || paketError?.message}</p>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
