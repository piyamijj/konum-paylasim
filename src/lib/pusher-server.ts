import PusherServer from "pusher";

let pusherServerInstance: PusherServer | null = null;

/**
 * Sunucu tarafında Pusher olayları tetiklemek için kullanılan
 * tekil (singleton) Pusher istemcisi.
 *
 * Gerekli ortam değişkenleri:
 * - PUSHER_APP_ID
 * - NEXT_PUBLIC_PUSHER_KEY
 * - PUSHER_SECRET
 * - NEXT_PUBLIC_PUSHER_CLUSTER
 */
export function getPusherServer(): PusherServer {
  if (pusherServerInstance) {
    return pusherServerInstance;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      "Pusher ortam değişkenleri eksik. Lütfen PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET ve NEXT_PUBLIC_PUSHER_CLUSTER değerlerini tanımlayın."
    );
  }

  pusherServerInstance = new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServerInstance;
}

export function getRoomChannelName(roomId: string): string {
  return `room-${roomId}`;
}