"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch, formatRupiah } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Plus, MessageCircle, Banknote, Search, Settings, X, Filter, Crown, Check } from "lucide-react";

export default function DaftarTagihanPage() {
  const { user } = useAuth();
  const fetcher = (url: string) => apiFetch<any>(url).then(res => {
    if (res.success && res.data) {
      return res.data.pembayaran.map((p: any) => ({
        id: p.id,
        nama: p.siswa?.nama_siswa || '-',
        kelas: p.siswa?.kelas || '-',
        keterangan: p.tagihan?.judul || '-',
        total_tagihan: p.tagihan?.nominal || 0,
        sisa_tagihan: p.status === 'LUNAS' ? 0 : Math.max(0, (p.tagihan?.nominal || 0) - (p.nominal_dibayar || 0) - (p.nominal_diskon || 0)),
        status: p.status
      }));
    }
    return [];
  });

  const { data: tagihan, isLoading: swrLoading, mutate: fetchTagihan } = useSWR(`/pembayaran?limit=50`, fetcher, { fallbackData: [] });
  const isLoading = swrLoading && tagihan.length === 0;
  
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null); // Untuk Modal Kasir Tunai
  
  const [selectedDispensasi, setSelectedDispensasi] = useState<any>(null); // Untuk Modal Dispensasi
  const [dispensasiTab, setDispensasiTab] = useState<'cicilan' | 'diskon'>('cicilan');
  const [cicilanCount, setCicilanCount] = useState<number>(2);
  const [nominalDiterima, setNominalDiterima] = useState<string>("");
  const [showPeringatanModal, setShowPeringatanModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [pesanMassal, setPesanMassal] = useState("Halo Bapak/Ibu Orang Tua dari [Nama Siswa],\n\nKami dari pihak komite sekolah ingin mengingatkan bahwa terdapat tagihan yang belum diselesaikan.\n\nMohon segera melakukan pembayaran. Abaikan pesan ini jika Anda sudah membayar.\n\nTerima kasih,\nAdmin Komite");

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTagihan = tagihan.filter((item: any) => {
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    // Dummy bulan filter: asumsi jika 'Juli 2026' dicari di keterangan atau kita anggap default semua cocok jika 'Semua'
    const matchBulan = filterBulan === "Semua" || item.keterangan.includes(filterBulan.split(' ')[0]);
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchBulan && matchSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredTagihan.map((t: any) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleLunas = async () => {
    if (selectedTagihan) {
      try {
        const bayar = parseInt(nominalDiterima || "0");
        const res = await apiFetch(`/pembayaran/${selectedTagihan.id}/bayar`, {
          method: 'POST',
          body: JSON.stringify({ nominal_bayar: bayar })
        });
        if (res.success) {
          toast.success("Pembayaran berhasil dicatat");
          fetchTagihan(); // Refresh data
        } else {
          toast.error("Gagal mencatat pembayaran: " + res.message);
        }
      } catch (error) {
        console.error("Gagal melunaskan tagihan", error);
        toast.error("Terjadi kesalahan sistem.");
      } finally {
        setSelectedTagihan(null);
      }
    }
  };

  const [nominalDiskon, setNominalDiskon] = useState<string>("");
  const [keteranganDiskon, setKeteranganDiskon] = useState<string>("");

  const handleSaveDispensasi = async () => {
    if (selectedDispensasi) {
      try {
        const diskon = parseInt(nominalDiskon || "0");
        const res = await apiFetch(`/pembayaran/${selectedDispensasi.id}/dispensasi`, {
          method: 'POST',
          body: JSON.stringify({ nominal_diskon: diskon, keterangan: keteranganDiskon })
        });
        if (res.success) {
          toast.success(`Berhasil menyimpan pengaturan keringanan biaya untuk ${selectedDispensasi.nama}`);
          fetchTagihan();
        } else {
          toast.error("Gagal menyimpan dispensasi: " + res.message);
        }
      } catch (error) {
        console.error("Gagal update dispensasi", error);
        toast.error("Terjadi kesalahan sistem saat menyimpan dispensasi.");
      } finally {
        setSelectedDispensasi(null);
      }
    }
  };

  const handleKirimPeringatan = async () => {
    try {
      const res = await apiFetch(`/pembayaran/peringatan-massal`, {
        method: 'POST',
        body: JSON.stringify({ pembayaran_ids: selectedRows, pesan: pesanMassal })
      });
      if (res.success) {
        toast.success(res.message);
        setSelectedRows([]);
      } else {
        toast.error("Gagal mengirim pesan: " + res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim pesan.");
    } finally {
      setShowPeringatanModal(false);
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Tagihan"
      subtitle="Kelola seluruh tagihan siswa dan catat pembayaran masuk"
    >
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2.5 items-center w-full sm:w-64 shadow-sm dark:shadow-xl transition-colors">
            <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-2 sm:mr-3 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau tagihan..." 
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-40">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Filter className="w-4 h-4"/></span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="LUNAS">Lunas</option>
                <option value="BELUM_BAYAR">Belum Bayar</option>
                <option value="DICICIL">Dicicil</option>
              </select>
            </div>
            <div className="relative w-full sm:w-44">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Filter className="w-4 h-4"/></span>
              <select 
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Semua">Semua Bulan</option>
                 {Array.from({ length: 12 }, (_, i) => {
                   const d = new Date();
                   d.setMonth(d.getMonth() - i);
                   const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                   const month = d.toLocaleDateString('id-ID', { month: 'long' });
                   return <option key={label} value={month}>{label}</option>;
                 })}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <button 
            disabled={selectedRows.length === 0}
            onClick={() => {
              if (selectedRows.length === 0) return;
              if ((user as any)?.paket === "BASIC") {
                setShowPaywallModal(true);
              } else {
                setShowPeringatanModal(true);
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl transition-all shadow-sm text-sm w-full sm:w-auto ${
              selectedRows.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.45)] hover:-translate-y-0.5' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Tagih yang Dipilih ({selectedRows.length})
          </button>
          <Link 
            href="/dashboard/tagihan/buat"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Buat Tagihan Baru
          </Link>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTagihan.length > 0 ? (
          filteredTagihan.map((item: any) => (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-navy-800/60 backdrop-blur-lg rounded-2xl border p-4 transition-colors ${
                selectedRows.includes(item.id) 
                  ? 'border-emerald-400 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                  : 'border-slate-200 dark:border-white/[0.07]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedRows.includes(item.id)}
                  onChange={() => handleSelectRow(item.id)}
                  className="w-4 h-4 mt-1 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.nama}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {item.kelas} · {item.keterangan.toLowerCase()}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sisa Tagihan</p>
                      <p className={`text-sm font-bold ${item.sisa_tagihan === 0 ? 'text-emerald-500' : 'text-rose-500 dark:text-rose-400'}`}>
                        {formatRupiah(item.sisa_tagihan)}
                      </p>
                    </div>
                    {(item.status === "DICICIL" || item.status === "BELUM_BAYAR" || item.status === "PENDING") && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTagihan(item);
                            setNominalDiterima(item.sisa_tagihan.toString());
                          }}
                          className="inline-flex items-center justify-center w-9 h-9 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 dark:text-blue-400 border border-blue-400/20 rounded-xl transition-colors"
                          title="Terima Bayar Tunai"
                        >
                          <Banknote className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedDispensasi(item)}
                          className="inline-flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl transition-colors"
                          title="Opsi Dispensasi"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            Tidak ada data yang sesuai dengan filter/pencarian.
          </div>
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
                <th scope="col" className="px-5 lg:px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === filteredTagihan.length && filteredTagihan.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Nama Siswa</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Kelas</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Keterangan Tagihan</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Tagihan</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Sisa Tagihan</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                <th scope="col" className="px-4 lg:px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] relative">
              {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredTagihan.length > 0 ? (
                filteredTagihan.map((item: any) => (
                  <tr key={item.id} className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group ${selectedRows.includes(item.id) ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-transparent'}`}>
                  <td className="px-5 lg:px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 lg:px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.nama}</td>
                  <td className="px-4 lg:px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                      {item.kelas}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 font-medium text-slate-700 dark:text-slate-300 capitalize">{item.keterangan.toLowerCase()}</td>
                  <td className="px-4 lg:px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatRupiah(item.total_tagihan)}</td>
                  <td className={`px-4 lg:px-6 py-4 font-bold whitespace-nowrap ${item.sisa_tagihan === 0 ? 'text-slate-500 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatRupiah(item.sisa_tagihan)}</td>
                  <td className="px-4 lg:px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-4 lg:px-6 py-4 text-center">
                    {(item.status === "DICICIL" || item.status === "BELUM_BAYAR" || item.status === "PENDING") ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTagihan(item);
                            setNominalDiterima(item.sisa_tagihan.toString());
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-400/20 rounded-lg transition-colors shadow-sm"
                          title="Terima Bayar Tunai"
                        >
                          <Banknote className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedDispensasi(item)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-lg transition-colors shadow-sm"
                          title="Opsi Dispensasi"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  Tidak ada data yang sesuai dengan filter/pencarian.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kasir Tunai */}
      {selectedTagihan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                Bayar Tagihan
              </h3>
              <button 
                onClick={() => setSelectedTagihan(null)}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-navy-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Siswa</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedTagihan.nama}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedTagihan.keterangan}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nominal yang Diterima (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                  <input 
                    type="number"
                    value={nominalDiterima}
                    onChange={(e) => setNominalDiterima(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Ubah angka ini jika orang tua hanya membayar sebagian/mencicil.
                </p>
              </div>

              {(() => {
                const bayar = parseInt(nominalDiterima || "0");
                const sisa = selectedTagihan.sisa_tagihan - bayar;
                return (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl text-sm text-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Sisa Tagihan Saat Ini: <strong className="text-slate-900 dark:text-white">{formatRupiah(selectedTagihan.sisa_tagihan)}</strong></span>
                    <br/>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sisa Tagihan Nanti: <strong className={sisa > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"}>{formatRupiah(sisa > 0 ? sisa : 0)}</strong></span>
                  </div>
                );
              })()}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-white/[0.025] border-t border-slate-100 dark:border-white/10 flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={() => setSelectedTagihan(null)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              {parseInt(nominalDiterima || "0") < selectedTagihan.sisa_tagihan ? (
                <button 
                  onClick={handleLunas}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 text-sm"
                >
                  Simpan Cicilan
                </button>
              ) : (
                <button 
                  onClick={handleLunas}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 text-sm"
                >
                  Tandai Lunas
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dispensasi */}
      {selectedDispensasi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025] rounded-t-3xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Pengaturan Keringanan Biaya
              </h3>
              <button 
                onClick={() => setSelectedDispensasi(null)}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="px-6 py-4 bg-white dark:bg-navy-800/50 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Siswa</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedDispensasi.nama} ({selectedDispensasi.kelas})</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Total Tagihan</p>
                <p className="font-bold text-rose-500 dark:text-rose-400">{formatRupiah(selectedDispensasi.total_tagihan)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-4 gap-6 bg-white dark:bg-navy-900 border-b border-slate-100 dark:border-white/10">
              <button
                onClick={() => setDispensasiTab('cicilan')}
                className={`pb-3 font-bold text-sm transition-colors relative ${dispensasiTab === 'cicilan' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Pecah Menjadi Cicilan
                {dispensasiTab === 'cicilan' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
              </button>
              <button
                onClick={() => setDispensasiTab('diskon')}
                className={`pb-3 font-bold text-sm transition-colors relative ${dispensasiTab === 'diskon' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Berikan Diskon/Beasiswa
                {dispensasiTab === 'diskon' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-navy-900 min-h-[220px]">
              {dispensasiTab === 'cicilan' ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah Pembagian Cicilan</label>
                    <div className="flex gap-3">
                      {[2, 3, 4].map((num) => (
                        <label key={num} className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${cicilanCount === num ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'}`}>
                          <input 
                            type="radio" 
                            name="cicilan" 
                            value={num} 
                            checked={cicilanCount === num}
                            onChange={() => setCicilanCount(num)}
                            className="sr-only"
                          />
                          <span className="font-bold">{num}x Bayar</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-navy-800/50 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tagihan ini akan dipecah menjadi <span className="font-bold text-slate-900 dark:text-white">{cicilanCount}</span> sub-tagihan terpisah dengan nominal masing-masing sebesar <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(selectedDispensasi.sisa_tagihan / cicilanCount)}</span>. Siswa dapat mencicilnya satu per satu.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Besaran Diskon</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          placeholder="Nominal Diskon"
                          value={nominalDiskon}
                          onChange={(e) => setNominalDiskon(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-bold shadow-sm"
                        />
                      </div>
                      <select className="w-24 px-3 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all font-bold appearance-none shadow-sm cursor-pointer">
                        <option value="persen">%</option>
                        <option value="rupiah">Rp</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Alasan Pemberian Diskon</label>
                    <textarea 
                      rows={3}
                      placeholder="Misal: Beasiswa Anak Berprestasi, Keringanan Yatim Piatu..."
                      value={keteranganDiskon}
                      onChange={(e) => setKeteranganDiskon(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400 font-medium shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.025] flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button 
                type="button"
                onClick={() => setSelectedDispensasi(null)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveDispensasi}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 text-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Peringatan Massal */}
      {showPeringatanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.025]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                Kirim Peringatan Massal
              </h3>
              <button 
                onClick={() => setShowPeringatanModal(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-xl flex gap-3 text-sm text-blue-700 dark:text-blue-300 font-medium">
                <MessageCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Pesan ini akan dikirim via WhatsApp API ke <strong>{selectedRows.length} orang tua siswa</strong> yang dipilih secara otomatis.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pesan WhatsApp</label>
                <textarea 
                  rows={6}
                  value={pesanMassal}
                  onChange={(e) => setPesanMassal(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm font-medium"
                />
                <p className="text-xs text-slate-500 mt-2">Tag `[Nama Siswa]` akan otomatis diganti oleh sistem saat pengiriman.</p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.025] flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={() => setShowPeringatanModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleKirimPeringatan}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim Pesan WA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paywall Premium */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-200 border border-amber-200/50 dark:border-amber-500/20">
            <div className="p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-yellow-500/10 to-transparent"></div>
              
              <div className="bg-yellow-100 text-yellow-600 rounded-full p-4 mb-6 relative z-10 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Crown className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-3 relative z-10">Tingkatkan ke Premium</h3>
              
              <p className="text-slate-400 text-center text-sm leading-relaxed mb-6 relative z-10">
                Fitur WhatsApp Gateway otomatis hanya tersedia untuk Paket Premium. Hemat waktu Anda dari menagih manual satu per satu. Biarkan sistem yang bekerja untuk Anda.
              </p>

              <div className="w-full bg-slate-900/50 rounded-2xl p-5 mb-6 border border-white/5 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Bebas tagih otomatis ke ratusan siswa
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Payment Gateway 24 jam terintegrasi
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Opsi pembayaran cicilan otomatis
                  </li>
                </ul>
              </div>

              <div className="w-full space-y-3 relative z-10">
                <button 
                  onClick={() => {
                    toast.success("Mengarahkan ke kontak Super Admin...");
                    window.open('https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20butuh%20bantuan%20terkait%20fitur%20Notifikasi%20WhatsApp', '_blank');
                    setShowPaywallModal(false);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(234,179,8,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(234,179,8,0.4)]"
                >
                  Hubungi Super Admin untuk Upgrade
                </button>
                <button 
                  onClick={() => setShowPaywallModal(false)}
                  className="w-full py-3 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Mungkin Nanti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
