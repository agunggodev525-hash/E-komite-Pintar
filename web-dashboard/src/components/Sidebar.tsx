"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getNavigationItems } from "@/config/navigation";

// ============================================
// Sidebar Navigation
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = getNavigationItems(user.role);
  const roleLabel =
    user.role === "ADMIN_KOMITE"
      ? "Admin Komite"
      : user.role === "SEKOLAH"
        ? "Sekolah"
          : user.role === "SUPER_ADMIN"
            ? "Super Admin"
            : user.role;

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 glass-panel border-r border-slate-200/50 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/15 flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="Logo E-Komite" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                E-Komite Pintar
              </h1>
              <p className="text-xs text-slate-500 dark:text-white/40 transition-colors">Dashboard SaaS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
            const activeClasses = "bg-[#E6F2ED] dark:bg-cyan-neon/15 dark:border-l-4 dark:neon-border-cyan text-[#2C7A6B] dark:neon-text-cyan font-bold";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? activeClasses
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {/* Background glow on hover for inactive */}
                {!isActive && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-gradient-to-r dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <span className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-gold-300'}`}>
                  {item.icon}
                </span>
                
                <span className="relative z-10 tracking-wide">{item.label}</span>
                
                {isActive && (
                  <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse-glow" />
                )}
              </Link>
            );
          })}

          {/* View-only indicator for SEKOLAH / KEPALA_SEKOLAH */}
          {user.role === "SEKOLAH" && (
            <div className="mt-4 mx-3 p-3 bg-red-900/30 rounded-lg border border-red-500/20">
              <p className="text-xs text-red-400 font-bold flex items-center gap-1.5">
                <span>🛡️</span> Mode Pengawas (View-Only)
              </p>
              <p className="text-[10px] text-white-40 mt-1 leading-relaxed">
                Anda hanya dapat memantau laporan. Akses penambahan atau pengubahan data dibatasi.
              </p>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 transition-colors">
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-2 bg-white dark:bg-transparent shadow-sm">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-[#A3C8B8] dark:bg-cyan-neon/20 flex items-center justify-center text-sm font-bold text-[#2C7A6B] dark:neon-text-cyan dark:border dark:border-cyan-neon/30">
                {user.nama_lengkap.charAt(0).toUpperCase()}{user.nama_lengkap.charAt(1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate transition-colors">
                  {user.nama_lengkap}
                </p>
                <p className="text-xs text-slate-500 dark:text-gold-400">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#7A363D] text-white hover:bg-[#602930] dark:bg-transparent dark:text-white/60 dark:hover:bg-status-gagal-bg dark:hover:text-status-gagal transition-all duration-200"
            >
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
