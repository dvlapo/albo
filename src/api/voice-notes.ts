import { api } from "./client";
import type { VoiceNote } from "./types";
import { uploadPercentage } from "../types/uploads";

function normalizeAudioBlob(blob: Blob) {
    if (blob.type.startsWith("audio/")) {
        return blob;
    }

    // MediaRecorder can return an audio-only WebM recording as video/webm.
    return new Blob([blob], {
        type: "audio/webm",
    });
}

function extensionFor(type: string) {
    if (type.includes("ogg")) return "ogg";
    if (type.includes("mpeg")) return "mp3";
    if (type.includes("mp4") || type.includes("m4a")) return "m4a";
    if (type.includes("wav")) return "wav";
    return "webm";
}

function formFor(blob: Blob, durationSeconds: number) {
    const audio = normalizeAudioBlob(blob);
    const form = new FormData();

    form.append("file", audio, `albo-note.${extensionFor(audio.type)}`);

    form.append(
        "duration_seconds",
        String(Math.max(0, Math.round(durationSeconds))),
    );

    return form;
}

export const voiceNotesApi = {
    uploadAlbum: (
        albumId: string,
        blob: Blob,
        durationSeconds: number,
        onProgress?: (percentage: number) => void,
    ) => {
        const form = formFor(blob, durationSeconds);

        return api
            .post<VoiceNote>(
                `/albums/${albumId}/voice-note`,
                form,
                {
                    onUploadProgress: ({ loaded, total }) =>
                        onProgress?.(uploadPercentage(loaded, total) ?? -1),
                },
            )
            .then((response) => response.data);
    },

    uploadPhoto: (
        photoId: string,
        blob: Blob,
        durationSeconds: number,
        onProgress?: (percentage: number) => void,
    ) => {
        const form = formFor(blob, durationSeconds);

        return api
            .post<VoiceNote>(
                `/photos/${photoId}/voice-note`,
                form,
                {
                    onUploadProgress: ({ loaded, total }) =>
                        onProgress?.(uploadPercentage(loaded, total) ?? -1),
                },
            )
            .then((response) => response.data);
    },

    remove: (id: string) =>
        api
            .delete<void>(`/voice-notes/${id}`)
            .then((response) => response.data),
};
