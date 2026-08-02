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
import { voiceNotesApi } from "../../api/voice-notes";

export function SortablePhoto({
    photo,
    cover,
    onDescription,
    onCover,
    onDelete,
    onRefresh,
}: {
    photo: Photo;
    cover: boolean;
    onDescription: (id: string, text: string) => void;
    onCover: (id: string) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
}) {
    const sortable = useSortable({ id: photo.id });
    const [description, setDescription] = useState(photo.description ?? "");
    const style = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
    };
    return (
        <article
            ref={sortable.setNodeRef}
            style={style}
            className="workshop-photo"
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
                    onClick={() => onDelete(photo.id)}
                >
                    <TrashIcon /> Remove
                </Button>
            </div>
            <details>
                <summary>
                    <MicrophoneIcon /> Add the story
                </summary>
                <VoiceNoteRecorder
                    onConfirm={async (blob, seconds) => {
                        await voiceNotesApi.uploadPhoto(
                            photo.id,
                            blob,
                            seconds,
                        );
                        onRefresh();
                    }}
                />
            </details>
        </article>
    );
}
