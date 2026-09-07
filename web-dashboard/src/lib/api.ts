// ============================================
// API Client — Fetch wrapper dengan auth header
// ============================================

const API_BASE = "https://e-komite-pintar.onrender.com/api/v1";

/**
 * Fetch wrapper yang otomatis inject Bearer token.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data: T }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("ekomite_token")
      : null;

  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Cek apakah response adalah JSON sebelum di-parse
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!isJson) {
    // Server mengembalikan non-JSON (misal: "Not Found", HTML error page, dsb.)
    const textBody = await response.text().catch(() => "");
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "Layanan tidak ditemukan. Pastikan server backend aktif."
          : response.status === 502 || response.status === 503
          ? "Server sedang tidak tersedia. Silakan coba beberapa saat lagi."
          : `Server error (${response.status}): ${textBody || "Tidak ada respons."}`
      );
    }
    return { success: true, message: "OK", data: null as T };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data;
}

/**
 * Format angka ke Rupiah.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date ke format Indonesia.
 */
export function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
