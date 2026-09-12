"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { UserPlus, Pencil, Trash2, Search, X, Key, ChevronLeft, ChevronRight, Filter, FileSpreadsheet, UploadCloud, Download, ArrowUpDown } from "lucide-react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";
import { Skeleton, TableRowSkeleton } from "@/components/Skeleton";

// Helper function untuk Title Case
const toTitleCase = (str: string) => {
  if (!str) return str;
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function SiswaPage() {
  const { user } = useAuth();
  
  const [kelasFilter, setKelasFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");

  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const shouldFetch = user?.role === "ADMIN_KOMITE";
  const { data, error, mutate: loadSiswa } = useSWR(
    shouldFetch ? `/siswa?search=${search}&kelas=${kelasFilter}&page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}` : null,
    fetcher
  );

  const siswa = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const isLoading = shouldFetch && !data && !error;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswaId, setEditingSiswaId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset page and selection if search, filter, or sorting changes
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, kelasFilter, sortBy, sortOrder]);

  // Reset selection on page change
  useEffect(() => {
    setSelectedIds([]);
  }, [page]);

  const [formData, setFormData] = useState({
    nama_siswa: "",
    nisn: "",
    kelas: "",
    nama_orang_tua: "",
    email_orang_tua: "",
    whatsapp_orang_tua: "",
  });
  const [fotoOrangTua, setFotoOrangTua] = useState<File | null>(null);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(siswa.map((s: any) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} data siswa terpilih? Akun orang tua akan tetap ada namun datanya tidak terkait lagi.`)) return;
    
    setIsSubmitting(true);
    try {
      // Menghapus sekaligus menggunakan Promise.all (berjalan di background paralel)
      await Promise.all(selectedIds.map(id => apiFetch(`/siswa/${id}`, { method: "DELETE" })));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} data siswa berhasil dihapus`);
      loadSiswa();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus beberapa data siswa");
      loadSiswa();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEditing = !!editingSiswaId;
      const url = isEditing ? `/siswa/${editingSiswaId}` : "/siswa";
      const method = isEditing ? "PUT" : "POST";

      let payload: any = JSON.stringify(formData);
      
      if (fotoOrangTua) {
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(key, value);
        });
        formDataObj.append('foto_orang_tua', fotoOrangTua);
        payload = formDataObj;
      }

      const res = await apiFetch(url, {
        method: method,
        body: payload,
      });

      if (res.success) {
        setIsModalOpen(false);
        setEditingSiswaId(null);
        setFormData({
          nama_siswa: "",
          nisn: "",
          kelas: "",
          nama_orang_tua: "",
          email_orang_tua: "",
          whatsapp_orang_tua: "",
        });
        setFotoOrangTua(null);
        loadSiswa();
        toast.success(isEditing ? "Siswa berhasil diperbarui" : "Siswa berhasil ditambahkan");
      } else {
        toast.error(res.message || "Gagal menyimpan data siswa");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (s: any) => {
    setEditingSiswaId(s.id);
    setFormData({
      nama_siswa: s.nama_siswa || "",
      nisn: s.nisn || "",
      kelas: s.kelas || "",
      nama_orang_tua: s.orang_tua?.nama_lengkap || "",
      email_orang_tua: s.orang_tua?.email || "",
      whatsapp_orang_tua: s.orang_tua?.no_whatsapp || "",
    });
    setFotoOrangTua(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSiswaId(null);
    setFormData({
      nama_siswa: "",
      nisn: "",
      kelas: "",
      nama_orang_tua: "",
      email_orang_tua: "",
      whatsapp_orang_tua: "",
    });
    setFotoOrangTua(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data siswa ini? Akun orang tua tidak akan terhapus.")) return;
    
    try {
      const res = await apiFetch(`/siswa/${id}`, { method: "DELETE" });
      if (res.success) {
        toast.success("Siswa berhasil dihapus");
        loadSiswa();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus siswa");
    }
  };

  const handleResetPassword = async (id: string, nama_ortu: string) => {
    if (!confirm(`Yakin ingin mereset password orang tua (${nama_ortu}) menjadi 'orangtua1234'?`)) return;
    
    try {
      const res = await apiFetch(`/siswa/${id}/reset-password`, { method: "POST" });
      if (res.success) {
        toast.success("Password berhasil direset ke 'orangtua1234'.");
      } else {
        toast.error(res.message || "Gagal mereset password");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan server");
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          "Nama Lengkap Siswa": "Ahmad Rizky",
          "NISN": "1234567890",
          "Kelas": "VII.A",
          "Nama Orang Tua": "Bpk. Budi Santoso",
          "Email Orang Tua (Opsional)": "budi@email.com",
          "No. WhatsApp": "08123456789"
        },
        {
          "Nama Lengkap Siswa": "Siti Aisyah",
          "NISN": "0987654321",
          "Kelas": "VII.A",
          "Nama Orang Tua": "Ibu Ratna",
          "Email Orang Tua (Opsional)": "",
          "No. WhatsApp": "08561234567"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);

      const columnWidths = [
        { wch: 25 }, // Nama Lengkap
        { wch: 15 }, // NISN
        { wch: 10 }, // Kelas
        { wch: 25 }, // Nama Ortu
        { wch: 30 }, // Email
        { wch: 20 }, // WhatsApp
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template_Siswa");

      XLSX.writeFile(workbook, "Template_Import_Siswa.xlsx");
      toast.success("Template berhasil diunduh");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh template Excel.");
    }
  };

  // RBAC Check (Super Admin harus lewat Impersonate)
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

  // List of unique kelas for filter
  const uniqueKelas = Array.from(new Set(siswa.map((s: any) => s.kelas))).filter(Boolean);

  return (
    <DashboardLayout
      title="Kelola Siswa"
      subtitle="Manajemen data siswa dan relasi orang tua"
    >
      <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-white/[0.07] shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col transition-colors">
        
        {/* Header Table & Actions */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-white/[0.025]">
          <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama / NISN..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 shadow-sm rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select 
                value={kelasFilter}
                onChange={(e) => setKelasFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 shadow-sm rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none cursor-pointer w-full sm:w-40 transition-all"
              >
                <option value="">Semua Kelas</option>
                {uniqueKelas.map(k => (
                  <option key={k as string} value={k as string}>{String(k)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            )}
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-navy-800/80 hover:bg-slate-50 dark:hover:bg-navy-700/80 border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
                <th scope="col" className="px-5 py-3.5 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 accent-blue-600 bg-white"
                    checked={siswa.length > 0 && selectedIds.length === siswa.length}
                    onChange={handleSelectAll}
                    title="Pilih Semua"
                  />
                </th>
                <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">NISN</th>
                <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleSort('nama_siswa')}>
                    Nama Siswa
                    <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'nama_siswa' ? 'text-blue-500' : 'text-slate-300'}`} />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleSort('kelas')}>
                    Kelas
                    <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'kelas' ? 'text-blue-500' : 'text-slate-300'}`} />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Orang Tua</th>
                <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <>
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                </>
              ) : siswa.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                siswa.map((s: any) => (
                  <tr key={s.id} className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group ${selectedIds.includes(s.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-transparent'}`}>
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 accent-blue-600 bg-white"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => handleSelectRow(s.id)}
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-[13px]">{s.nisn}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{toTitleCase(s.nama_siswa)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{toTitleCase(s.orang_tua?.nama_lengkap) || "-"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.orang_tua?.email || "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(s)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-4 h-4 stroke-[2]" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(s.id, s.orang_tua?.nama_lengkap || 'Orang Tua')}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                          title="Reset Password Ortu"
                        >
                          <Key className="w-4 h-4 stroke-[2]" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.025] flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span> data siswa</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2">Halaman {page} dari {meta.totalPages || 1}</span>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-navy-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-navy-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Tambah/Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && handleCloseModal()}></div>
          <div className="relative bg-white dark:bg-navy-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/10">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025] rounded-t-3xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingSiswaId ? <Pencil className="w-5 h-5 text-blue-500" /> : <UserPlus className="w-5 h-5 text-blue-500" />}
                {editingSiswaId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors p-1.5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="siswaForm" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Siswa</label>
                    <input required type="text" name="nama_siswa" value={formData.nama_siswa} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all" placeholder="Misal: Ahmad Rizky" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NISN</label>
                    <input required type="number" name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all" placeholder="10 Digit Angka" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kelas</label>
                    <select required name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Pilih Kelas</option>
                      <optgroup label="── SD ──">
                        <option value="I.A">I.A</option>
                        <option value="I.B">I.B</option>
                        <option value="I.C">I.C</option>
                        <option value="II.A">II.A</option>
                        <option value="II.B">II.B</option>
                        <option value="II.C">II.C</option>
                        <option value="III.A">III.A</option>
                        <option value="III.B">III.B</option>
                        <option value="III.C">III.C</option>
                        <option value="IV.A">IV.A</option>
                        <option value="IV.B">IV.B</option>
                        <option value="IV.C">IV.C</option>
                        <option value="V.A">V.A</option>
                        <option value="V.B">V.B</option>
                        <option value="V.C">V.C</option>
                        <option value="VI.A">VI.A</option>
                        <option value="VI.B">VI.B</option>
                        <option value="VI.C">VI.C</option>
                      </optgroup>
                      <optgroup label="── SMP / MTs ──">
                        <option value="VII.A">VII.A</option>
                        <option value="VII.B">VII.B</option>
                        <option value="VII.C">VII.C</option>
                        <option value="VIII.A">VIII.A</option>
                        <option value="VIII.B">VIII.B</option>
                        <option value="VIII.C">VIII.C</option>
                        <option value="IX.A">IX.A</option>
                        <option value="IX.B">IX.B</option>
                        <option value="IX.C">IX.C</option>
                      </optgroup>
                      <optgroup label="── SMA / SMK / MA ──">
                        <option value="X.A">X.A</option>
                        <option value="X.B">X.B</option>
                        <option value="X.C">X.C</option>
                        <option value="XI.A">XI.A</option>
                        <option value="XI.B">XI.B</option>
                        <option value="XI.C">XI.C</option>
                        <option value="XII.A">XII.A</option>
                        <option value="XII.B">XII.B</option>
                        <option value="XII.C">XII.C</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-5 mt-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">2</span>
                    Data Orang Tua / Wali
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Orang Tua</label>
                      <input required type="text" name="nama_orang_tua" value={formData.nama_orang_tua} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all" placeholder="Misal: Bpk. Budi Santoso" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Foto Profil <span className="text-slate-400 font-normal">(Opsional)</span></label>
                      <input type="file" accept="image/*" onChange={(e) => setFotoOrangTua(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 transition-all cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-slate-400 font-normal">(Opsional)</span></label>
                        <input type="email" name="email_orang_tua" value={formData.email_orang_tua} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all" placeholder="Untuk login" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. WhatsApp</label>
                        <input required type="tel" name="whatsapp_orang_tua" value={formData.whatsapp_orang_tua} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gold-400 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent outline-none transition-all" placeholder="0812xxxxxx" />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.025] rounded-b-3xl flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="siswaForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Data"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-navy-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/10">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025] rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  Import Data Siswa Massal
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">Tambahkan ratusan siswa sekaligus menggunakan file Excel (.xlsx atau .csv).</p>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors p-1.5 rounded-xl shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Step 1: Download Template */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Langkah 1: Unduh Template</h4>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                    Gunakan template ini untuk memastikan format kolom sesuai dengan sistem kami.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Unduh Template Excel
                </button>
              </div>

              {/* Step 2: Upload Area */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Langkah 2: Upload File</h4>
                <input 
                  type="file" 
                  accept=".xlsx, .csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed ${selectedFile ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50'} rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4 transition-transform ${selectedFile ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-white dark:bg-slate-800 group-hover:scale-105'}`}>
                    <UploadCloud className={`w-8 h-8 ${selectedFile ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
                  </div>
                  {selectedFile ? (
                    <>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">{selectedFile.name}</p>
                      <p className="text-xs text-blue-500/80 dark:text-blue-400/80">{(selectedFile.size / 1024).toFixed(1)} KB - Siap diproses</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarik & Lepas file Excel di sini</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">atau klik untuk memilih file (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="px-6 py-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.025] rounded-b-3xl flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedFile(null); // Reset saat batal
                }}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                disabled={!selectedFile || isSubmitting}
                onClick={async () => {
                  if(!selectedFile) return;
                  setIsSubmitting(true);
                  try {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);

                        if (jsonData.length === 0) {
                          toast.error("File Excel kosong.");
                          setIsSubmitting(false);
                          return;
                        }

                        const mappedData = jsonData.map((row: any) => ({
                          nama_siswa: row["Nama Lengkap Siswa"] || "",
                          nisn: row["NISN"]?.toString() || "",
                          kelas: row["Kelas"]?.toString() || "",
                          nama_orang_tua: row["Nama Orang Tua"] || "",
                          email_orang_tua: row["Email Orang Tua (Opsional)"] || "",
                          whatsapp_orang_tua: row["No. WhatsApp"]?.toString() || ""
                        }));

                        const res = await apiFetch("/siswa/bulk", {
                          method: "POST",
                          body: JSON.stringify({ data: mappedData })
                        });

                        if (res.success) {
                          toast.success(res.message || "Data berhasil diimport!");
                          setIsImportModalOpen(false);
                          setSelectedFile(null);
                          loadSiswa();
                        } else {
                          toast.error(res.message || "Gagal mengimport data.");
                        }
                      } catch (err: any) {
                        console.error(err);
                        toast.error("Terjadi kesalahan saat memproses file Excel.");
                      } finally {
                        setIsSubmitting(false);
                      }
                    };
                    reader.readAsArrayBuffer(selectedFile);
                  } catch {
                    setIsSubmitting(false);
                    toast.error("Gagal membaca file.");
                  }
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  "Upload & Proses Data"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
