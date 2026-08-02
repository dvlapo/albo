import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voiceNotesApi } from "../../api/voice-notes";
import type { AlbumDetail, Photo, VoiceNote } from "../../api/types";
import { queryKeys } from "./keys";

type UploadVoiceNoteInput = {
    blob: Blob;
    durationSeconds: number;
    onProgress?: (percentage: number) => void;
};

export function useUploadAlbumVoiceNote(albumId: string) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            blob,
            durationSeconds,
            onProgress,
        }: UploadVoiceNoteInput) =>
            voiceNotesApi.uploadAlbum(
                albumId,
                blob,
                durationSeconds,
                onProgress,
            ),
        onSuccess: (voiceNote) => {
            client.setQueryData<AlbumDetail>(
                queryKeys.album(albumId),
                (album) =>
                    album ? { ...album, voiceNotes: [voiceNote] } : album,
            );
            client.invalidateQueries({ queryKey: queryKeys.album(albumId) });
        },
    });
}

export function useUploadPhotoVoiceNote(albumId: string, photoId: string) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            blob,
            durationSeconds,
            onProgress,
        }: UploadVoiceNoteInput) =>
            voiceNotesApi.uploadPhoto(
                photoId,
                blob,
                durationSeconds,
                onProgress,
            ),
        onSuccess: (voiceNote: VoiceNote) => {
            client.setQueryData<Photo[]>(queryKeys.photos(albumId), (photos) =>
                photos?.map((photo) =>
                    photo.id === photoId
                        ? { ...photo, voiceNotes: [voiceNote] }
                        : photo,
                ),
            );
            client.invalidateQueries({ queryKey: queryKeys.photos(albumId) });
        },
    });
}

export function useDeleteAlbumVoiceNote(albumId: string) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: voiceNotesApi.remove,
        onSuccess: (_result, voiceNoteId) => {
            client.setQueryData<AlbumDetail>(
                queryKeys.album(albumId),
                (album) =>
                    album
                        ? {
                              ...album,
                              voiceNotes: album.voiceNotes.filter(
                                  (note) => note.id !== voiceNoteId,
                              ),
                          }
                        : album,
            );
            client.invalidateQueries({ queryKey: queryKeys.album(albumId) });
        },
    });
}

export function useDeletePhotoVoiceNote(albumId: string, photoId: string) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: voiceNotesApi.remove,
        onSuccess: (_result, voiceNoteId) => {
            client.setQueryData<Photo[]>(queryKeys.photos(albumId), (photos) =>
                photos?.map((photo) =>
                    photo.id === photoId
                        ? {
                              ...photo,
                              voiceNotes: photo.voiceNotes?.filter(
                                  (note) => note.id !== voiceNoteId,
                              ),
                          }
                        : photo,
                ),
            );
            client.invalidateQueries({ queryKey: queryKeys.photos(albumId) });
        },
    });
}
