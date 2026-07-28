import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "../../api/photos";
import type { Photo } from "../../api/types";
import { queryKeys } from "./keys";

export function useUploadPhoto(albumId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ file, onProgress }: { file: File; onProgress?: (value: number) => void }) => photosApi.upload(albumId, file, onProgress), onSuccess: () => {
    client.invalidateQueries({ queryKey: queryKeys.photos(albumId) });
    client.invalidateQueries({ queryKey: queryKeys.album(albumId) });
    client.invalidateQueries({ queryKey: queryKeys.albums });
  } });
}

export function useUpdatePhoto(albumId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, description }: { id: string; description: string }) => photosApi.update(id, { description }), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.photos(albumId) }) });
}

export function useDeletePhoto(albumId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: photosApi.remove, onSuccess: () => {
    client.invalidateQueries({ queryKey: queryKeys.photos(albumId) });
    client.invalidateQueries({ queryKey: queryKeys.album(albumId) });
  } });
}

export function useReorderPhotos(albumId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (photos: Photo[]) => photosApi.reorder(albumId, photos.map((p) => p.id)),
    onMutate: async (photos) => {
      await client.cancelQueries({ queryKey: queryKeys.photos(albumId) });
      const previous = client.getQueryData<Photo[]>(queryKeys.photos(albumId));
      client.setQueryData(queryKeys.photos(albumId), photos);
      return { previous };
    },
    onError: (_error, _photos, context) => client.setQueryData(queryKeys.photos(albumId), context?.previous),
    onSuccess: (photos) => client.setQueryData(queryKeys.photos(albumId), photos),
  });
}
