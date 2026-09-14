import { NextRequest, NextResponse } from "next/server";
import { getPusherServer, getRoomChannelName } from "@/lib/pusher-server";
import type { TriggerRequestBody } from "@/lib/types";

/**
 * Tek amaçlı olay tetikleme uç noktası.
 * İstemciler (paylaşan / izleyen) bu uç nokta üzerinden oda kanalına
 * (join-request, join-response, location-update, sharer-ended) olay gönderir.
 * Pusher gizli anahtarı yalnızca sunucuda kullanılır, istemciye asla sızmaz.
 */
export async function POST(request: NextRequest) {
  let body: TriggerRequestBody;

  try {
    body = (await request.json()) as TriggerRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const { roomId, event, data } = body;

  if (!roomId || !event) {
    return NextResponse.json(
      { error: "roomId ve event alanları zorunludur." },
      { status: 400 }
    );
  }

  const allowedEvents = [
    "join-request",
    "join-response",
    "location-update",
    "sharer-ended",
  ];

  if (!allowedEvents.includes(event)) {
    return NextResponse.json(
      { error: "Bilinmeyen olay türü." },
      { status: 400 }
    );
  }

  try {
    const pusherServer = getPusherServer();
    const channelName = getRoomChannelName(roomId);

    await pusherServer.trigger(channelName, event, data ?? {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pusher tetikleme hatası:", error);
    return NextResponse.json(
      {
        error:
          "Gerçek zamanlı sunucuya bağlanılamadı. Lütfen Pusher ortam değişkenlerinin doğru tanımlandığından emin olun.",
      },
      { status: 500 }
    );
  }
}