"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveMap from "@/components/LiveMap";
import { v4 as uuidv4 } from "uuid";
import { getPusherClient, getRoomChannelName, PUSHER_EVENTS } from "@/lib/pusher-client";
import StatusBadge from "@/components/StatusBadge";
import type { JoinResponsePayload, LatLngData } from "@/lib/types";


type ViewerStage =
  | "name-entry"
  | "waiting-approval"
  | "rejected"
  | "approved"
  | "ended"
  | "error";

export default function IzlePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = String(params?.id ?? "");

  const [viewerName, setViewerName] = useState("");
  const [stage, setStage] = useState<ViewerStage>("name-entry");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sharerLocation, setSharerLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);

  // Debug-only bypass: ?debug_map_test=1&lat=..&lng=.. jumps straight to the
  // real "approved" render path with a fixed location, so the actual
  // production LiveMap component can be visually verified from a single
  // page load without needing a second live browser to complete the
  // consent handshake. Runs in an effect (after hydration, exactly like a
  // normal state transition triggered by a real event) so it never causes a
  // server/client hydration mismatch. Has no effect unless the query param
  // is present.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("debug_map_test") === "1") {
      const lat = Number(sp.get("lat")) || 41.0082;
      const lng = Number(sp.get("lng")) || 28.9784;
      setSharerLocation({ lat, lng, accuracy: 25 });
      setStage("approved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const viewerIdRef = useRef<string>("");
  if (!viewerIdRef.current) {
    viewerIdRef.current = uuidv4();
  }

  const triggerEvent = useCallback(
    async (event: string, data: Record<string, unknown>) => {
      try {
        await fetch("/api/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, event, data }),
        });
      } catch (err) {
        console.error("Olay gönderilemedi:", err);
      }
    },
    [roomId]
  );

  // Subscribe to the room channel once we know the room id
  useEffect(() => {
    if (!roomId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(getRoomChannelName(roomId));

    channel.bind(PUSHER_EVENTS.JOIN_RESPONSE, (payload: JoinResponsePayload) => {
      if (payload.viewerId !== viewerIdRef.current) return;

      if (payload.approved) {
        setStage("approved");
      } else {
        setStage("rejected");
      }
    });

    channel.bind(PUSHER_EVENTS.LOCATION_UPDATE, (payload: LatLngData) => {
      setSharerLocation({ lat: payload.lat, lng: payload.lng, accuracy: payload.accuracy });
      setLastUpdate(payload.timestamp || Date.now());
    });

    channel.bind(PUSHER_EVENTS.SHARER_ENDED, () => {
      setStage("ended");
    });

    channel.bind("pusher:subscription_error", () => {
      setStage("error");
      setErrorMessage(
        "Gerçek zamanlı bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getRoomChannelName(roomId));
    };
  }, [roomId]);

  const handleSendRequest = () => {
    if (!roomId) return;
    setStage("waiting-approval");
    triggerEvent(PUSHER_EVENTS.JOIN_REQUEST, {
      viewerId: viewerIdRef.current,
      viewerName: viewerName.trim() || "Bir izleyici",
    });
  };

  const formattedLastUpdate = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <main className="flex w-full flex-1 flex-col px-4 py-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-night-700 bg-night-900 text-slate-300 active:scale-95"
        >
          ←
        </button>
        <h1 className="text-sm font-semibold text-white">Canlı Konum</h1>
        <div className="w-9" />
      </header>

      {stage === "name-entry" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-orange/30 bg-night-900 shadow-neon-orange">
            <span className="text-3xl">👋</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Konum Görüntüleme İsteği
            </h2>
            <p className="max-w-xs text-sm text-slate-400">
              Bu bağlantıyı paylaşan kişinin canlı konumunu görüntülemek için
              önce izin istemeniz gerekiyor.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <input
              type="text"
              value={viewerName}
              onChange={(e) => setViewerName(e.target.value)}
              placeholder="Adınız (isteğe bağlı)"
              maxLength={40}
              className="w-full rounded-xl border border-night-600 bg-night-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-green focus:outline-none"
            />
            <button
              onClick={handleSendRequest}
              className="w-full rounded-2xl bg-neon-orange py-4 text-base font-bold text-night-950 shadow-neon-orange transition-all hover:bg-neon-orangeDark active:scale-95"
            >
              İzin İsteği Gönder
            </button>
          </div>
        </div>
      )}

      {stage === "waiting-approval" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-orange/30 bg-night-900 shadow-neon-orange">
            <span className="animate-pulse text-3xl">⏳</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Onay Bekleniyor...
            </h2>
            <p className="max-w-xs text-sm text-slate-400">
              İsteğiniz gönderildi. Konumu paylaşan kişinin isteğinizi
              onaylaması bekleniyor.
            </p>
          </div>
          <StatusBadge status="connecting" text="Bekleniyor" />
        </div>
      )}

      {stage === "rejected" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-3xl">🚫</span>
          <h2 className="text-lg font-bold text-white">İstek Reddedildi</h2>
          <p className="max-w-xs text-sm text-slate-400">
            Konumu paylaşan kişi isteğinizi onaylamadı. Konumu
            görüntüleyemezsiniz.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full max-w-xs rounded-2xl border border-night-600 bg-night-900 py-3 text-sm font-semibold text-slate-300 active:scale-95"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )}

      {stage === "ended" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-3xl">🔚</span>
          <h2 className="text-lg font-bold text-white">Paylaşım Sona Erdi</h2>
          <p className="max-w-xs text-sm text-slate-400">
            Konumu paylaşan kişi paylaşımı sonlandırdı. Artık canlı konum
            görüntülenemiyor.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full max-w-xs rounded-2xl bg-neon-green py-3 text-sm font-bold text-night-950 shadow-neon-green active:scale-95"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )}

      {stage === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-white">Bir Sorun Oluştu</h2>
          <p className="max-w-xs text-sm text-red-300">
            {errorMessage || "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full max-w-xs rounded-2xl border border-night-600 bg-night-900 py-3 text-sm font-semibold text-slate-300 active:scale-95"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {stage === "approved" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <StatusBadge
              status="live"
              text={
                sharerLocation
                  ? `Canlı${formattedLastUpdate ? " · " + formattedLastUpdate : ""}`
                  : "Konum bekleniyor..."
              }
            />
          </div>

          <div
            className="mb-4 flex-1 overflow-hidden rounded-2xl"
            style={{ minHeight: "420px", height: "60vh", border: "3px solid red" }}
            data-debug-stage={stage}
            data-debug-has-location={String(!!sharerLocation)}
          >
            {sharerLocation ? (
              <LiveMap sharerLocation={sharerLocation} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-night-700 bg-night-900/60 text-center">
                <span className="animate-pulse text-3xl">📡</span>
                <p className="max-w-xs text-sm text-slate-400">
                  Onaylandı! Karşı tarafın ilk konum verisi bekleniyor...
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}