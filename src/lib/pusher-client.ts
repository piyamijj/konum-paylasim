"use client";

import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

/**
 * Tarayıcı tarafında tek bir Pusher bağlantısı kullanmak için singleton.
 * Oda (room) kanallarına abone olmak için bu istemciyi kullanın.
 */
export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu";

    if (!key) {
      throw new Error(
        "NEXT_PUBLIC_PUSHER_KEY tanımlı değil. Lütfen .env dosyanızı kontrol edin."
      );
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
    });
  }

  return pusherClientInstance;
}

export function getRoomChannelName(roomId: string): string {
  return `room-${roomId}`;
}

export const PUSHER_EVENTS = {
  JOIN_REQUEST: "join-request",
  JOIN_RESPONSE: "join-response",
  LOCATION_UPDATE: "location-update",
  SHARER_ENDED: "sharer-ended",
} as const;