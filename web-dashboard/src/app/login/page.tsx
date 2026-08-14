"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kredensial tidak valid. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white p-2 mb-6 flex items-center justify-center overflow-hidden ring-4 ring-white/50">
            <img 
              src="/logo.jpg" 
              alt="E-Komite Pintar Logo" 
              className="w-full h-full object-cover rounded-xl" 
              onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=EK&background=0F172A&color=fff&size=128&font-size=0.4' }} 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Selamat Datang 👋
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            Kelola administrasi dan keuangan komite sekolah dengan lebih mudah dan transparan.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="admin@sekolah.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-bold text-slate-700">Kata Sandi</label>
                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Lupa sandi?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
              >
                {isLoading || authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRight className="w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer / Demo Notes */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Informasi Kredensial Demo</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="px-4 py-2 bg-white/60 backdrop-blur-md text-slate-600 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <strong className="text-slate-800 font-bold">superadmin@ekomite.com</strong>
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-md text-slate-600 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <strong className="text-slate-800 font-bold">admin123</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
