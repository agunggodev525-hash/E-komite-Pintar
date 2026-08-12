// ============================================
// StatusBadge — Badge status pembayaran
// ============================================

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    LUNAS: {
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-800 dark:text-emerald-400",
      label: "Lunas",
    },
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-800 dark:text-amber-400",
      label: "Pending",
    },
    DICICIL: {
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-800 dark:text-amber-400",
      label: "Dicicil",
    },
    GAGAL: {
      bg: "bg-rose-100 dark:bg-rose-900/40",
      text: "text-rose-800 dark:text-rose-400",
      label: "Gagal",
    },
    BELUM_BAYAR: {
      bg: "bg-rose-100 dark:bg-rose-900/40",
      text: "text-rose-800 dark:text-rose-400",
      label: "Belum Bayar",
    },
  };

  const { bg, text, label } = config[status] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
