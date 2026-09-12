"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch, formatRupiah } from "@/lib/api";
import { Download, Filter, ArrowDownRight, Info, PieChart, Search, Flag, X } from "lucide-react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

export default function LaporanKasPage() {
  const { user } = useAuth();
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [search, setSearch] = useState("");
  
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [auditNote, setAuditNote] = useState("");
  const [isFlagged, setIsFlagged] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data, error, mutate } = useSWR(`/laporan/keuangan?bulan=${filterBulan}&tahun=${filterTahun}`, fetcher);
  
  const isLoading = !data && !error;
  // Filter based on search (Client side for now, for quick access)
  const transaksiList = useMemo(() => {
    const rawTransaksiList = data?.detail_transaksi || [];
    let filtered = rawTransaksiList;
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      filtered = filtered.filter((t: any) =>
        (t.siswa && t.siswa.toLowerCase().includes(s)) ||
        (t.keterangan && t.keterangan.toLowerCase().includes(s))
      );
    }
    
    if (filterJenis === "Pemasukan Saja") {
      filtered = filtered.filter((t: any) => t.tipe === "PEMASUKAN");
    } else if (filterJenis === "Pengeluaran Saja") {
      filtered = filtered.filter((t: any) => t.tipe === "PENGELUARAN");
    }

    return filtered;
  }, [data, search, filterJenis]);

  const sisaKas = data?.sisa_kas ?? 0;
  const totalMasuk = data?.total_masuk ?? 0;
  const totalKeluar = data?.total_keluar ?? 0;
  const pertumbuhanPersen = data?.pertumbuhan_persen ?? 0;
  const saldoAwal = data?.saldo_awal ?? 0;

  const handleExport = () => {
    try {
      if (transaksiList.length === 0) {
        toast.error("Tidak ada data untuk diekspor pada periode ini.");
        return;
      }
      // 1. Pemetaan Kolom (Cell Mapping)
      const excelData = transaksiList.map((item: any, index: number) => ({
        "No": index + 1,
        "Tanggal": new Date(item.tanggal).toLocaleDateString('id-ID'),
        "Tipe": item.tipe,
        "Nama Siswa": item.siswa,
        "Kelas": item.kelas,
        "Keterangan": item.keterangan,
        "Nominal Masuk": item.tipe === 'PEMASUKAN' ? item.nominal : 0,
        "Nominal Keluar": item.tipe === 'PENGELUARAN' ? item.nominal : 0,
        "Saldo Berjalan": item.saldo_berjalan,
        "Catatan Audit": item.audit_note || "-",
        "Flag": item.is_flagged ? "Ya" : "Tidak"
      }));

      // 2. Buat worksheet dan auto-detect tipe cell
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 3. Pengaturan Lebar Kolom (Auto-fit)
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Tanggal
        { wch: 12 }, // Tipe
        { wch: 25 }, // Siswa
        { wch: 10 }, // Kelas
        { wch: 40 }, // Keterangan
        { wch: 20 }, // Masuk
        { wch: 20 }, // Keluar
        { wch: 20 }, // Saldo Berjalan
        { wch: 40 }, // Catatan Audit
        { wch: 10 }, // Flag
      ];
      worksheet['!cols'] = columnWidths;

      // Buat workbook dan tambahkan worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Arus_Kas");

      // 4. Unduh sebagai file .xlsx asli
      XLSX.writeFile(workbook, `Laporan_Arus_Kas_${filterBulan}_${filterTahun}.xlsx`);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengekspor data.");
    }
  };

  const handleDownloadPDF = () => {
    toast.success("Mempersiapkan Laporan PDF...");
  };

  const openAuditModal = (trx: any) => {
    setSelectedTrx(trx);
    setAuditNote(trx.audit_note || "");
    setIsFlagged(trx.is_flagged || false);
    setIsAuditModalOpen(true);
  };

  const saveAuditNote = async () => {
    if (!selectedTrx) return;
    setIsSubmittingNote(true);
    try {
      const res = await apiFetch(`/laporan/audit/${selectedTrx.tipe.toLowerCase()}/${selectedTrx.id}`, {
        method: 'POST',
        body: JSON.stringify({ audit_note: auditNote, is_flagged: isFlagged })
      });
      if (res.success) {
        toast.success("Catatan audit berhasil disimpan");
        setIsAuditModalOpen(false);
        mutate(); // Refresh data
      } else {
        toast.error(res.message || "Gagal menyimpan catatan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

      {/* Card 1 — Saldo */}
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border border-blue-100 dark:border-blue-500/15 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-t-2xl" />
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 dark:bg-blue-500/[0.12] rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="relative z-10 p-5 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Saldo<br/>Saat Ini</span>
          </div>
          <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-1 truncate" title={formatRupiah(sisaKas)}>
            {isLoading ? <span className="inline-block w-32 h-7 bg-blue-100 dark:bg-blue-500/20 rounded-lg animate-pulse" /> : formatRupiah(sisaKas)}
          </h2>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tersedia Bulan Ini</p>
        </div>
      </div>

      {/* Card 2 — Pemasukan */}
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border border-emerald-100 dark:border-emerald-500/15 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-t-2xl" />
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/[0.12] rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="relative z-10 p-5 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Total<br/>Pemasukan</span>
          </div>
          <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-1 truncate" title={formatRupiah(totalMasuk)}>
            {isLoading ? <span className="inline-block w-32 h-7 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg animate-pulse" /> : formatRupiah(totalMasuk)}
          </h2>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Periode Difilter</p>
        </div>
      </div>

      {/* Card 3 — Pengeluaran */}
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border border-rose-100 dark:border-rose-500/15 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(244,63,94,0.15)] transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 rounded-t-2xl" />
        <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 dark:bg-rose-500/[0.12] rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="relative z-10 p-5 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/15 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400 rotate-180" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Total<br/>Pengeluaran</span>
          </div>
          <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-rose-600 dark:text-rose-400 tracking-tight mb-1 truncate" title={formatRupiah(totalKeluar)}>
            {isLoading ? <span className="inline-block w-32 h-7 bg-rose-100 dark:bg-rose-500/20 rounded-lg animate-pulse" /> : formatRupiah(totalKeluar)}
          </h2>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Periode Difilter</p>
        </div>
      </div>

      {/* Card 4 — Pertumbuhan */}
      <div className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800/70 border shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
        Number(pertumbuhanPersen) >= 0 ? 'border-amber-100 dark:border-amber-500/15 dark:hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)]' : 'border-rose-100 dark:border-rose-500/15'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${Number(pertumbuhanPersen) >= 0 ? 'bg-gradient-to-r from-amber-500 via-gold-400 to-amber-500' : 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500'}`} />
        <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none ${Number(pertumbuhanPersen) >= 0 ? 'bg-amber-500/10 dark:bg-amber-500/[0.12]' : 'bg-rose-500/10 dark:bg-rose-500/[0.12]'}`} />
        <div className="relative z-10 p-5 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${Number(pertumbuhanPersen) >= 0 ? 'bg-amber-50 dark:bg-amber-500/15' : 'bg-rose-50 dark:bg-rose-500/15'}`}>
              <PieChart className={`w-5 h-5 ${Number(pertumbuhanPersen) >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] text-right leading-snug">Pertumbuhan<br/>Kas</span>
          </div>
          <h2 className={`text-2xl sm:text-[1.7rem] font-extrabold tracking-tight mb-1 truncate ${Number(pertumbuhanPersen) >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isLoading ? <span className="inline-block w-24 h-7 bg-amber-100 dark:bg-amber-500/20 rounded-lg animate-pulse" /> : `${Number(pertumbuhanPersen) > 0 ? '+' : ''}${pertumbuhanPersen}%`}
          </h2>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Bulan ke Bulan</p>
        </div>
      </div>

    </div>
  );

  if (user?.role === "SEKOLAH") {
    return (
      <DashboardLayout
        title="Audit Arus Kas Komite"
        subtitle="Pantau transparansi dan mutasi kas secara real-time"
      >
        <div className="flex justify-end mb-6 gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-900 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Unduh Laporan PDF
          </button>
        </div>

        {/* Alert Box Auditor */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm transition-colors">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed font-medium">
            Data pada halaman ini tersinkronisasi otomatis secara real-time dari aktivitas Bendahara Komite. Anda bertindak sebagai auditor independen. Fitur Catatan Audit tersedia di kolom Aksi.
          </p>
        </div>

        {renderSummaryCards()}

        {/* Filter Card */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl mb-6 flex flex-col md:flex-row items-end gap-4 transition-colors">
          <div className="w-full md:flex-1 relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Cari Transaksi</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama siswa atau keterangan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 shadow-sm rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Jenis</label>
            <select 
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full md:w-40 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 cursor-pointer"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Pemasukan Saja">Pemasukan Saja</option>
              <option value="Pengeluaran Saja">Pengeluaran Saja</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Bulan</label>
            <select 
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full md:w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 cursor-pointer"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tahun</label>
            <select 
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full md:w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* Table Transparansi (Audit) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-32">Tanggal</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Siswa / Referensi</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Keterangan</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Nominal</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Saldo Berjalan</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 relative">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Memuat data...
                    </td>
                  </tr>
                ) : transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada transaksi pada periode atau filter ini.
                    </td>
                  </tr>
                ) : (
                  transaksiList.map((item: any) => {
                    const isMasuk = item.tipe === 'PEMASUKAN';
                    return (
                      <tr key={item.id} className={`${item.is_flagged ? 'bg-amber-50/50' : 'hover:bg-slate-50'} dark:hover:bg-white/5 transition-colors group`}>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {item.is_flagged && <Flag className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" />}
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{item.siswa !== '-' ? item.siswa : 'Pengurus Komite'}</p>
                              {item.kelas !== '-' && <p className="text-xs text-slate-500 dark:text-slate-400">{item.kelas}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-white">
                          {item.keterangan}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${isMasuk ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isMasuk ? '+ ' : '- '} {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold font-mono text-blue-700 whitespace-nowrap">
                          {formatRupiah(item.saldo_berjalan)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => openAuditModal(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Beri Catatan Audit"
                          >
                            <Flag className="w-4 h-4 stroke-[2]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center rounded-b-3xl">
            <span>Saldo Awal (Sebelum {filterBulan}/{filterTahun}): <strong className="text-slate-700">{formatRupiah(saldoAwal)}</strong></span>
            <span>Menampilkan {transaksiList.length} transaksi</span>
          </div>
        </div>

        {/* Modal Catatan Audit */}
        {isAuditModalOpen && selectedTrx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmittingNote && setIsAuditModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-rose-500" />
                  Catatan Audit Transaksi
                </h3>
                <button 
                  onClick={() => setIsAuditModalOpen(false)}
                  disabled={isSubmittingNote}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-sm">
                  <div className="grid grid-cols-3 gap-y-2">
                    <span className="text-slate-500">Tanggal:</span>
                    <span className="col-span-2 font-medium text-slate-800">{new Date(selectedTrx.tanggal).toLocaleDateString('id-ID')}</span>
                    <span className="text-slate-500">Tipe:</span>
                    <span className={`col-span-2 font-bold ${selectedTrx.tipe === 'PEMASUKAN' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedTrx.tipe}</span>
                    <span className="text-slate-500">Keterangan:</span>
                    <span className="col-span-2 font-medium text-slate-800">{selectedTrx.keterangan}</span>
                    <span className="text-slate-500">Nominal:</span>
                    <span className="col-span-2 font-bold text-slate-800">{formatRupiah(selectedTrx.nominal)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isFlagged}
                      onChange={(e) => setIsFlagged(e.target.checked)}
                      className="w-5 h-5 accent-rose-500 rounded border-slate-300 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800 select-none">Tandai (Flag) transaksi ini mencurigakan / butuh klarifikasi</span>
                  </label>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Audit</label>
                    <textarea 
                      value={auditNote}
                      onChange={(e) => setAuditNote(e.target.value)}
                      placeholder="Tulis alasan, pertanyaan, atau catatan untuk bendahara di sini..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAuditModalOpen(false)}
                  disabled={isSubmittingNote}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-transparent border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={saveAuditNote}
                  disabled={isSubmittingNote}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {isSubmittingNote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Catatan"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }
   
  // --- View for ORANG_TUA ---
  return (
    <DashboardLayout
      title="Laporan Arus Kas Komite"
      subtitle="Pantau seluruh transaksi pemasukan dan pengeluaran kas secara transparan"
    >
      {renderSummaryCards()}
      
      {/* Premium Filter Card */}
      <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-white/[0.07] shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6 overflow-hidden transition-colors">
        {/* Filter Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Filter Pencarian</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Tampilkan berdasarkan rentang waktu & jenis</p>
            </div>
          </div>
          {(filterJenis !== 'Semua') && (
            <span className="badge badge-blue">{filterJenis}</span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Bulan</label>
              <select 
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none cursor-pointer transition-all"
              >
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Tahun</label>
              <select 
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none cursor-pointer transition-all"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Jenis Transaksi</label>
              <select 
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none cursor-pointer transition-all"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Pemasukan Saja">Pemasukan Saja</option>
                <option value="Pengeluaran Saja">Pengeluaran Saja</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Transaction Table */}
      <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-colors">
        
        {/* Table Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Transaksi</p>
          {!isLoading && (
            <span className="badge badge-slate">{transaksiList.length} transaksi</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.025] border-b border-slate-100 dark:border-white/[0.06]">
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-32">Tanggal</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Siswa / Referensi</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Keterangan</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">Memuat transaksi...</p>
                    </div>
                  </td>
                </tr>
              ) : transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-1">
                        <PieChart className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada transaksi</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">pada periode atau filter ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transaksiList.map((item: any) => {
                  const isMasuk = item.tipe === 'PEMASUKAN';
                  return (
                    <tr key={item.id} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.siswa !== '-' ? item.siswa : 'Pengurus Komite'}</p>
                        {item.kelas !== '-' && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.kelas}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex shrink-0 w-1.5 h-1.5 rounded-full ${isMasuk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{item.keterangan}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isMasuk 
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}>
                          {isMasuk ? '+' : '−'} {formatRupiah(item.nominal)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-300">{transaksiList.length}</span> transaksi
          </span>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
