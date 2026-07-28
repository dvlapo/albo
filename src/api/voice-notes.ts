import { api } from "./client";
import type { VoiceNote } from "./types";

function formFor(file: Blob, durationSeconds: number) {
  const form = new FormData();
  form.append("file", file, `albo-note.${file.type.includes("ogg") ? "ogg" : "webm"}`);
  form.append("duration_seconds", String(Math.round(durationSeconds)));
  return form;
}

export const voiceNotesApi = {
  uploadPhoto: (photoId: string, file: Blob, duration: number) => api.post<VoiceNote>(`/photos/${photoId}/voice-note`, formFor(file, duration)).then((r) => r.data),
  uploadAlbum: (albumId: string, file: Blob, duration: number) => api.post<VoiceNote>(`/albums/${albumId}/voice-note`, formFor(file, duration)).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/voice-notes/${id}`).then((r) => r.data),
};
