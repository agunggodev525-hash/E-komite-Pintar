import type { UserRole } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Building2, 
  ShieldCheck, 
  Settings, 
  GraduationCap, 
  FileText, 
  PieChart,
  Banknote,
  Vote
} from "lucide-react";
import type { ReactNode } from "react";

// ============================================
// Navigation Config — RBAC Menu per Role
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode; 
  description?: string;
}

/**
 * Menu items berdasarkan role.
 * ADMIN_KOMITE  → full access
 * SEKOLAH       → view-only (Dashboard + Laporan)
 * SUPER_ADMIN   → full access
 */
const navigationConfig: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Ringkasan data" },
    { label: "Daftar Sekolah", href: "/dashboard/sekolah", icon: <Building2 className="w-5 h-5" />, description: "Manajemen Klien SaaS" },
    { label: "Log Sistem", href: "/dashboard/logs", icon: <ShieldCheck className="w-5 h-5" />, description: "Audit trail aktivitas" },
    { label: "Pengaturan Global", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" />, description: "Konfigurasi server SaaS" },
  ],
  ADMIN_KOMITE: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Ringkasan data" },
    { label: "Kelola Siswa", href: "/dashboard/siswa", icon: <GraduationCap className="w-5 h-5" />, description: "Data siswa" },
    { label: "Tagihan & Pemasukan", href: "/dashboard/tagihan", icon: <FileText className="w-5 h-5" />, description: "Kelola tagihan" },
    { label: "Catat Pengeluaran", href: "/dashboard/pengeluaran", icon: <Banknote className="w-5 h-5" />, description: "Catat kas keluar" },
    { label: "Kelola E-Voting", href: "/dashboard/voting", icon: <Vote className="w-5 h-5" />, description: "Pemilihan online" },
    { label: "Laporan Kas", href: "/dashboard/laporan", icon: <PieChart className="w-5 h-5" />, description: "Laporan keuangan" },
  ],
  SEKOLAH: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Ringkasan data" },
    { label: "Laporan", href: "/dashboard/laporan", icon: <PieChart className="w-5 h-5" />, description: "Laporan keuangan" },
  ],
  KEPALA_SEKOLAH: [
    { label: "Dashboard Eksekutif", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Ringkasan eksekutif" },
    { label: "Pantau Arus Kas", href: "/dashboard/laporan", icon: <PieChart className="w-5 h-5" />, description: "Laporan arus kas" },
    { label: "Laporan Tunggakan", href: "/dashboard/tunggakan", icon: <FileText className="w-5 h-5" />, description: "Data tunggakan" },
  ],
  ORANG_TUA: [
    { label: "Tagihan Saya", href: "/dashboard", icon: <FileText className="w-5 h-5" />, description: "Daftar tagihan anak" },
  ],
};

/**
 * Ambil menu items berdasarkan role user.
 */
export function getNavigationItems(role: UserRole): NavItem[] {
  return navigationConfig[role] || [];
}
