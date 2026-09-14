"use client";

import React from "react";

interface ConsentModalProps {
  isOpen: boolean;
  viewerName: string;
  onApprove: () => void;
  onReject: () => void;
}

export default function ConsentModal({
  isOpen,
  viewerName,
  onApprove,
  onReject,
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-pulse-slow rounded-2xl border border-neon-green/30 bg-night-900 p-6 shadow-neon-green">
        <div className="flex flex-col items-center text-center">
          {/* WhatsApp-style green icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neon-green/10 text-neon-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-lg font-bold text-white">
            Konum İzleme İsteği
          </h3>
          <p className="mb-6 text-sm text-slate-300">
            <span className="font-semibold text-neon-green">
              {viewerName || "Bir izleyici"}
            </span>{" "}
            canlı konumunuzu görmek istiyor. Onaylıyor musunuz?
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onReject}
              className="flex-1 rounded-xl border border-slate-700 bg-night-800 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-night-700 active:scale-95"
            >
              Reddet
            </button>
            <button
              onClick={onApprove}
              className="flex-1 rounded-xl bg-neon-green py-3 text-sm font-bold text-night-950 transition-all hover:bg-neon-greenDark shadow-neon-green active:scale-95"
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}