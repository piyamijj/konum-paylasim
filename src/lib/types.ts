export interface LatLngData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface JoinRequestPayload {
  viewerId: string;
  viewerName?: string;
}

export interface JoinResponsePayload {
  viewerId: string;
  approved: boolean;
}

export interface LocationUpdatePayload extends LatLngData {
  roomId: string;
}

export type RoomEvent =
  | "join-request"
  | "join-response"
  | "location-update"
  | "sharer-ended";

export interface TriggerRequestBody {
  roomId: string;
  event: RoomEvent;
  data: JoinRequestPayload | JoinResponsePayload | LatLngData | Record<string, never>;
}