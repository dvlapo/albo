export const queryKeys = {
  albums: ["albums"] as const,
  album: (id: string) => ["albums", id] as const,
  photos: (id: string) => ["albums", id, "photos"] as const,
  links: (id: string) => ["albums", id, "share-links"] as const,
  publicAlbum: (token: string) => ["public-albums", token] as const,
};
