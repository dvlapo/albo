import { api } from "./client";
import type { CreatedShareLink, ShareLink } from "./types";

export const sharingApi = {
  create: (albumId: string, body: { passkey?: string; expires_at?: string }) => api.post<CreatedShareLink>(`/albums/${albumId}/share-links`, body).then((r) => r.data),
  list: (albumId: string) => api.get<ShareLink[]>(`/albums/${albumId}/share-links`).then((r) => r.data),
  revoke: (id: string) => api.delete<{ id: string; revokedAt: string }>(`/share-links/${id}`).then((r) => r.data),
};
