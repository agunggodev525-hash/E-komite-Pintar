"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "./NotificationDropdown";

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

  const mainBgClass = "bg-slate-50/50 dark:bg-transparent text-slate-900 dark:text-slate-200 min-h-screen transition-colors duration-300 relative z-10";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#050B14] relative">
      {/* Futuristic abstract glowing background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[30%] sm:w-[50%] h-[30%] sm:h-[50%] bg-cyan-neon/10 dark:bg-cyan-neon/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] sm:w-[60%] h-[40%] sm:h-[60%] bg-magenta-neon/10 dark:bg-magenta-neon/20 rounded-full blur-[100px] sm:blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="hidden sm:block absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[100px] animate-float-subtle" />
      </div>

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
        <header className="lg:hidden sticky top-0 z-30 bg-white/70 dark:bg-[#050B14]/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center transition-colors">
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
              )}
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {/* Notification Bell (Mobile) */}
            <NotificationDropdown isMobile={true} />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header Title */}
          <div className="hidden lg:flex justify-between items-start mb-6 lg:mb-8">
            <div>
              <div className="flex items-center flex-wrap gap-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {titleExtra}
              </div>
              {subtitle && (
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* Notification Bell (Desktop) */}
              <NotificationDropdown />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
