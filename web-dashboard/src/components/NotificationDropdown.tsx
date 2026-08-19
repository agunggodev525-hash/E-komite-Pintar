"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle } from "lucide-react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";

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

  const fetcher = (url: string) => apiFetch<any>(url).then(res => res.data);
  const { data: notifications, mutate } = useSWR("/notifikasi", fetcher, { 
    refreshInterval: 60000 // Poll every minute
  });

  const notifs = notifications || [];
  const unreadCount = notifs.filter((n: any) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch("/notifikasi/read-all", { method: "PATCH" });
      mutate();
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'SUCCESS': return <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default: return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'SUCCESS': return "bg-emerald-100 dark:bg-emerald-500/20";
      case 'WARNING': return "bg-amber-100 dark:bg-amber-500/20";
      case 'ERROR': return "bg-rose-100 dark:bg-rose-500/20";
      default: return "bg-blue-100 dark:bg-blue-500/20";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
      >
        <Bell className={isMobile ? "w-5 h-5" : "w-6 h-6"} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className={`absolute ${isMobile ? 'top-1.5 right-1.5 w-2 h-2' : 'top-0 right-0 min-w-4 h-4 px-1 text-[9px] font-bold text-white flex items-center justify-center'} bg-red-500 border border-white dark:border-slate-900 rounded-full`}>
            {!isMobile ? (unreadCount > 99 ? '99+' : unreadCount) : ''}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Tandai sudah dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Belum ada notifikasi
              </div>
            ) : (
              notifs.map((notif: any) => (
                <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex gap-3 ${notif.is_read ? 'opacity-60' : 'opacity-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${getIconBg(notif.tipe)}`}>
                    {getIcon(notif.tipe)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notif.judul}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.pesan}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{formatTime(notif.created_at)}</p>
                  </div>
                </div>
              ))
            )}
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
