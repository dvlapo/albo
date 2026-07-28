import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ArrowLeft, Gear, Microphone, ShareNetwork, UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { voiceNotesApi } from "../../api/voice-notes";
import { VoiceNoteRecorder } from "../../components/VoiceNoteRecorder";
import { Button } from "../../components/ui/Button";
import { useAlbumQuery, usePhotosQuery, useUpdateAlbum } from "../../hooks/queries/albums";
import { useDeletePhoto, useReorderPhotos, useUpdatePhoto, useUploadPhoto } from "../../hooks/queries/photos";
import { SortablePhoto } from "./SortablePhoto";

export function AlbumWorkshopPage() {
  const { albumId = "" } = useParams(); const album = useAlbumQuery(albumId); const photos = usePhotosQuery(albumId);
  const upload = useUploadPhoto(albumId); const updatePhoto = useUpdatePhoto(albumId); const removePhoto = useDeletePhoto(albumId); const reorder = useReorderPhotos(albumId); const updateAlbum = useUpdateAlbum(albumId);
  const input = useRef<HTMLInputElement>(null); const [progress, setProgress] = useState<Record<string, number>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const addFiles = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) continue;
      await upload.mutateAsync({ file, onProgress: (value) => setProgress((p) => ({ ...p, [file.name]: value })) });
      setProgress((p) => { const next = { ...p }; delete next[file.name]; return next; });
    }
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !photos.data) return;
    const oldIndex = photos.data.findIndex((p) => p.id === active.id); const newIndex = photos.data.findIndex((p) => p.id === over.id);
    reorder.mutate(arrayMove(photos.data, oldIndex, newIndex));
  };
  if (album.isLoading) return <div className="page-loader">Opening the worktable…</div>;
  if (!album.data) return <div className="paper-message">This album could not be found.</div>;
  return <div className="workshop">
    <header className="workshop-bar"><Link to="/studio" className="back-link"><ArrowLeft /> Shelf</Link><div><p className="eyebrow">On the worktable</p><h1>{album.data.title}</h1></div><nav><Link className="button button--paper button--sm" to="share"><ShareNetwork /> Share</Link><Link className="button button--paper button--sm" to="settings"><Gear /> Settings</Link></nav></header>
    <section className="inside-cover"><div><h2>{album.data.description || "The story starts here."}</h2><p>{photos.data?.length ?? 0} photographs tucked inside.</p></div><div><p><Microphone /> Album introduction</p><VoiceNoteRecorder onConfirm={async (blob, seconds) => { await voiceNotesApi.uploadAlbum(albumId, blob, seconds); album.refetch(); }} /></div></section>
    <section className="upload-strip"><input ref={input} hidden type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} /><div><h2>Add another memory</h2><p>JPG, PNG, HEIC, or WebP up to 20 MB each.</p></div><Button variant="coral" onClick={() => input.current?.click()}><UploadSimple /> Choose photos</Button>{Object.entries(progress).map(([name, value]) => <div className="upload-progress" key={name}><span>{name}</span><progress value={value} max="100" /></div>)}</section>
    {photos.data?.length === 0 ? <div className="empty-worktable"><h2>Nothing on the table yet.</h2><p>Add a few photographs. You can rearrange them once they land.</p></div> :
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><SortableContext items={photos.data?.map((p) => p.id) ?? []} strategy={rectSortingStrategy}><div className="photo-worktable">{photos.data?.map((photo) => <SortablePhoto key={photo.id} photo={photo} cover={album.data.coverPhotoId === photo.id} onDescription={(id, description) => updatePhoto.mutate({ id, description })} onCover={(id) => updateAlbum.mutate({ cover_photo_id: id })} onDelete={(id) => { if (confirm("Remove this photo from the album?")) removePhoto.mutate(id); }} onRefresh={() => photos.refetch()} />)}</div></SortableContext></DndContext>}
  </div>;
}
