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
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kredensial tidak valid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gold-100/40 blur-3xl"></div>
      </div>

      <div className="w-full max-w-[440px] px-6 relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6 flex items-center justify-center overflow-hidden">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=EK&background=0F172A&color=fff' }} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Masuk ke portal E-Komite Pintar
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Akun</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="admin@sekolah.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Lupa sandi?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all disabled:opacity-50"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
              >
                {isLoading || authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer / Demo Notes */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">Informasi Kredensial Demo:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
            <span className="px-3 py-1.5 bg-slate-200/50 text-slate-600 rounded-lg border border-slate-200">
              <strong className="text-slate-700">Super Admin:</strong> superadmin@ekomite.com
            </span>
            <span className="px-3 py-1.5 bg-slate-200/50 text-slate-600 rounded-lg border border-slate-200">
              <strong className="text-slate-700">Sandi:</strong> admin123
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
