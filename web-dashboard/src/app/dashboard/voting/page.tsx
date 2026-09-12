"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Trash2, PieChart, Users, Calendar, AlertTriangle, Vote } from "lucide-react";

interface VotingKandidat {
  id: string;
  nama_kandidat: string;
  _count: {
    suara: number;
  };
}

interface Voting {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_berakhir: string;
  status: string;
  _count: {
    suara: number;
  };
  kandidat: VotingKandidat[];
}
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function VotingAdminPage() {
  const { user } = useAuth();
  const shouldFetch = user?.role === "ADMIN_KOMITE";
  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data, mutate } = useSWR(shouldFetch ? "/voting/admin" : null, fetcher);

  const votings = data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [votingToDelete, setVotingToDelete] = useState<{id: string, judul: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View results
  const [selectedVoting, setSelectedVoting] = useState<Voting | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tanggal_berakhir: "",
    kandidat: ["", ""]
  });

  const handleAddKandidat = () => {
    setFormData({
      ...formData,
      kandidat: [...formData.kandidat, ""]
    });
  };

  const handleKandidatChange = (index: number, value: string) => {
    const newKandidat = [...formData.kandidat];
    newKandidat[index] = value;
    setFormData({ ...formData, kandidat: newKandidat });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiFetch<any>("/voting/admin", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          kandidat: formData.kandidat.filter(k => k.trim() !== "")
        })
      });
      
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ judul: "", deskripsi: "", tanggal_berakhir: "", kandidat: ["", ""] });
        mutate();
        toast.success("Voting berhasil diterbitkan!");
      } else {
        toast.error(res.message || "Gagal menerbitkan voting");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, judul: string) => {
    setVotingToDelete({ id, judul });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!votingToDelete) return;
    
    try {
      setIsDeleting(true);
      const res = await apiFetch<any>(`/voting/admin/${votingToDelete.id}`, {
        method: "DELETE"
      });
      if (res.success) {
        setIsDeleteModalOpen(false);
        setVotingToDelete(null);
        mutate();
        toast.success("Voting berhasil dihapus");
      } else {
        toast.error(res.message || "Gagal menghapus voting");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus voting");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatus = (tanggal_berakhir: string) => {
    const isPast = new Date() > new Date(tanggal_berakhir);
    if (isPast) return <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-semibold border border-red-500/20">SELESAI</span>;
    return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">AKTIF</span>;
  };

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

  return (
    <DashboardLayout
      title="Kelola E-Voting"
      subtitle="Buat polling, pemilihan ketua, dan jajak pendapat secara digital."
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div></div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Voting Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {votings.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-300 dark:border-white/[0.07] rounded-3xl bg-slate-50 dark:bg-navy-800/40 backdrop-blur-xl">
            <Vote className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum Ada E-Voting</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Buat voting baru untuk memulai pemungutan suara.</p>
          </div>
        ) : (
          votings.map((voting: Voting) => (
            <div key={voting.id} className="bg-white dark:bg-navy-800/60 backdrop-blur-xl border border-slate-200 dark:border-white/[0.07] rounded-[2rem] p-7 flex flex-col justify-between group hover:border-gold-500/50 hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)] transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-5">
                  {getStatus(voting.tanggal_berakhir)}
                  <button 
                    type="button"
                    onClick={() => handleDeleteClick(voting.id, voting.judul)} 
                    className="p-2 -mr-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer relative z-10"
                    title="Hapus Voting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight">{voting.judul}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 mb-6">{voting.deskripsi}</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-navy-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2.5 text-gold-400" />
                    <span>Total Suara Masuk</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{voting._count.suara} <span className="text-sm font-semibold text-slate-500">suara</span></span>
                </div>
                
                <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Berakhir: {new Date(voting.tanggal_berakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <button 
                  onClick={() => { setSelectedVoting(voting); setIsResultOpen(true); }}
                  className="w-full py-3.5 bg-white dark:bg-navy-700/50 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md"
                >
                  <PieChart className="w-4 h-4" />
                  <span>Lihat Hasil Live</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Buat Voting */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-[2rem] p-7 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5"><span className="text-emerald-500">🗳️</span> Buat Voting Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Judul Voting</label>
                <input 
                  type="text" 
                  required
                  value={formData.judul}
                  onChange={e => setFormData({...formData, judul: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-colors shadow-sm" 
                  placeholder="Contoh: Pemilihan Ketua Komite"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Deskripsi Keterangan</label>
                <textarea 
                  rows={3}
                  value={formData.deskripsi}
                  onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-colors shadow-sm resize-none" 
                  placeholder="Visi misi atau alasan voting diadakan"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Tanggal Berakhir (Tutup)</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.tanggal_berakhir}
                  onChange={e => setFormData({...formData, tanggal_berakhir: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-colors shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Daftar Kandidat / Opsi</label>
                <div className="space-y-3.5">
                  {formData.kandidat.map((kand, index) => (
                    <input 
                      key={index}
                      type="text" 
                      required
                      value={kand}
                      onChange={e => handleKandidatChange(index, e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-colors shadow-sm" 
                      placeholder={`Kandidat / Opsi ${index + 1}`}
                    />
                  ))}
                  <button 
                    type="button"
                    onClick={handleAddKandidat}
                    className="text-emerald-500 dark:text-emerald-400 text-[13px] font-bold hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Opsi Lainnya
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-white hover:bg-slate-50 dark:bg-navy-700/50 dark:hover:bg-navy-700 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-2xl text-sm transition-colors shadow-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-sm transition-all disabled:opacity-50 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  {isSubmitting ? "Menerbitkan..." : "Terbitkan Voting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hasil Live */}
      {isResultOpen && selectedVoting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-[2rem] p-7 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div className="pr-4">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5 leading-tight">Hasil Perolehan Suara</h2>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{selectedVoting.judul}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-gold-400">{selectedVoting._count.suara}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Suara</div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedVoting.kandidat.map((k) => {
                const percentage = selectedVoting._count.suara > 0 
                  ? Math.round((k._count.suara / selectedVoting._count.suara) * 100) 
                  : 0;
                
                return (
                  <div key={k.id} className="bg-slate-50 dark:bg-navy-900/50 p-4.5 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex justify-between items-end mb-3 relative z-10">
                      <span className="font-bold text-slate-900 dark:text-white">{k.nama_kandidat}</span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{k._count.suara} suara ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-3 overflow-hidden relative z-10 shadow-inner">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setIsResultOpen(false)}
              className="w-full mt-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-700/50 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold rounded-2xl text-sm transition-colors border border-transparent dark:border-white/10 shadow-sm"
            >
              Tutup Hasil
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && votingToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-center">
            <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center rounded-full mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Voting?</h2>
            <p className="text-sm text-slate-400 mb-6">
              Yakin ingin menghapus <span className="text-slate-900 dark:text-white font-semibold">&quot;{votingToDelete.judul}&quot;</span>? Seluruh perolehan suara akan ikut terhapus permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setVotingToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 bg-white hover:bg-slate-50 dark:bg-navy-700/50 dark:hover:bg-navy-700 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
