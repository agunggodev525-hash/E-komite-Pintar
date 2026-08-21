"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// ============================================
// Types
// ============================================

export type UserRole = "SUPER_ADMIN" | "ADMIN_KOMITE" | "ORANG_TUA" | "SEKOLAH";

export interface User {
  id: string;
  nama_lengkap: string;
  email: string;
  no_whatsapp?: string;
  role: UserRole;
  status: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => void;
  impersonate: (token: string, user: User) => void;
  stopImpersonate: () => void;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session dari localStorage saat mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("ekomite_token");
      const savedUser = localStorage.getItem("ekomite_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // localStorage tidak tersedia atau data corrupt
      localStorage.removeItem("ekomite_token");
      localStorage.removeItem("ekomite_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const API_BASE = "https://e-komite-pintar.onrender.com/api/v1";

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login gagal");
      }

      const loginData = data.data;

      // Hanya ADMIN_KOMITE dan SEKOLAH yang boleh akses dashboard web
      const allowedRoles: UserRole[] = [
        "SUPER_ADMIN",
        "ADMIN_KOMITE",
        "SEKOLAH",
      ];
      if (!allowedRoles.includes(loginData.user.role)) {
        throw new Error(
          `Dashboard hanya untuk Admin dan Sekolah. Role Anda: ${loginData.user.role}`
        );
      }

      // Simpan ke state dan localStorage
      setToken(loginData.token);
      setUser(loginData.user);
      localStorage.setItem("ekomite_token", loginData.token);
      localStorage.setItem("ekomite_user", JSON.stringify(loginData.user));

      router.push("/dashboard");
    },
    [router]
  );

  const loginWithGoogle = useCallback(
    async (accessToken: string) => {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://e-komite-pintar.onrender.com/api/v1";

      const response = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login dengan Google gagal");
      }

      const loginData = data.data;

      // Hanya ADMIN_KOMITE dan SEKOLAH yang boleh akses dashboard web
      const allowedRoles: UserRole[] = [
        "SUPER_ADMIN",
        "ADMIN_KOMITE",
        "SEKOLAH",
      ];
      if (!allowedRoles.includes(loginData.user.role)) {
        throw new Error(
          `Dashboard web hanya untuk Admin dan Sekolah. Role Anda: ${loginData.user.role}. Silakan gunakan aplikasi Android.`
        );
      }

      // Simpan ke state dan localStorage
      setToken(loginData.token);
      setUser(loginData.user);
      localStorage.setItem("ekomite_token", loginData.token);
      localStorage.setItem("ekomite_user", JSON.stringify(loginData.user));

      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ekomite_token");
    localStorage.removeItem("ekomite_user");
    localStorage.removeItem("original_token");
    localStorage.removeItem("original_user");
    router.push("/login");
  }, [router]);

  const impersonate = useCallback((newToken: string, newUser: User) => {
    // Simpan identitas super admin ke memori asli
    if (!localStorage.getItem("original_token")) {
      localStorage.setItem("original_token", localStorage.getItem("ekomite_token") || "");
      localStorage.setItem("original_user", localStorage.getItem("ekomite_user") || "");
    }
    
    // Timpa identitas saat ini dengan klien
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("ekomite_token", newToken);
    localStorage.setItem("ekomite_user", JSON.stringify(newUser));
    
    // Redirect ke dasbor klien
    router.push("/dashboard");
  }, [router]);

  const stopImpersonate = useCallback(() => {
    const origToken = localStorage.getItem("original_token");
    const origUser = localStorage.getItem("original_user");
    
    if (origToken && origUser) {
      setToken(origToken);
      setUser(JSON.parse(origUser));
      localStorage.setItem("ekomite_token", origToken);
      localStorage.setItem("ekomite_user", origUser);
      
      localStorage.removeItem("original_token");
      localStorage.removeItem("original_user");
      
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        loginWithGoogle,
        logout,
        impersonate,
        stopImpersonate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
