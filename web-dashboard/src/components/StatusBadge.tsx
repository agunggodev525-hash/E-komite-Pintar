// ============================================
// StatusBadge — Badge status pembayaran
// ============================================

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    LUNAS: {
      bg: "bg-status-lunas-bg",
      text: "text-status-lunas",
      label: "Lunas",
    },
    PENDING: {
      bg: "bg-status-pending-bg",
      text: "text-status-pending",
      label: "Pending",
    },
    DICICIL: {
      bg: "bg-status-pending-bg",
      text: "text-status-pending",
      label: "Dicicil",
    },
    GAGAL: {
      bg: "bg-status-gagal-bg",
      text: "text-status-gagal",
      label: "Gagal",
    },
    BELUM_BAYAR: {
      bg: "bg-status-gagal-bg",
      text: "text-status-gagal",
      label: "Belum Bayar",
    },
  };

  const { bg, text, label } = config[status] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border border-white/10 dark:border-white/5 backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-105 ${bg} ${text}`}
      style={{ textShadow: '0 0 8px currentColor' }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-2 animate-pulse shadow-[0_0_5px_currentColor]" style={{ backgroundColor: 'currentColor' }}></span>
      {label}
    </span>
  );
}
