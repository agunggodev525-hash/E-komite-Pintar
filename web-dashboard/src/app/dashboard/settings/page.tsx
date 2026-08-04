"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    midtrans_client_key: "",
    midtrans_server_key: "",
    wa_api_token: "",
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch<any>("/superadmin/settings");
      if (res.success && res.data) {
        setFormData({
          midtrans_client_key: res.data.midtrans_client_key || "",
          midtrans_server_key: res.data.midtrans_server_key || "",
          wa_api_token: res.data.wa_api_token || "",
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Gagal memuat pengaturan sistem." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      const res = await apiFetch("/superadmin/settings", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" });
      } else {
        setMessage({ type: "error", text: res.message || "Gagal menyimpan." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan sistem." });
    } finally {
      setIsSaving(false);
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <DashboardLayout title="Pengaturan Global (SaaS)" subtitle="Konfigurasi API Pihak Ketiga">
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border ${
          message.type === 'error' 
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="text-white-60 text-center py-8">Memuat konfigurasi...</div>
      ) : (
        <div className="bg-navy-800 rounded-2xl border border-white-10 overflow-hidden shadow-2xl max-w-3xl">
          <div className="p-6 border-b border-white-10 bg-navy-900/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-gold-400">⚙️</span> API Integrations
            </h2>
            <p className="text-sm text-white-60 mt-1">
              Kunci API ini digunakan secara global untuk seluruh transaksi dan notifikasi tenant.
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            {/* Payment Gateway Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Midtrans Payment Gateway</h3>
              
              <div>
                <label className="block text-sm font-medium text-white-80 mb-2">
                  Client Key (Public)
                </label>
                <input
                  type="text"
                  name="midtrans_client_key"
                  value={formData.midtrans_client_key}
                  onChange={handleChange}
                  className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-mono text-sm"
                  placeholder="SB-Mid-client-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white-80 mb-2">
                  Server Key (Secret)
                </label>
                <input
                  type="password"
                  name="midtrans_server_key"
                  value={formData.midtrans_server_key}
                  onChange={handleChange}
                  className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-mono text-sm"
                  placeholder="SB-Mid-server-..."
                />
              </div>
            </div>

            <hr className="border-white-10" />

            {/* Notification Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">WhatsApp Notification (Fonnte/Wablas)</h3>
              
              <div>
                <label className="block text-sm font-medium text-white-80 mb-2">
                  API Token
                </label>
                <input
                  type="password"
                  name="wa_api_token"
                  value={formData.wa_api_token}
                  onChange={handleChange}
                  className="w-full bg-navy-900 border border-white-10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-mono text-sm"
                  placeholder="Masukkan token API WhatsApp"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? "Menyimpan..." : "💾 Simpan Konfigurasi"}
              </button>
            </div>

          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
