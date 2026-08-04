"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/api";
import { ArrowLeft, BookOpen, Brush, Wrench, Utensils, Receipt, X, Image as ImageIcon } from "lucide-react";

// Dummy pengeluaran terbaru
const dummyPengeluaran = [
  { id: "1", judul: "Pembelian Alat Kebersihan Kelas", kategori: "Kebersihan", icon: Brush, color: "text-emerald-500", bg: "bg-emerald-50", tanggal: "02 Ags 2026", nominal: 350000, nota: true },
  { id: "2", judul: "Konsumsi Rapat Wali Murid", kategori: "Konsumsi", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50", tanggal: "30 Jul 2026", nominal: 500000, nota: true },
  { id: "3", judul: "Perbaikan Kipas Angin Kelas X-A", kategori: "Infrastruktur", icon: Wrench, color: "text-slate-500", bg: "bg-slate-100", tanggal: "25 Jul 2026", nominal: 150000, nota: false },
  { id: "4", judul: "Buku Panduan Ekstrakurikuler", kategori: "Akademik", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", tanggal: "15 Jul 2026", nominal: 1200000, nota: true },
];

export default function TransparansiDanaPage() {
  const [selectedNota, setSelectedNota] = useState<any>(null);

  const totalDanaMaksimal = 50000000;
  const sisaSaldo = 15000000;
  const terpakai = totalDanaMaksimal - sisaSaldo;
  const persentaseTerpakai = (terpakai / totalDanaMaksimal) * 100;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl overflow-hidden">
      
      {/* 1. Header Mobile */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">Transparansi Dana</h1>
        <div className="w-6"></div> {/* Spacer for perfect centering */}
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
            <h2 className="text-sm font-bold text-slate-800">Pengeluaran Terbaru</h2>
            <button className="text-xs font-bold text-blue-600">Bulan Ini</button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {dummyPengeluaran.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Ikon Kategori */}
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Detail Item */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.judul}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span>{item.tanggal}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{item.kategori}</span>
                    </div>
                    
                    {/* Baris Nominal & Bukti Nota */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-rose-600">-{formatRupiah(item.nominal)}</p>
                      
                      {/* 4. Fitur Lihat Bukti */}
                      {item.nota ? (
                        <button 
                          onClick={() => setSelectedNota(item)}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Lihat Kuitansi
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 italic">Tanpa kuitansi</span>
                      )}
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
