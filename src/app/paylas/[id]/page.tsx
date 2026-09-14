"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveMap from "@/components/LiveMap";
import { getPusherClient, getRoomChannelName, PUSHER_EVENTS } from "@/lib/pusher-client";
import ConsentModal from "@/components/ConsentModal";
import StatusBadge from "@/components/StatusBadge";
import type { JoinRequestPayload } from "@/lib/types";


interface PendingRequest {
  viewerId: string;
  viewerName: string;
}

export default function PaylasPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = String(params?.id ?? "");

  const [permissionState, setPermissionState] = useState<
    "idle" | "requesting" | "granted" | "denied" | "error"
  >("idle");
  const [sharerLocation, setSharerLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [approvedViewers, setApprovedViewers] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [sharingEnded, setSharingEnded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const requestQueueRef = useRef<PendingRequest[]>([]);

  const shareUrl =
    typeof window !== "undefined" && roomId
      ? `${window.location.origin}/izle/${roomId}`
      : "";

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

  const processNextRequest = useCallback(() => {
    if (requestQueueRef.current.length > 0) {
      const next = requestQueueRef.current.shift() as PendingRequest;
      setPendingRequest(next);
    } else {
      setPendingRequest(null);
    }
  }, []);

  // Subscribe to Pusher channel for join requests
  useEffect(() => {
    if (!roomId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(getRoomChannelName(roomId));

    channel.bind(PUSHER_EVENTS.JOIN_REQUEST, (payload: JoinRequestPayload) => {
      const incoming: PendingRequest = {
        viewerId: payload.viewerId,
        viewerName: payload.viewerName || "Bir izleyici",
      };

      setApprovedViewers((prev) => {
        if (prev.has(incoming.viewerId)) {
          // Already approved before, re-approve silently so viewer reconnects
          triggerEvent(PUSHER_EVENTS.JOIN_RESPONSE, {
            viewerId: incoming.viewerId,
            approved: true,
          });
          return prev;
        }
        return prev;
      });

      setPendingRequest((current) => {
        if (current) {
          requestQueueRef.current.push(incoming);
          return current;
        }
        return incoming;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getRoomChannelName(roomId));
    };
  }, [roomId, triggerEvent]);

  // Start geolocation tracking
  const startTracking = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionState("error");
      setErrorMessage("Tarayıcınız konum servislerini desteklemiyor.");
      return;
    }

    setPermissionState("requesting");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setPermissionState("granted");
        setSharerLocation({ lat: latitude, lng: longitude, accuracy });

        triggerEvent(PUSHER_EVENTS.LOCATION_UPDATE, {
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: Date.now(),
        });
      },
      (error) => {
        console.error("Konum hatası:", error);
        setPermissionState("denied");
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage(
            "Konum izni reddedildi. Paylaşımı başlatmak için tarayıcı ayarlarından konum iznini etkinleştirin."
          );
        } else {
          setErrorMessage("Konumunuz alınamadı. Lütfen tekrar deneyin.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      }
    );
  }, [triggerEvent]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleApprove = () => {
    if (!pendingRequest) return;
    const { viewerId } = pendingRequest;
    setApprovedViewers((prev) => new Set(prev).add(viewerId));
    triggerEvent(PUSHER_EVENTS.JOIN_RESPONSE, { viewerId, approved: true });

    // Immediately send current location if available so the viewer sees it right away
    if (sharerLocation) {
      triggerEvent(PUSHER_EVENTS.LOCATION_UPDATE, {
        ...sharerLocation,
        timestamp: Date.now(),
      });
    }
    processNextRequest();
  };

  const handleReject = () => {
    if (!pendingRequest) return;
    triggerEvent(PUSHER_EVENTS.JOIN_RESPONSE, {
      viewerId: pendingRequest.viewerId,
      approved: false,
    });
    processNextRequest();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setErrorMessage("Bağlantı kopyalanamadı. Lütfen manuel olarak kopyalayın.");
    }
  };

  const handleEndSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    triggerEvent(PUSHER_EVENTS.SHARER_ENDED, {});
    setSharingEnded(true);
    setPermissionState("idle");
  };

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
        <h1 className="text-sm font-semibold text-white">Konum Paylaşıyorsunuz</h1>
        <div className="w-9" />
      </header>

      {/* Status */}
      <div className="mb-4 flex items-center justify-between">
        {sharingEnded ? (
          <StatusBadge status="ended" />
        ) : permissionState === "granted" ? (
          <StatusBadge status="live" text={`Canlı · ${approvedViewers.size} izleyici`} />
        ) : permissionState === "error" || permissionState === "denied" ? (
          <StatusBadge status="error" text="İzin Gerekli" />
        ) : (
          <StatusBadge status="connecting" text="Konum bekleniyor..." />
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {!sharingEnded && permissionState === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-green/30 bg-night-900 shadow-neon-green">
            <span className="text-3xl">📍</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Konumunuzu Paylaşın</h2>
            <p className="max-w-xs text-sm text-slate-400">
              Devam etmek için tarayıcınızın konum izni istemesine izin verin.
              Konumunuz yalnızca onayladığınız kişilerle paylaşılır.
            </p>
          </div>
          <button
            onClick={startTracking}
            className="w-full max-w-xs rounded-2xl bg-neon-green py-4 text-base font-bold text-night-950 shadow-neon-green transition-all hover:bg-neon-greenDark active:scale-95"
          >
            Konum İznini Ver ve Başlat
          </button>
        </div>
      )}

      {!sharingEnded && (permissionState === "requesting" || permissionState === "granted") && (
        <>
          {/* Share link box */}
          <div className="mb-4 rounded-xl border border-night-700 bg-night-900/70 p-3">
            <p className="mb-2 text-[11px] text-slate-400">
              Bu bağlantıyı paylaşın, açan kişi sizden izin isteyecek:
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 truncate rounded-lg border border-night-600 bg-night-950 px-3 py-2 text-[11px] text-slate-300"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 rounded-lg bg-neon-orange px-3 py-2 text-[11px] font-semibold text-night-950 shadow-neon-orange active:scale-95"
              >
                {copyFeedback ? "Kopyalandı ✓" : "Kopyala"}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="mb-4 flex-1 overflow-hidden rounded-2xl" style={{ minHeight: "320px", height: "55vh" }}>
            <LiveMap sharerLocation={sharerLocation} isSharer />
          </div>

          <button
            onClick={handleEndSharing}
            className="w-full rounded-2xl border border-red-500/30 bg-red-950/30 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/50 active:scale-95"
          >
            Paylaşımı Sonlandır
          </button>
        </>
      )}

      {sharingEnded && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-3xl">✅</span>
          <h2 className="text-lg font-bold text-white">Paylaşım Sonlandırıldı</h2>
          <p className="max-w-xs text-sm text-slate-400">
            Konum paylaşımınız durduruldu. İzleyiciler artık konumunuzu göremez.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full max-w-xs rounded-2xl bg-neon-green py-3 text-sm font-bold text-night-950 shadow-neon-green active:scale-95"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )}

      <ConsentModal
        isOpen={pendingRequest !== null}
        viewerName={pendingRequest?.viewerName ?? ""}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </main>
  );
}