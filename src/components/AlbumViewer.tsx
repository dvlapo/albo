import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BookOpenIcon,
    StackIcon,
} from "@phosphor-icons/react";
import { play } from "cuelume";
import {
    AnimatePresence,
    animate,
    motion,
    useAnimationControls,
    useMotionValue,
    useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
                draggable={false}
            />
            <figcaption>
                {photo.description || "A moment worth keeping."}
            </figcaption>
            {photo.voiceNotes[0] && (
                <VoiceNotePlayer
                    src={photo.voiceNotes[0].url}
                    durationSeconds={photo.voiceNotes[0].durationSeconds}
                />
            )}
        </figure>
    );
}

function StackPhoto({
    photo,
    top,
    zIndex,
    reduced,
    onDismiss,
}: {
    photo: PublicPhoto;
    top: boolean;
    zIndex: number;
    reduced: boolean;
    onDismiss: () => void;
}) {
    const controls = useAnimationControls();
    const x = useMotionValue(0);
    const [dismissing, setDismissing] = useState(false);
    const [behind, setBehind] = useState(false);

    return (
        <motion.div
            className="stack-photo"
            style={{
                x,
                rotate: rotation(photo.id),
                zIndex: behind ? -1 : zIndex,
            }}
            drag={top && !reduced && !dismissing ? "x" : false}
            dragMomentum={false}
            animate={controls}
            onDragEnd={async (_, info) => {
                const committed =
                    Math.abs(info.offset.x) > 95 ||
                    Math.abs(info.velocity.x) > 550;
                if (dismissing) return;
                if (!committed) {
                    animate(x, 0, {
                        type: "spring",
                        duration: 0.38,
                        bounce: 0,
                        velocity: info.velocity.x,
                    });
                    return;
                }

                setDismissing(true);
                setBehind(true);
                controls.set({ y: 18, scale: 0.94, opacity: 1 });
                onDismiss();
                await new Promise<void>((resolve) =>
                    requestAnimationFrame(() =>
                        requestAnimationFrame(() => resolve()),
                    ),
                );
                setBehind(false);
                await Promise.all([
                    animate(x, 0, {
                        type: "spring",
                        duration: 0.34,
                        bounce: 0,
                        velocity: info.velocity.x,
                    }),
                    controls.start({
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                            type: "spring",
                            duration: 0.34,
                            bounce: 0,
                        },
                    }),
                ]);
                setDismissing(false);
            }}
            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            transition={{ type: "spring", duration: 0.42, bounce: 0.16 }}
        >
            <PhotoPage photo={photo} />
        </motion.div>
    );
}

export function AlbumViewer({ album }: { album: PublicAlbum }) {
    const reduced = useReducedMotion();
    const [mode, setMode] = useState<AlbumViewMode>(
        () => (localStorage.getItem(VIEW_KEY) as AlbumViewMode) || "spread",
    );
    const [index, setIndex] = useState(0);
    const photoCount = album.photos.length;
    const move = useCallback(
        (delta: number) =>
            setIndex((current) => {
                if (photoCount <= 1) return current;
                const next = (current + delta + photoCount) % photoCount;
                if (next !== current) play("press", { volume: 0.9 });
                return next;
            }),
        [photoCount],
    );
    const stackPhotos = useMemo(
        () => {
            const seen = new Set<string>();
            return [0, 1, 2, -1]
                .map(
                    (offset) =>
                        album.photos[
                            (index + offset + photoCount) % photoCount
                        ],
                )
                .filter((photo): photo is PublicPhoto => {
                    if (!photo || seen.has(photo.id)) return false;
                    seen.add(photo.id);
                    return true;
                })
                .reverse();
        },
        [album.photos, index, photoCount],
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
                        data-cuelume-toggle="toggle"
                        aria-pressed={mode === "spread"}
                        onClick={() => chooseMode("spread")}
                    >
                        <BookOpenIcon /> Album
                    </button>
                    <button
                        data-cuelume-toggle="toggle"
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
                            {photoCount > 1 && (
                                <div className="desktop-second-page">
                                    <PhotoPage
                                        photo={
                                            album.photos[
                                                (index + 1) % photoCount
                                            ]
                                        }
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="stack-stage">
                    {stackPhotos.map((photo, reverseIndex) => (
                        <StackPhoto
                            key={photo.id}
                            photo={photo}
                            zIndex={reverseIndex}
                            top={reverseIndex === stackPhotos.length - 1}
                            reduced={Boolean(reduced)}
                            onDismiss={() => move(1)}
                        />
                    ))}
                </div>
            )}
            <div className="viewer-controls">
                <Button
                    variant="paper"
                    sound={false}
                    aria-label="Previous photograph"
                    disabled={photoCount <= 1}
                    onClick={() => move(-1)}
                >
                    <ArrowLeftIcon />
                </Button>
                <Button
                    variant="paper"
                    sound={false}
                    aria-label="Next photograph"
                    disabled={photoCount <= 1}
                    onClick={() => move(1)}
                >
                    <ArrowRightIcon />
                </Button>
            </div>
        </section>
    );
}
