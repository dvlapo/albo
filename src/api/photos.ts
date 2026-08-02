import { api } from "./client";
import type { Photo } from "./types";
import { uploadPercentage } from "../types/uploads";

export const photosApi = {
    list: (albumId: string) =>
        api.get<Photo[]>(`/albums/${albumId}/photos`).then((r) => r.data),
    upload: (
        albumId: string,
        file: File,
        onProgress?: (value: number) => void,
    ) => {
        const form = new FormData();
        form.append("file", file);
        return api
            .post<Photo>(`/albums/${albumId}/photos`, form, {
                onUploadProgress: ({ loaded, total }) =>
                    onProgress?.(uploadPercentage(loaded, total) ?? -1),
            })
            .then((r) => r.data);
    },
    update: (id: string, body: { description?: string; position?: number }) =>
        api.patch<Photo>(`/photos/${id}`, body).then((r) => r.data),
    reorder: (albumId: string, orderedPhotoIds: string[]) =>
        api
            .patch<
                Photo[]
            >(`/albums/${albumId}/photos/reorder`, { orderedPhotoIds })
            .then((r) => r.data),
    remove: (id: string) =>
        api.delete<void>(`/photos/${id}`).then((r) => r.data),
};
