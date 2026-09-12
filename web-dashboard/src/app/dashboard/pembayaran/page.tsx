"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/api";
import { ArrowLeft, ChevronDown, ChevronUp, Wallet, Landmark, Store, CheckCircle2 } from "lucide-react";

export default function DetailPembayaranPage() {
  const [activeMethod] = useState<string>("BCA_VA");
  const [openSection, setOpenSection] = useState<string>("VA"); // 'EWALLET', 'VA', 'RETAIL'

  const totalPembayaran = 350000;

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 dark:bg-[#0f172a] relative shadow-2xl flex flex-col">
      
      {/* 1. Header Mobile */}
      <div className="bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl p-4 flex items-center justify-between shadow-sm border-b border-slate-200 dark:border-white/10 shrink-0 z-20">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Detail Pembayaran</h1>
        <div className="w-6"></div> {/* Spacer for perfect centering */}
      </div>

      {/* Content Scrollable */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        
        {/* 2. Rincian Tagihan */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-3 px-1">Rincian Tagihan</h2>
          <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
            {/* Dekorasi efek struk */}
            <div className="absolute left-0 right-0 -top-2 flex justify-between px-2 opacity-20">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-slate-400 rounded-full"></div>
              ))}
            </div>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">SPP Bulan Juli 2026</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(250000)}</p>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Uang Kegiatan Outing</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(100000)}</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 dark:border-white/10 pt-4 mt-2 flex justify-between items-center">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pembayaran</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{formatRupiah(totalPembayaran)}</p>
            </div>
          </div>
        </div>

        {/* 3. Metode Pembayaran */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-3 px-1">Pilih Metode Pembayaran</h2>
          
          <div className="space-y-3">
            {/* Virtual Account Accordion */}
            <div className="bg-white dark:bg-navy-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'VA' ? '' : 'VA')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Virtual Account Bank</span>
                </div>
                {openSection === 'VA' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'VA' && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-navy-900/50 space-y-2">
                  {['BCA_VA', 'MANDIRI_VA', 'BRI_VA'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-transparent hover:bg-white dark:hover:bg-navy-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 shadow-sm">
                          {method.split('_')[0]}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{method.split('_')[0]} Virtual Account</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-navy-800'}`}>
                        {activeMethod === method && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* E-Wallet Accordion */}
            <div className="bg-white dark:bg-navy-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'EWALLET' ? '' : 'EWALLET')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">E-Wallet</span>
                </div>
                {openSection === 'EWALLET' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'EWALLET' && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-navy-900/50 space-y-2">
                  {['GOPAY', 'OVO', 'DANA'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-transparent hover:bg-white dark:hover:bg-navy-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 shadow-sm">
                          {method}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{method.toLowerCase()}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-navy-800'}`}>
                        {activeMethod === method && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Minimarket Accordion */}
            <div className="bg-white dark:bg-navy-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'RETAIL' ? '' : 'RETAIL')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Gerai Minimarket</span>
                </div>
                {openSection === 'RETAIL' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'RETAIL' && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-navy-900/50 space-y-2">
                  {['INDOMARET', 'ALFAMART'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-transparent hover:bg-white dark:hover:bg-navy-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 overflow-hidden shadow-sm">
                          {method.substring(0, 4)}...
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{method.toLowerCase()}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-navy-800'}`}>
                        {activeMethod === method && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 4. Sticky Bottom Button */}
      <div className="p-4 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-50 shrink-0">
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] transition-all active:scale-[0.98] flex justify-center items-center gap-2">
          Konfirmasi & Bayar <span className="opacity-70 font-normal">|</span> {formatRupiah(totalPembayaran)}
        </button>
      </div>
      
    </div>
  );
}
