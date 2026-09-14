"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const router = useRouter();

  const handleStartSharing = () => {
    const roomId = uuidv4();
    router.push(`/paylas/${roomId}`);
  };

  return (
    <main className="flex min-h-screen w-full flex-1 flex-col items-center justify-between px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        {/* Logo / Icon */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-neon-green/30 bg-night-900 shadow-neon-green">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-12 w-12 text-neon-green"
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
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-night-950 bg-neon-orange text-[10px] font-bold text-night-950">
            •
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Konum Paylaşım
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            Gerçek zamanlı konumunuzu güvenli ve onaya dayalı bir şekilde
            paylaşın. Konumunuzu yalnızca onayladığınız kişiler görebilir.
          </p>
        </div>

        {/* Feature list */}
        <div className="mt-4 flex w-full max-w-xs flex-col gap-3 text-left">
          <div className="flex items-center gap-3 rounded-xl border border-night-700 bg-night-900/60 px-4 py-3">
            <span className="text-lg">🔗</span>
            <span className="text-xs text-slate-300">
              Tek tıkla benzersiz paylaşım bağlantısı oluşturun
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-night-700 bg-night-900/60 px-4 py-3">
            <span className="text-lg">✅</span>
            <span className="text-xs text-slate-300">
              İzleyici isteklerini siz onaylarsınız
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-night-700 bg-night-900/60 px-4 py-3">
            <span className="text-lg">📍</span>
            <span className="text-xs text-slate-300">
              Canlı harita üzerinde anlık konum takibi
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={handleStartSharing}
          className="w-full rounded-2xl bg-neon-green py-4 text-base font-bold text-night-950 shadow-neon-green transition-all hover:bg-neon-greenDark active:scale-95"
        >
          Konum Paylaşmaya Başla
        </button>
        <p className="text-center text-[11px] text-slate-500">
          Devam ederek konum bilginizin, oluşturduğunuz bağlantıyı açan ve
          sizin onayladığınız kişilerle paylaşılacağını kabul edersiniz.
        </p>
      </div>
    </main>
  );
}