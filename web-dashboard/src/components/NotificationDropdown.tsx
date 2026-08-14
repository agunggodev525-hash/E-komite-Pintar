"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info } from "lucide-react";

interface NotificationDropdownProps {
  isMobile?: boolean;
}

export function NotificationDropdown({ isMobile = false }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
      >
        <Bell className={isMobile ? "w-5 h-5" : "w-6 h-6"} strokeWidth={1.5} />
        <span className={`absolute ${isMobile ? 'top-1.5 right-1.5 w-2 h-2' : 'top-1 right-1 w-2.5 h-2.5'} bg-red-500 border-2 border-white dark:border-slate-900 rounded-full`}></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifikasi</h3>
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Tandai sudah dibaca</button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {/* Notifikasi Item 1 */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex gap-3 opacity-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pembaruan Sistem v1.2</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Fitur tema siang (Light Mode) kini tersedia untuk seluruh tampilan dashboard.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Baru saja</p>
              </div>
            </div>

            {/* Notifikasi Item 2 */}
            <div className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex gap-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pembayaran Sukses</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Siswa A.n Budi telah melunasi tagihan bulan Agustus melalui Midtrans.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">2 Jam yang lalu</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-slate-100 dark:border-white/10 text-center bg-slate-50 dark:bg-slate-900">
            <button className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
