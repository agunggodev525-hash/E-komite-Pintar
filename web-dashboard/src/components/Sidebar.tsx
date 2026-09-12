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
        className={`fixed top-0 left-0 z-50 h-full w-[260px] sm:w-72 glass-panel border-r border-slate-200/50 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/[0.06] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-blue-500/30">
              <img src="/logo.jpg" alt="Logo E-Komite" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                E-Komite Pintar
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-blue-400 tracking-wide uppercase mt-0.5">Dashboard SaaS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto sidebar-scroll">
          <p className="px-4 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
            const activeClasses = "bg-blue-50/80 dark:bg-blue-500/15 border-l-4 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400 font-bold rounded-r-xl rounded-l-none";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? activeClasses
                    : "rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {/* Background glow on hover for inactive */}
                {!isActive && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-gradient-to-r dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <span className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                
                <span className="relative z-10 tracking-wide">{item.label}</span>
                
                {isActive && (
                  <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse-glow-blue" />
                )}
              </Link>
            );
          })}

          {/* View-only indicator for SEKOLAH / KEPALA_SEKOLAH */}
          {user.role === "SEKOLAH" && (
            <div className="mt-4 mx-3 p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors">
              <p className="text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <span>🛡️</span> Mode Pengawas (View-Only)
              </p>
              <p className="text-[10px] text-rose-600/80 dark:text-white/60 mt-1 leading-relaxed">
                Anda hanya dapat memantau laporan. Akses penambahan atau pengubahan data dibatasi.
              </p>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 transition-colors shrink-0">
          <div className="border border-slate-100 dark:border-white/[0.06] rounded-2xl p-2 bg-white dark:bg-transparent shadow-sm">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/30 overflow-hidden shrink-0 shadow-sm">
                {user.foto_profil ? (
                  <img
                    src={user.foto_profil}
                    alt={user.nama_lengkap}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback ke inisial jika gambar gagal dimuat
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `${user.nama_lengkap.charAt(0).toUpperCase()}${user.nama_lengkap.charAt(1).toUpperCase()}`;
                    }}
                  />
                ) : (
                  <>{user.nama_lengkap.charAt(0).toUpperCase()}{user.nama_lengkap.charAt(1).toUpperCase()}</>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate transition-colors">
                  {user.nama_lengkap}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 dark:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/20 transition-all duration-200"
            >
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
