"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { Search, RefreshCw, Download, Server, FileSearch, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const loadData = async (currentPage: number) => {
    try {
      setIsLoading(true);
      const res = await apiFetch<any>(`/superadmin/logs?page=${currentPage}&limit=${limit}`);
      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat log sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(p => p - 1);
  }
  
  const handleNext = () => {
    if (page < totalPages) setPage(p => p + 1);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  return (
    <DashboardLayout title="Log Sistem (Audit Trail)" subtitle="Pantau aktivitas pengguna secara real-time">
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#1B2A4A] dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-900/30 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Pengguna/Aksi..." 
                className="pl-9 pr-4 py-2 w-64 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            
            <select className="px-3 py-2 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none">
              <option>Waktu: Hari Ini</option>
              <option>Waktu: 7 Hari Terakhir</option>
              <option>Waktu: 30 Hari Terakhir</option>
            </select>
            
            <select className="px-3 py-2 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none">
              <option>Semua Sekolah</option>
            </select>
            
            <select className="px-3 py-2 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none">
              <option>Aksi: Semua</option>
              <option>Aksi: Login</option>
              <option>Aksi: Create</option>
              <option>Aksi: Delete</option>
            </select>
            
            <button className="p-2 bg-white dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors" title="Muat Ulang">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <button className="px-4 py-2 border border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Ekspor Log (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-white/60">
            <thead className="bg-slate-100 dark:bg-navy-900/50 text-slate-700 dark:text-white font-medium border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Sekolah</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 dark:text-white/40">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Memuat data...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40 mb-6">
                      <div className="relative">
                        <Server className="w-16 h-16 text-slate-500" strokeWidth={1} />
                        <FileSearch className="w-10 h-10 text-slate-400 absolute -bottom-2 -right-4 bg-[#1B2A4A] dark:bg-navy-800 rounded-full" strokeWidth={1.5} />
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Belum ada rekaman log sistem.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white-5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-white">{log.user?.nama_lengkap || '-'}</td>
                    <td className="px-6 py-4">{log.sekolah?.nama_sekolah || 'Sistem Global'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white-10 rounded text-xs font-semibold">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={log.detail}>{log.detail || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1B2A4A] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded bg-transparent border border-transparent hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 rounded bg-transparent border border-transparent hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={handlePrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1 mx-2">
              <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-semibold shadow-sm">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-transparent hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors">
                2
              </button>
            </div>

            <button 
              className="p-1.5 rounded bg-transparent border border-transparent hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={handleNext}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 rounded bg-transparent border border-transparent hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Halaman 1 dari 1</span>
            <select className="px-2 py-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded text-xs text-slate-700 dark:text-slate-300 focus:outline-none">
              <option>10</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
