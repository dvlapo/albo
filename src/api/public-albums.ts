import { publicApi } from "./client";
import type { PublicAlbum } from "./types";

export const publicAlbumsApi = {
  verify: (token: string, passkey?: string) => publicApi.post<{ guest_session_token: string }>(`/public/albums/${token}/verify`, passkey ? { passkey } : {}).then((r) => r.data),
  get: (token: string, guestToken: string) => publicApi.get<PublicAlbum>(`/public/albums/${token}`, { headers: { Authorization: `Bearer ${guestToken}` } }).then((r) => r.data),
};
