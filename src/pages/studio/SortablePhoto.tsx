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
            className={`workshop-photo${arriving ? " workshop-photo--arriving" : ""}${sortable.isDragging ? " workshop-photo--dragging" : ""}`}
        >
            <button
                className="drag-handle"
                aria-label="Reorder photo"
                {...sortable.attributes}
                {...sortable.listeners}
            >
                <DotsSixVerticalIcon />
            </button>
            <img
                src={photo.url}
                alt={photo.description ?? "Album photograph"}
            />
            {cover && (
                <span className="cover-badge">
                    <StarIcon weight="fill" /> Cover
                </span>
            )}
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() =>
                    description !== (photo.description ?? "") &&
                    onDescription(photo.id, description)
                }
                placeholder="Write what happened…"
                aria-label="Photo description"
            />
            <div className="photo-actions">
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
            <details>
                <summary>
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
