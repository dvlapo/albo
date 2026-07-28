import { api } from "./client";
import type { AlbumDetail, AlbumListItem } from "./types";

export const albumsApi = {
  list: () => api.get<AlbumListItem[]>("/albums").then((r) => r.data),
  get: (id: string) => api.get<AlbumDetail>(`/albums/${id}`).then((r) => r.data),
  create: (body: { title: string; description?: string }) => api.post<AlbumDetail>("/albums", body).then((r) => r.data),
  update: (id: string, body: { title?: string; description?: string; cover_photo_id?: string }) => api.patch<AlbumDetail>(`/albums/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/albums/${id}`).then((r) => r.data),
};
