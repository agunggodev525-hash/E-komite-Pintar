"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Sidebar from "./Sidebar";

import { useAuth } from "@/context/AuthContext";

// ============================================
// DashboardLayout — Sidebar + Main Content
// ============================================

export default function DashboardLayout({
  children,
  title,
  subtitle,
  titleExtra,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  titleExtra?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, stopImpersonate } = useAuth();

  // Cek apakah ada original_token (artinya sedang impersonate)
  const isImpersonating = typeof window !== 'undefined' ? !!localStorage.getItem("original_token") : false;

  const mainBgClass = "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 min-h-screen";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 lg:ml-72 overflow-y-auto flex flex-col ${mainBgClass}`}>
        {/* Impersonate Banner */}
        {isImpersonating && (
          <div 
            onClick={stopImpersonate}
            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white text-center py-2 px-4 font-semibold text-sm animate-pulse transition-colors flex items-center justify-center gap-2 z-50 shadow-lg shadow-red-500/20"
          >
            <span>⚠️</span> Sedang Impersonate (Menyamar sebagai Klien). Klik untuk Keluar. <span>⚠️</span>
          </div>
        )}
        
        {/* Top Bar (Mobile Only) */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Mobile Page Title */}
            <div>
              {title && (
                <h1 className="text-xl font-bold text-white">{title}</h1>
              )}
            </div>
          </div>
          {/* Notification Bell (Mobile) */}
          <button className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-auto">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-slate-900 rounded-full"></span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Desktop Header Title */}
          <div className="hidden lg:flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center flex-wrap gap-y-2">
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                {titleExtra}
              </div>
              {subtitle && (
                <p className="text-slate-400 font-medium mt-2">{subtitle}</p>
              )}
            </div>
            {/* Notification Bell (Desktop) */}
            <button className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-6 h-6" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
