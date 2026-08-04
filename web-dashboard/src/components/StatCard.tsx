"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// ============================================
// StatCard — Premium Enterprise Edition
// ============================================

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  title: string;
  trend?: string;
  isPositive?: boolean;
  accentClass?: string; // Tailwind text color class for value
  iconBgClass?: string; // Tailwind bg color class for icon
}

export default function StatCard({
  icon,
  value,
  title,
  trend = "+0% vs last month",
  isPositive = true,
  accentClass = "text-slate-800",
  iconBgClass = "bg-slate-50 text-slate-500",
}: StatCardProps) {
  
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative subtle gradient */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className={`text-3xl font-extrabold tracking-tight ${accentClass}`}>
            {value}
          </p>
        </div>
        
        {/* Ikon */}
        <div className={`w-12 h-12 rounded-2xl ${iconBgClass} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm ring-4 ring-white`}>
          {icon}
        </div>
      </div>
      
      {/* Tren / Sparkline */}
      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 relative z-10">
        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        </div>
        <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.split(' ')[0]}
        </span>
        <span className="text-xs font-medium text-slate-400">
          {trend.split(' ').slice(1).join(' ')}
        </span>
      </div>
      
    </div>
  );
}
