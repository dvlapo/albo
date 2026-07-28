import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { albumsApi } from "../../api/albums";
import { photosApi } from "../../api/photos";
import { queryKeys } from "./keys";

export const useAlbumsQuery = () => useQuery({ queryKey: queryKeys.albums, queryFn: albumsApi.list });
export const useAlbumQuery = (id: string) => useQuery({ queryKey: queryKeys.album(id), queryFn: () => albumsApi.get(id), enabled: Boolean(id) });
export const usePhotosQuery = (id: string) => useQuery({ queryKey: queryKeys.photos(id), queryFn: () => photosApi.list(id), enabled: Boolean(id) });

export function useCreateAlbum() {
  const client = useQueryClient();
  return useMutation({ mutationFn: albumsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.albums }) });
}

export function useUpdateAlbum(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: { title?: string; description?: string; cover_photo_id?: string }) => albumsApi.update(id, body), onSuccess: () => {
    client.invalidateQueries({ queryKey: queryKeys.albums });
    client.invalidateQueries({ queryKey: queryKeys.album(id) });
  } });
}

export function useDeleteAlbum(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => albumsApi.remove(id), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.albums }) });
}
