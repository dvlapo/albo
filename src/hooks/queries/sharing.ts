import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sharingApi } from "../../api/sharing";
import { queryKeys } from "./keys";

export const useShareLinks = (albumId: string) => useQuery({ queryKey: queryKeys.links(albumId), queryFn: () => sharingApi.list(albumId), enabled: Boolean(albumId) });
export function useCreateShareLink(albumId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: { passkey?: string; expires_at?: string }) => sharingApi.create(albumId, body), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.links(albumId) }) });
}
export function useRevokeShareLink(albumId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: sharingApi.revoke, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.links(albumId) }) });
}
