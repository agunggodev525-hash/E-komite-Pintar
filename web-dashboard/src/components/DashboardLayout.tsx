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
  const { stopImpersonate } = useAuth();

  // Cek apakah ada original_token (artinya sedang impersonate)
  const isImpersonating = typeof window !== 'undefined' ? !!localStorage.getItem("original_token") : false;

  const mainBgClass = "bg-slate-50/50 dark:bg-transparent text-slate-900 dark:text-slate-200 min-h-screen transition-colors duration-300 relative z-10";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFF] dark:bg-[#050B14] relative">
      {/* Premium ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary cyan orb - top left */}
        <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] bg-blue-500/8 dark:bg-blue-500/[0.12] rounded-full blur-[100px] animate-pulse-glow-blue" />
        {/* Secondary violet orb - bottom right */}
        <div className="absolute bottom-[-15%] right-[-8%] w-[50%] h-[50%] bg-violet-500/8 dark:bg-violet-500/[0.10] rounded-full blur-[120px]" style={{ animationDelay: '1.5s' }} />
        {/* Accent gold orb - center */}
        <div className="hidden sm:block absolute top-[35%] left-[25%] w-[35%] h-[35%] bg-amber-500/5 dark:bg-amber-500/[0.07] rounded-full blur-[140px] animate-float-subtle" style={{ animationDelay: '3s' }} />
        {/* Subtle grid texture for dark mode */}
        <div className="hidden dark:block absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
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
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Desktop Header Title */}
          <div className="hidden lg:flex justify-between items-start mb-7">
            <div>
              <div className="flex items-center flex-wrap gap-y-2 gap-x-3">
                <h1 className="text-[1.75rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {title}
                </h1>
                {titleExtra}
              </div>
              {subtitle && (
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1.5 leading-relaxed">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationDropdown />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
