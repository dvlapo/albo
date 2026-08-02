import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BookOpenIcon,
    StackIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { AlbumViewMode, PublicAlbum, PublicPhoto } from "../api/types";
import { VoiceNotePlayer } from "./VoiceNotePlayer";
import { Button } from "./ui/Button";

const VIEW_KEY = "albo.viewer.mode.v1";
const rotation = (id: string) =>
    (([...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 9) - 4) * 0.7;

function PhotoPage({ photo }: { photo: PublicPhoto }) {
    return (
        <figure className="guest-photo">
            <img
                src={photo.url}
                alt={photo.description ?? "Album photograph"}
            />
            <figcaption>
                {photo.description || "A moment worth keeping."}
            </figcaption>
            {photo.voiceNotes[0] && (
                <VoiceNotePlayer src={photo.voiceNotes[0].url} />
            )}
        </figure>
    );
}

export function AlbumViewer({ album }: { album: PublicAlbum }) {
    const reduced = useReducedMotion();
    const [mode, setMode] = useState<AlbumViewMode>(
        () => (localStorage.getItem(VIEW_KEY) as AlbumViewMode) || "spread",
    );
    const [index, setIndex] = useState(0);
    const last = Math.max(0, album.photos.length - 1);
    const move = useCallback(
        (delta: number) =>
            setIndex((i) => Math.max(0, Math.min(last, i + delta))),
        [last],
    );
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [move]);
    const chooseMode = (next: AlbumViewMode) => {
        setMode(next);
        localStorage.setItem(VIEW_KEY, next);
    };
    if (!album.photos.length)
        return (
            <div className="empty-guest">
                <h2>This album is still waiting for its first photo.</h2>
            </div>
        );
    return (
        <section className="viewer">
            <header className="viewer-toolbar">
                <div className="mode-toggle" aria-label="Album view">
                    <button
                        aria-pressed={mode === "spread"}
                        onClick={() => chooseMode("spread")}
                    >
                        <BookOpenIcon /> Album
                    </button>
                    <button
                        aria-pressed={mode === "stack"}
                        onClick={() => chooseMode("stack")}
                    >
                        <StackIcon /> Stack
                    </button>
                </div>
                <span className="page-count">
                    {index + 1} / {album.photos.length}
                </span>
            </header>
            <p className="sr-only" aria-live="polite">
                Photograph {index + 1} of {album.photos.length}
            </p>
            {mode === "spread" ? (
                <div className="spread-stage">
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                            key={album.photos[index].id}
                            className="spread-page"
                            drag={reduced ? false : "x"}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            onDragEnd={(_, info) => {
                                if (
                                    Math.abs(info.offset.x) > 80 ||
                                    Math.abs(info.velocity.x) > 500
                                )
                                    move(info.offset.x < 0 ? 1 : -1);
                            }}
                            initial={
                                reduced
                                    ? { opacity: 0 }
                                    : { opacity: 0, rotateY: -8, x: 28 }
                            }
                            animate={{ opacity: 1, rotateY: 0, x: 0 }}
                            exit={
                                reduced
                                    ? { opacity: 0 }
                                    : { opacity: 0, x: -25 }
                            }
                            transition={{
                                type: "spring",
                                duration: 0.4,
                                bounce: 0.08,
                            }}
                        >
                            <PhotoPage photo={album.photos[index]} />
                            {album.photos[index + 1] && (
                                <div className="desktop-second-page">
                                    <PhotoPage
                                        photo={album.photos[index + 1]}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="stack-stage">
                    {album.photos
                        .slice(index, index + 3)
                        .reverse()
                        .map((photo, reverseIndex, visible) => {
                            const top = reverseIndex === visible.length - 1;
                            return (
                                <motion.div
                                    key={photo.id}
                                    className="stack-photo"
                                    style={{
                                        rotate: rotation(photo.id),
                                        zIndex: reverseIndex,
                                    }}
                                    drag={top && !reduced}
                                    dragSnapToOrigin
                                    onDragEnd={(_, info) => {
                                        if (
                                            Math.abs(info.offset.x) > 95 ||
                                            Math.abs(info.velocity.x) > 550
                                        )
                                            move(info.offset.x < 0 ? 1 : -1);
                                    }}
                                    whileDrag={{
                                        scale: 1.02,
                                        cursor: "grabbing",
                                    }}
                                    transition={{
                                        type: "spring",
                                        duration: 0.42,
                                        bounce: 0.16,
                                    }}
                                >
                                    <PhotoPage photo={photo} />
                                </motion.div>
                            );
                        })}
                </div>
            )}
            <div className="viewer-controls">
                <Button
                    variant="paper"
                    aria-label="Previous photograph"
                    disabled={index === 0}
                    onClick={() => move(-1)}
                >
                    <ArrowLeftIcon />
                </Button>
                <Button
                    variant="paper"
                    aria-label="Next photograph"
                    disabled={index === last}
                    onClick={() => move(1)}
                >
                    <ArrowRightIcon />
                </Button>
            </div>
        </section>
    );
}
