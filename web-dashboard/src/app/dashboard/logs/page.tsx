"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";

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

      <div className="bg-navy-800 rounded-2xl border border-white-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white-60">
            <thead className="bg-navy-900/50 text-white font-medium">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Sekolah</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white-10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white-40">
                    Memuat data...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white-40">
                    Belum ada rekaman log sistem.
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
        
        {/* Pagination Controls */}
        {!isLoading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-white-10 flex items-center justify-between">
            <span className="text-sm text-white-60">Halaman {page} dari {totalPages || 1}</span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrev} 
                disabled={page === 1}
                className="px-4 py-2 rounded bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium"
              >
                Sebelumnya
              </button>
              <button 
                onClick={handleNext}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
