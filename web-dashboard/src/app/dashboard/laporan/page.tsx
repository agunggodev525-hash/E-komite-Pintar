"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch, formatRupiah } from "@/lib/api";
import { Download, Filter, ArrowDownRight, Eye, Info, PieChart } from "lucide-react";
import * as XLSX from 'xlsx';

export default function LaporanKasPage() {
  const { user } = useAuth();
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterJenis, setFilterJenis] = useState("Semua");
  
  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data, error } = useSWR(`/laporan/keuangan?bulan=${filterBulan}&tahun=${filterTahun}`, fetcher);
  
  const isLoading = !data && !error;
  const transaksiList = data?.detail_transaksi || [];
  const totalMasuk = data?.total_pemasukan || 0;
  const totalKeluar = data?.total_pengeluaran || 0;
  const sisaKas = data?.sisa_kas || 0;

  const handleExport = () => {
    try {
      if (transaksiList.length === 0) {
        alert("Tidak ada data untuk diekspor pada periode ini.");
        return;
      }
      // 1. Pemetaan Kolom (Cell Mapping)
      const excelData = transaksiList.map((item, index) => ({
        "No": index + 1,
        "Tanggal": new Date(item.tanggal).toLocaleDateString('id-ID'),
        "Nama Siswa": item.siswa,
        "Kelas": item.kelas,
        "Keterangan": item.keterangan,
        "Nominal Pemasukan": item.nominal
      }));

      // 2. Buat worksheet dan auto-detect tipe cell
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 3. Pengaturan Lebar Kolom (Auto-fit)
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Tanggal
        { wch: 25 }, // Siswa
        { wch: 10 }, // Kelas
        { wch: 40 }, // Keterangan
        { wch: 20 }, // Nominal
      ];
      worksheet['!cols'] = columnWidths;

      // Buat workbook dan tambahkan worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pemasukan");

      // 4. Unduh sebagai file .xlsx asli
      XLSX.writeFile(workbook, `Laporan_Pemasukan_${filterBulan}_${filterTahun}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengekspor data.");
    }
  };

  const handleDownloadPDF = () => {
    alert("Mengunduh Laporan PDF...");
  };

  if (user?.role === "SEKOLAH") {
    return (
      <DashboardLayout
        title="Audit Arus Kas Komite"
        subtitle="Pantau transparansi dan mutasi kas secara real-time"
      >
        <div className="flex justify-end mb-6">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Unduh Laporan PDF
          </button>
        </div>

        {/* Alert Box Auditor */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm transition-colors">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed font-medium">
            Data pada halaman ini tersinkronisasi otomatis secara real-time dari aktivitas Bendahara Komite. Anda bertindak sebagai auditor independen.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl mb-6 flex flex-col md:flex-row items-end gap-4 transition-colors">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Bulan</label>
            <select 
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-800 cursor-pointer"
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
              className="w-full md:w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-800 cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <button className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent text-white font-semibold rounded-lg text-sm transition-colors shadow-sm">
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* Table Transparansi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tanggal</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Siswa</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Keterangan</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Nominal Masuk</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 relative">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Memuat data...
                    </td>
                  </tr>
                ) : transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada transaksi masuk pada periode ini.
                    </td>
                  </tr>
                ) : (
                  transaksiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.siswa}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.kelas}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.keterangan}</td>
                    <td className="px-6 py-4 text-right font-semibold whitespace-nowrap text-emerald-400">
                      + {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Lihat Detail/Nota">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Laporan Arus Kas Komite"
      subtitle="Pantau seluruh transaksi pemasukan dan pengeluaran kas"
    >
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-6">
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 text-sm"
        >
          <Download className="w-4 h-4" />
          Ekspor ke Excel (.xlsx)
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl mb-6 transition-colors">
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-bold">
          <Filter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          Filter Pencarian
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Bulan</label>
            <select 
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tahun</label>
            <select 
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Jenis</label>
            <select 
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              <option value="Semua">Semua</option>
              <option value="Pemasukan Saja">Pemasukan Saja</option>
              <option value="Pengeluaran Saja">Pengeluaran Saja</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm">
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* KOTAK TOTAL PEMASUKAN */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group h-full shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-2">
                {formatRupiah(totalMasuk)}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                Dari <span className="text-emerald-600 dark:text-emerald-500 font-bold">{transaksiList.length}</span> transaksi lunas
              </p>
            </div>
          </div>

          {/* KOTAK TOTAL PENGELUARAN */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group h-full shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <ArrowDownRight className="w-6 h-6 rotate-180" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight mb-2">
                {formatRupiah(totalKeluar)}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                Bulan ini
              </p>
            </div>
          </div>

          {/* KOTAK SISA KAS */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group h-full shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <PieChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Saldo / Sisa Kas</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-2">
                {formatRupiah(sisaKas)}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                Total kas tersedia
              </p>
            </div>
          </div>
        </div>

      {/* Table Rekap */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tanggal</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Siswa</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Keterangan</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Nominal Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada transaksi masuk pada periode ini.
                    </td>
                  </tr>
                ) : (
                transaksiList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{item.siswa}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.kelas}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.keterangan}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    + {formatRupiah(item.nominal)}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 flex justify-between items-center rounded-b-3xl">
          <span>Menampilkan {transaksiList.length} transaksi pemasukan</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
