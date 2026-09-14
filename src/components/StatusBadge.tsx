import React from "react";

interface StatusBadgeProps {
  status: "connecting" | "live" | "ended" | "error";
  text?: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const config = {
    connecting: {
      bg: "bg-night-800 border-neon-orange/30",
      dot: "bg-neon-orange animate-pulse",
      text: text || "Bağlanıyor...",
      textColor: "text-neon-orange",
    },
    live: {
      bg: "bg-night-800 border-neon-green/30",
      dot: "bg-neon-green animate-ping",
      text: text || "Canlı Paylaşım",
      textColor: "text-neon-green",
    },
    ended: {
      bg: "bg-night-800 border-slate-700",
      dot: "bg-slate-500",
      text: text || "Paylaşım Sonlandırıldı",
      textColor: "text-slate-400",
    },
    error: {
      bg: "bg-red-950/50 border-red-500/30",
      dot: "bg-red-500",
      text: text || "Hata Oluştu",
      textColor: "text-red-400",
    },
  };

  const current = config[status];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${current.bg} ${current.textColor} shadow-md`}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75 animate-ping"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
      </span>
      <span>{current.text}</span>
    </div>
  );
}