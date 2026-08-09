import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
} from "@dnd-kit/sortable";
import {
    ArrowLeftIcon,
    GearIcon,
    MicrophoneIcon,
    ShareNetworkIcon,
    UploadSimpleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import type { Photo } from "../../api/types";
import { Link, useParams } from "react-router-dom";
import { UploadProgress } from "../../components/UploadProgress";
import { VoiceNoteRecorder } from "../../components/VoiceNoteRecorder";
import { Button } from "../../components/ui/Button";
import { buttonClassName } from "../../components/ui/buttonStyles";
import {
    useAlbumQuery,
    usePhotosQuery,
    useUpdateAlbum,
} from "../../hooks/queries/albums";
import {
    useDeletePhoto,
    useReorderPhotos,
    useUpdatePhoto,
    useUploadPhoto,
} from "../../hooks/queries/photos";
import {
    useDeleteAlbumVoiceNote,
    useUploadAlbumVoiceNote,
} from "../../hooks/queries/voice-notes";
import { SortablePhoto } from "./SortablePhoto";
import type { UploadEntry } from "../../types/uploads";

export function AlbumWorkshopPage() {
    const { albumId = "" } = useParams();
    const album = useAlbumQuery(albumId);
    const photos = usePhotosQuery(albumId);
    const upload = useUploadPhoto(albumId);
    const updatePhoto = useUpdatePhoto(albumId);
    const removePhoto = useDeletePhoto(albumId);
    const reorder = useReorderPhotos(albumId);
    const updateAlbum = useUpdateAlbum(albumId);
    const uploadAlbumVoiceNote = useUploadAlbumVoiceNote(albumId);
    const deleteAlbumVoiceNote = useDeleteAlbumVoiceNote(albumId);
    const input = useRef<HTMLInputElement>(null);
    const [uploads, setUploads] = useState<UploadEntry<File, Photo>[]>([]);
    const [arrivalLayouts, setArrivalLayouts] = useState<
        Record<string, string>
    >({});
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );
    const updateUpload = (
        id: string,
        patch: Partial<UploadEntry<File, Photo>>,
    ) =>
        setUploads((current) =>
            current.map((entry) =>
                entry.id === id ? { ...entry, ...patch } : entry,
            ),
        );

    const runUpload = async (entry: UploadEntry<File, Photo>) => {
        updateUpload(entry.id, {
            status: "uploading",
            progress: 0,
            error: undefined,
        });
        try {
            const photo = await upload.mutateAsync({
                file: entry.source,
                onProgress: (value) =>
                    updateUpload(entry.id, {
                        progress: value < 0 ? null : value,
                    }),
            });
            setArrivalLayouts((current) => ({
                ...current,
                [photo.id]: `photo-upload-${entry.id}`,
            }));
            updateUpload(entry.id, {
                status: "success",
                progress: 100,
                result: photo,
            });
            window.setTimeout(() => {
                setUploads((current) =>
                    current.filter((item) => item.id !== entry.id),
                );
                setArrivalLayouts((current) => {
                    const next = { ...current };
                    delete next[photo.id];
                    return next;
                });
            }, 700);
        } catch (uploadError) {
            updateUpload(entry.id, {
                status: "error",
                error:
                    uploadError instanceof Error
                        ? uploadError.message
                        : "The photo could not be uploaded.",
            });
        }
    };

    const addFiles = async (files: FileList | null) => {
        const entries: UploadEntry<File, Photo>[] = Array.from(files ?? []).map(
            (file) => {
                const validationError = !file.type.startsWith("image/")
                    ? "Choose an image file."
                    : file.size > 20 * 1024 * 1024
                      ? "This photo is larger than 20 MB."
                      : undefined;
                return {
                    id: crypto.randomUUID(),
                    label: file.name,
                    source: file,
                    status: validationError ? "error" : "queued",
                    progress: validationError ? null : 0,
                    error: validationError,
                };
            },
        );
        setUploads((current) => [...current, ...entries]);

        const queue = entries.filter((entry) => entry.status === "queued");
        let cursor = 0;
        const worker = async () => {
            while (cursor < queue.length) {
                const entry = queue[cursor++];
                await runUpload(entry);
            }
        };
        await Promise.all(
            Array.from({ length: Math.min(3, queue.length) }, worker),
        );
    };
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id || !photos.data) return;
        const oldIndex = photos.data.findIndex((p) => p.id === active.id);
        const newIndex = photos.data.findIndex((p) => p.id === over.id);
        reorder.mutate(arrayMove(photos.data, oldIndex, newIndex));
    };
    if (album.isLoading)
        return (
            <div className="grid min-h-[60vh] place-items-center font-display text-2xl italic">
                Opening the worktable…
            </div>
        );
    if (!album.data)
        return (
            <div className="mx-auto my-16 max-w-[650px] border-[1.5px] border-dashed border-ink px-8 py-16 text-center">
                This album could not be found.
            </div>
        );
    return (
        <div className="m-auto max-w-[1400px] p-[clamp(2rem,5vw,4rem)] max-[800px]:px-4 max-[800px]:py-8">
            <header className="grid grid-cols-[auto_1fr_auto] items-center gap-8 border-b-[1.5px] border-dashed border-ink pb-6 max-[800px]:grid-cols-[1fr_auto] max-[800px]:[&>div]:col-span-full max-[800px]:[&>div]:row-start-2">
                <Link
                    to="/studio"
                    className="inline-flex items-center gap-1.5 font-[750] supports-[corner-shape:squircle]:[corner-shape:squircle]"
                >
                    <ArrowLeftIcon /> Shelf
                </Link>
                <div>
                    <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                        On the worktable
                    </p>
                    <h1 className="m-0 text-[clamp(2.4rem,5vw,4rem)]">
                        {album.data.title}
                    </h1>
                </div>
                <nav className="flex items-center gap-4 max-[800px]:gap-1.5">
                    <Link
                        className={buttonClassName({
                            variant: "paper",
                            size: "sm",
                        })}
                        to="share"
                    >
                        <ShareNetworkIcon /> Share
                    </Link>
                    <Link
                        className={buttonClassName({
                            variant: "paper",
                            size: "sm",
                        })}
                        to="settings"
                    >
                        <GearIcon /> Settings
                    </Link>
                </nav>
            </header>
            <section className="my-12 grid grid-cols-2 gap-8 border-[1.5px] border-ink bg-[#e6d7a6] p-10 shadow-paper max-[800px]:grid-cols-1">
                <div>
                    <h2>
                        {album.data.description || "The story starts here."}
                    </h2>
                    <p>{photos.data?.length ?? 0} photographs tucked inside.</p>
                </div>
                <div>
                    <p>
                        <MicrophoneIcon /> Album introduction
                    </p>
                    <VoiceNoteRecorder
                        existingNote={album.data.voiceNotes[0]}
                        onDelete={(voiceNoteId) =>
                            deleteAlbumVoiceNote.mutateAsync(voiceNoteId)
                        }
                        onConfirm={(blob, seconds, onProgress) =>
                            uploadAlbumVoiceNote.mutateAsync({
                                blob,
                                durationSeconds: seconds,
                                onProgress,
                            })
                        }
                    />
                </div>
            </section>
            <section className="flex flex-wrap items-center justify-between gap-4 border-[1.5px] border-dashed border-ink bg-white/40 p-6 [&_h2]:m-0 [&_p]:m-0">
                <input
                    ref={input}
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                        void addFiles(event.target.files);
                        event.currentTarget.value = "";
                    }}
                />
                <div>
                    <h2>Add another memory</h2>
                    <p>JPG, PNG, HEIC, or WebP up to 20 MB each.</p>
                </div>
                <Button variant="coral" onClick={() => input.current?.click()}>
                    <UploadSimpleIcon /> Choose photos
                </Button>
                <AnimatePresence initial={false}>
                    {uploads.map((entry) => (
                        <UploadProgress
                            key={entry.id}
                            layoutId={`photo-upload-${entry.id}`}
                            label={entry.label}
                            status={entry.status}
                            progress={entry.progress}
                            error={entry.error}
                            onRetry={
                                entry.status === "error" &&
                                entry.source.type.startsWith("image/") &&
                                entry.source.size <= 20 * 1024 * 1024
                                    ? () => void runUpload(entry)
                                    : undefined
                            }
                            onDismiss={() =>
                                setUploads((current) =>
                                    current.filter(
                                        (item) => item.id !== entry.id,
                                    ),
                                )
                            }
                        />
                    ))}
                </AnimatePresence>
            </section>
            {photos.data?.length === 0 ? (
                <div className="mx-auto my-16 max-w-[650px] border-[1.5px] border-dashed border-ink px-8 py-16 text-center">
                    <h2>Nothing on the table yet.</h2>
                    <p>
                        Add a few photographs. You can rearrange them once they
                        land.
                    </p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext
                        items={photos.data?.map((p) => p.id) ?? []}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-12 px-4 py-16 max-[520px]:grid-cols-1 max-[520px]:px-0">
                            {photos.data?.map((photo) => (
                                <SortablePhoto
                                    key={photo.id}
                                    photo={photo}
                                    albumId={albumId}
                                    arriving={Boolean(arrivalLayouts[photo.id])}
                                    cover={album.data.coverPhotoId === photo.id}
                                    onDescription={(id, description) =>
                                        updatePhoto.mutate({ id, description })
                                    }
                                    onCover={(id) =>
                                        updateAlbum.mutate({
                                            cover_photo_id: id,
                                        })
                                    }
                                    onDelete={(id) =>
                                        removePhoto.mutateAsync(id)
                                    }
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
