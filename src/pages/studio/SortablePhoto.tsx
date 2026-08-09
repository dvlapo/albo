import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DotsSixVerticalIcon,
    MicrophoneIcon,
    StarIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { Photo } from "../../api/types";
import { Button } from "../../components/ui/Button";
import { VoiceNoteRecorder } from "../../components/VoiceNoteRecorder";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
    useDeletePhotoVoiceNote,
    useUploadPhotoVoiceNote,
} from "../../hooks/queries/voice-notes";
import { cn } from "../../lib/utils";

export function SortablePhoto({
    photo,
    albumId,
    arriving = false,
    cover,
    onDescription,
    onCover,
    onDelete,
}: {
    photo: Photo;
    albumId: string;
    arriving?: boolean;
    cover: boolean;
    onDescription: (id: string, text: string) => void;
    onCover: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
}) {
    const sortable = useSortable({ id: photo.id });
    const uploadVoiceNote = useUploadPhotoVoiceNote(albumId, photo.id);
    const deleteVoiceNote = useDeletePhotoVoiceNote(albumId, photo.id);
    const [description, setDescription] = useState(photo.description ?? "");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const style = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
    };
    return (
        <article
            ref={sortable.setNodeRef}
            style={style}
            className={cn(
                "relative border border-black/20 bg-paper-bright p-[0.7rem] shadow-[5px_7px_15px_rgba(42,37,28,0.2)]",
                arriving && "animate-[photo-arrive_220ms_var(--ease-out)_both]",
                sortable.isDragging &&
                    "z-10 shadow-[8px_12px_24px_rgba(42,37,28,0.28)] [&_.drag-handle]:cursor-grabbing",
            )}
        >
            <button
                className="drag-handle absolute -top-[18px] left-[calc(50%_-_22px)] z-2 h-11 w-11 cursor-grab touch-none border-[1.5px] border-ink bg-yellow"
                aria-label="Reorder photo"
                {...sortable.attributes}
                {...sortable.listeners}
            >
                <DotsSixVerticalIcon />
            </button>
            <img
                className="aspect-4/3 w-full object-cover outline outline-1 outline-black/10"
                src={photo.url}
                alt={photo.description ?? "Album photograph"}
            />
            {cover && (
                <span className="absolute top-5 left-5 flex items-center gap-1 border border-ink bg-yellow px-2 py-1 text-[0.7rem] font-extrabold">
                    <StarIcon weight="fill" /> Cover
                </span>
            )}
            <textarea
                className="min-h-[70px] w-full resize-y border-0 bg-transparent px-1.5 pt-4 pb-1.5 font-display text-[1.05rem] italic"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() =>
                    description !== (photo.description ?? "") &&
                    onDescription(photo.id, description)
                }
                placeholder="Write what happened…"
                aria-label="Photo description"
            />
            <div className="flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCover(photo.id)}
                >
                    <StarIcon /> {cover ? "Cover photo" : "Make cover"}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setDeleteError("");
                        setDeleteDialogOpen(true);
                    }}
                >
                    <TrashIcon /> Remove
                </Button>
            </div>
            <details className="border-t border-dashed border-ink px-1.5 py-3">
                <summary className="flex cursor-pointer gap-1.5 font-[750]">
                    <MicrophoneIcon />{" "}
                    {photo.voiceNotes?.[0]
                        ? "Listen to the story"
                        : "Add the story"}
                </summary>
                <VoiceNoteRecorder
                    existingNote={photo.voiceNotes?.[0]}
                    onDelete={(voiceNoteId) =>
                        deleteVoiceNote.mutateAsync(voiceNoteId)
                    }
                    onConfirm={(blob, seconds, onProgress) =>
                        uploadVoiceNote.mutateAsync({
                            blob,
                            durationSeconds: seconds,
                            onProgress,
                        })
                    }
                />
            </details>
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Remove this photo?"
                description="This photo and its attached voice note will be permanently removed from the album. The rest of the album will stay unchanged."
                confirmLabel="Remove photo"
                cancelLabel="Keep photo"
                pendingLabel="Removing…"
                pending={deleting}
                error={deleteError}
                onConfirm={async () => {
                    setDeleteError("");
                    setDeleting(true);
                    try {
                        await onDelete(photo.id);
                        setDeleteDialogOpen(false);
                    } catch (error) {
                        setDeleteError(
                            error instanceof Error
                                ? error.message
                                : "The photo could not be removed.",
                        );
                    } finally {
                        setDeleting(false);
                    }
                }}
            />
        </article>
    );
}
