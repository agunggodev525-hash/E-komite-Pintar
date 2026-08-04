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
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
