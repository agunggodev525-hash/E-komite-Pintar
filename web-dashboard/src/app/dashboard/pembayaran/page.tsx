"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/api";
import { ArrowLeft, ChevronDown, ChevronUp, Wallet, Landmark, Store, CheckCircle2 } from "lucide-react";

export default function DetailPembayaranPage() {
  const [activeMethod, setActiveMethod] = useState<string>("BCA_VA");
  const [openSection, setOpenSection] = useState<string>("VA"); // 'EWALLET', 'VA', 'RETAIL'

  const totalPembayaran = 350000;

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 relative shadow-2xl flex flex-col">
      
      {/* 1. Header Mobile */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm shrink-0 z-20">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">Detail Pembayaran</h1>
        <div className="w-6"></div> {/* Spacer for perfect centering */}
      </div>

      {/* Content Scrollable */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        
        {/* 2. Rincian Tagihan */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Rincian Tagihan</h2>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Dekorasi efek struk */}
            <div className="absolute left-0 right-0 -top-2 flex justify-between px-2 opacity-20">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-slate-400 rounded-full"></div>
              ))}
            </div>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-600">SPP Bulan Juli 2026</p>
                <p className="text-sm font-bold text-slate-800">{formatRupiah(250000)}</p>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-600">Uang Kegiatan Outing</p>
                <p className="text-sm font-bold text-slate-800">{formatRupiah(100000)}</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 pt-4 mt-2 flex justify-between items-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Pembayaran</p>
              <p className="text-lg font-extrabold text-blue-600">{formatRupiah(totalPembayaran)}</p>
            </div>
          </div>
        </div>

        {/* 3. Metode Pembayaran */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Pilih Metode Pembayaran</h2>
          
          <div className="space-y-3">
            {/* Virtual Account Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'VA' ? '' : 'VA')}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">Virtual Account Bank</span>
                </div>
                {openSection === 'VA' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'VA' && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  {['BCA_VA', 'MANDIRI_VA', 'BRI_VA'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                          {method.split('_')[0]}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{method.split('_')[0]} Virtual Account</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}>
                        {activeMethod === method && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* E-Wallet Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'EWALLET' ? '' : 'EWALLET')}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">E-Wallet</span>
                </div>
                {openSection === 'EWALLET' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'EWALLET' && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  {['GOPAY', 'OVO', 'DANA'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                          {method}
                        </div>
                        <span className="text-sm font-bold text-slate-700 capitalize">{method.toLowerCase()}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}>
                        {activeMethod === method && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Minimarket Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'RETAIL' ? '' : 'RETAIL')}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">Gerai Minimarket</span>
                </div>
                {openSection === 'RETAIL' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {openSection === 'RETAIL' && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  {['INDOMARET', 'ALFAMART'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMethod === method ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden">
                          {method.substring(0, 4)}...
                        </div>
                        <span className="text-sm font-bold text-slate-700 capitalize">{method.toLowerCase()}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}>
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
      <div className="p-4 bg-white border-t border-slate-100 z-50 shrink-0">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
          Konfirmasi & Bayar <span className="opacity-70 font-normal">|</span> {formatRupiah(totalPembayaran)}
        </button>
      </div>
      
    </div>
  );
}
