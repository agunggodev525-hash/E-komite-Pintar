"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRupiah, apiFetch, formatDate } from "@/lib/api";
import { ArrowLeft, BookOpen, Brush, Wrench, Utensils, Receipt, X, Image as ImageIcon, ArrowDownCircle, ArrowUpCircle, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function TransparansiDanaPage() {
  const [selectedNota, setSelectedNota] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch<any>("/laporan/transparansi");
        setData(res.data);
      } catch (err: any) {
        alert("Gagal memuat transparansi: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalDanaMaksimal = data?.total_pemasukan || 0;
  const sisaSaldo = data?.saldo_akhir || 0;
  const terpakai = data?.total_pengeluaran || 0;
  const persentaseTerpakai = totalDanaMaksimal > 0 ? (terpakai / totalDanaMaksimal) * 100 : 0;

  const exportToPDF = () => {
    if (!data || !data.history) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Laporan Transparansi Dana Komite", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Total Pemasukan : ${formatRupiah(data.total_pemasukan)}`, 14, 40);
    doc.text(`Total Pengeluaran : ${formatRupiah(data.total_pengeluaran)}`, 14, 46);
    doc.text(`Saldo Akhir       : ${formatRupiah(data.saldo_akhir)}`, 14, 52);
    
    // Table
    const tableColumn = ["Tanggal", "Keterangan", "Jenis", "Nominal"];
    const tableRows: any[] = [];
    
    data.history.forEach((item: any) => {
      const rowData = [
        formatDate(item.tanggal),
        item.keterangan,
        item.jenis,
        formatRupiah(item.nominal)
      ];
      tableRows.push(rowData);
    });
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });
    
    doc.save("Laporan_Transparansi_Komite.pdf");
  };

  const exportToExcel = () => {
    if (!data || !data.history) return;
    
    const worksheetData = data.history.map((item: any) => ({
      Tanggal: formatDate(item.tanggal),
      Keterangan: item.keterangan,
      Jenis: item.jenis,
      Nominal: item.nominal
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Tanggal
      { wch: 40 }, // Keterangan
      { wch: 15 }, // Jenis
      { wch: 20 }  // Nominal
    ];
    
    XLSX.writeFile(workbook, "Laporan_Transparansi_Komite.xlsx");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl overflow-hidden">
      
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">Transparansi Dana</h1>
        <div className="flex gap-2">
          <button onClick={exportToPDF} title="Export PDF" className="p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors">
            <FileText className="w-5 h-5" />
          </button>
          <button onClick={exportToExcel} title="Export Excel" className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Scrollable */}
      <div className="p-4 space-y-6 overflow-y-auto pb-8">
        
        {/* 2. Ringkasan Kas (Visual) */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Ringkasan Kas Bulan Ini</h2>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-sm font-medium text-slate-500 mb-1">Sisa Saldo Kas Komite</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-6">{formatRupiah(sisaSaldo)}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-500">{persentaseTerpakai.toFixed(0)}% Terpakai</span>
                <span className="text-emerald-500">{(100 - persentaseTerpakai).toFixed(0)}% Tersisa</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${persentaseTerpakai}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 pt-1">
                <span>{formatRupiah(terpakai)}</span>
                <span>{formatRupiah(totalDanaMaksimal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section "Pengeluaran Terbaru" */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-800">Riwayat Transaksi</h2>
            <button className="text-xs font-bold text-blue-600">Bulan Ini</button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-sm">Memuat data...</div>
            ) : data?.history?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">Belum ada transaksi.</div>
            ) : data?.history?.map((item: any) => (
              <div key={item.id + item.jenis} className="p-4">
                <div className="flex gap-4">
                  {/* Ikon Kategori */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.jenis === 'PEMASUKAN' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {item.jenis === 'PEMASUKAN' ? <ArrowDownCircle className="w-6 h-6" /> : <ArrowUpCircle className="w-6 h-6" />}
                  </div>
                  
                  {/* Detail Item */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.keterangan}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span>{formatDate(item.tanggal)}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className={item.jenis === 'PEMASUKAN' ? 'text-emerald-600' : 'text-rose-600'}>{item.jenis}</span>
                    </div>
                    
                    {/* Baris Nominal & Bukti Nota */}
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm font-bold ${item.jenis === 'PEMASUKAN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.jenis === 'PEMASUKAN' ? '+' : '-'}{formatRupiah(item.nominal)}
                      </p>
                      
                      {/* Fitur Lihat Bukti */}
                      {item.jenis === 'PENGELUARAN' && item.nota_url ? (
                        <button 
                          onClick={() => setSelectedNota(item)}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Lihat Kuitansi
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Modal / Image Preview untuk Kuitansi */}
      {selectedNota && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setSelectedNota(null)}
              className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Bukti Kuitansi</h3>
            </div>
            
            <div className="p-4 bg-slate-100 flex justify-center items-center aspect-[3/4]">
              {/* Simulasi Gambar Kuitansi */}
              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <Receipt className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-xs font-bold text-center px-4">
                  Preview Foto Nota <br/> {selectedNota.judul}
                </p>
              </div>
            </div>
            
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500 font-medium">Diunggah oleh: Admin Komite pada {selectedNota.tanggal}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
