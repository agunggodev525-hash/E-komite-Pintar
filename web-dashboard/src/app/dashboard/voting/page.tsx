"use client";

import { useState, useEffect } from "react";
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

export default function VotingAdminPage() {
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View results
  const [selectedVoting, setSelectedVoting] = useState<Voting | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tanggal_berakhir: "",
    kandidat: ["", ""]
  });

  const loadVotings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/backend/v1/voting/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVotings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVotings();
  }, []);

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
      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/backend/v1/voting/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          kandidat: formData.kandidat.filter(k => k.trim() !== "")
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ judul: "", deskripsi: "", tanggal_berakhir: "", kandidat: ["", ""] });
        loadVotings();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (!window.confirm(`Yakin ingin menghapus voting "${judul}"?\nSeluruh perolehan suara akan ikut terhapus permanen.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/backend/v1/voting/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadVotings();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Gagal menghapus voting");
    }
  };

  const getStatus = (tanggal_berakhir: string) => {
    const isPast = new Date() > new Date(tanggal_berakhir);
    if (isPast) return <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-semibold border border-red-500/20">SELESAI</span>;
    return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">AKTIF</span>;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Memuat data voting...</div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kelola E-Voting</h1>
          <p className="text-slate-400 mt-1 text-sm">Buat polling, pemilihan ketua, dan jajak pendapat untuk wali murid secara digital.</p>
        </div>
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
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
            <Vote className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">Belum Ada E-Voting</h3>
            <p className="text-sm text-slate-500 mt-1">Buat voting baru untuk memulai pemungutan suara.</p>
          </div>
        ) : (
          votings.map((voting) => (
            <div key={voting.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-between group hover:border-gold-500/30 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  {getStatus(voting.tanggal_berakhir)}
                  <button onClick={() => handleDelete(voting.id, voting.judul)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{voting.judul}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4">{voting.deskripsi}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gold-400" />
                    <span>Total Suara Masuk</span>
                  </div>
                  <span className="font-bold text-white">{voting._count.suara} suara</span>
                </div>
                
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Berakhir: {new Date(voting.tanggal_berakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <button 
                  onClick={() => { setSelectedVoting(voting); setIsResultOpen(true); }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 border border-slate-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-4">Buat Voting Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Judul Voting</label>
                <input 
                  type="text" 
                  required
                  value={formData.judul}
                  onChange={e => setFormData({...formData, judul: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500" 
                  placeholder="Contoh: Pemilihan Ketua Komite"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Keterangan</label>
                <textarea 
                  rows={2}
                  value={formData.deskripsi}
                  onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500" 
                  placeholder="Visi misi atau alasan voting diadakan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tanggal Berakhir (Tutup)</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.tanggal_berakhir}
                  onChange={e => setFormData({...formData, tanggal_berakhir: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 [color-scheme:dark]" 
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Daftar Kandidat / Opsi</label>
                <div className="space-y-3">
                  {formData.kandidat.map((kand, index) => (
                    <input 
                      key={index}
                      type="text" 
                      required
                      value={kand}
                      onChange={e => handleKandidatChange(index, e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" 
                      placeholder={`Opsi ${index + 1}`}
                    />
                  ))}
                  <button 
                    type="button"
                    onClick={handleAddKandidat}
                    className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Tambah Opsi Lagi
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Hasil Perolehan Suara</h2>
                <p className="text-sm text-slate-400">{selectedVoting.judul}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gold-400">{selectedVoting._count.suara}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Total Suara</div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedVoting.kandidat.map((k) => {
                const percentage = selectedVoting._count.suara > 0 
                  ? Math.round((k._count.suara / selectedVoting._count.suara) * 100) 
                  : 0;
                
                return (
                  <div key={k.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-white">{k.nama_kandidat}</span>
                      <span className="text-sm text-slate-400">{k._count.suara} suara ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setIsResultOpen(false)}
              className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Tutup Hasil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
