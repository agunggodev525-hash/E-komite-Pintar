"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleLogin = () => {
    setError("Fitur login dengan Google saat ini sedang dalam pengembangan.");
  };

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
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-[#F4F7FF]">
      
      {/* Background Art */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex">
        {/* Deep Blue Left Curve */}
        <div className="absolute top-[-30%] left-[-20%] w-[140%] md:w-[70%] h-[160%] bg-gradient-to-br from-[#0A1845] via-[#132C76] to-[#1F46BB] rounded-[0_100%_100%_0] shadow-[0_0_100px_rgba(31,70,187,0.2)] transform -rotate-3 transition-transform duration-700 ease-out">
          
          {/* Subtle light leak on the blue */}
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px]"></div>
          
          {/* Faint School Icon / Pattern (Abstract replacement) */}
          <div className="absolute top-1/2 left-[40%] -translate-y-1/2 -translate-x-1/2 opacity-[0.03] scale-150">
             <svg width="400" height="400" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 9L3 10.09V21H21V10.09L23 9L12 3ZM12 5.18L18.42 8.68L12 12.18L5.58 8.68L12 5.18ZM19 19H14V14H10V19H5V11.18L12 15L19 11.18V19Z" />
             </svg>
          </div>
        </div>

        {/* Right side glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-white blur-[120px] mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 blur-[120px] mix-blend-multiply"></div>

        {/* Dots Left (White) */}
        <div className="absolute top-12 left-12 grid grid-cols-4 gap-2.5 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={`dot-l-${i}`} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>

        {/* Dots Right (Gray) */}
        <div className="absolute top-[30%] right-12 grid grid-cols-4 gap-2.5 opacity-[0.15] hidden md:grid">
          {[...Array(16)].map((_, i) => (
            <div key={`dot-r-${i}`} className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 pt-12 md:pt-6">
        
        {/* Header Section */}
        <div className="text-center mb-8 flex flex-col items-center max-w-[500px]">
          <div className="w-[88px] h-[88px] mb-5 bg-white rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-1.5 border border-slate-100 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src="/logo.jpg" 
              alt="E-Komite Pintar Logo" 
              className="w-full h-full object-contain rounded-2xl" 
              onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=EK&background=0F172A&color=fff&size=128&font-size=0.4' }} 
            />
          </div>
          <h1 className="text-3xl md:text-[32px] font-extrabold text-slate-900 tracking-tight mb-3">
            Selamat datang kembali <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
          </h1>
          <p className="text-slate-600/90 text-[15px] leading-relaxed px-4 font-medium">
            Kelola administrasi dan keuangan komite sekolah dengan mudah, aman, dan transparan.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="w-full max-w-[440px] bg-white rounded-[28px] p-8 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white relative">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-800 ml-1">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="kepalasekolah@mtsalasror.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 text-[15px] placeholder:text-slate-400 focus:bg-white focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[13px] font-bold text-slate-800">Kata Sandi</label>
                <button type="button" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || authLoading}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 text-[15px] placeholder:text-slate-400 focus:bg-white focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50 font-medium tracking-wide"
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

            {/* Remember Me */}
            <div className="flex items-center ml-1 pt-1 pb-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-[5px] border-slate-300 text-blue-600 focus:ring-blue-600 bg-slate-50 cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-slate-600 font-medium cursor-pointer">
                  Ingat saya
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-[14px] px-4 bg-[#3B5FE4] hover:bg-[#3252CA] text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(59,95,228,0.25)] hover:shadow-[0_10px_25px_rgba(59,95,228,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2.5 group relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {isLoading || authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-[15px]">Masuk ke E Komite Pintar</span>
                    <ArrowRight className="w-5 h-5 opacity-90 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400 font-medium text-[13px]">atau</span>
              </div>
            </div>

            {/* Google Login */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-[14px] px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-[15px]">Lanjutkan dengan Google</span>
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3 items-start">
            <div className="bg-blue-50 p-2 rounded-[12px] mt-0.5 text-blue-600 shrink-0">
              <ShieldCheck className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800 leading-tight">Data Anda aman dan terlindungi</p>
              <p className="text-[12px] text-slate-500 mt-1 font-medium leading-tight">Kami menggunakan enkripsi tingkat tinggi</p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 pt-4 text-center">
        <p className="text-[13px] font-semibold text-slate-500 mb-2.5">
          © 2026 E Komite Pintar
        </p>
        <div className="flex justify-center gap-4 text-[13px] font-bold text-blue-600">
          <a href="#" className="hover:text-blue-800 transition-colors">Bantuan</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-blue-800 transition-colors">Privasi</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-blue-800 transition-colors">Ketentuan</a>
        </div>
      </div>
      
    </div>
  );
}
