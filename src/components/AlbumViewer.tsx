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
        <figure className="m-0 flex flex-col justify-center p-[clamp(1rem,3vw,2.5rem)]">
            <img
                className="max-h-95 w-full bg-[#ddd] object-contain shadow-[0_2px_12px_rgba(0,0,0,0.12)] outline-1 outline-black/10"
                src={photo.url}
                alt={photo.description ?? "Album photograph"}
                draggable={false}
            />
            <figcaption className="my-4 font-display text-[1.15rem] leading-[1.4] italic">
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
            className="absolute w-[min(88vw,560px)] touch-none cursor-grab select-none border border-black/20 bg-paper-bright shadow-[8px_12px_25px_rgba(31,27,20,0.22)] [&>figure]:px-4 [&>figure]:pt-4 [&>figure]:pb-8 [&_img]:pointer-events-none [&_img]:[-webkit-user-drag:none]"
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
    const stackPhotos = useMemo(() => {
        const seen = new Set<string>();
        return [0, 1, 2, -1]
            .map(
                (offset) =>
                    album.photos[(index + offset + photoCount) % photoCount],
            )
            .filter((photo): photo is PublicPhoto => {
                if (!photo || seen.has(photo.id)) return false;
                seen.add(photo.id);
                return true;
            })
            .reverse();
    }, [album.photos, index, photoCount]);
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
            <div className="mx-auto my-16 max-w-162.5 border-[1.5px] border-dashed border-ink px-8 py-16 text-center">
                <h2>This album is still waiting for its first photo.</h2>
            </div>
        );
    return (
        <section className="mx-auto my-8 max-w-300">
            <header className="mb-4 flex items-center justify-between">
                <div
                    className="flex rounded-full border-[1.5px] border-ink bg-paper-bright p-0.75"
                    aria-label="Album view"
                >
                    <button
                        className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 py-2 aria-pressed:bg-ink aria-pressed:text-white"
                        data-cuelume-toggle="toggle"
                        aria-pressed={mode === "spread"}
                        onClick={() => chooseMode("spread")}
                    >
                        <BookOpenIcon /> Album
                    </button>
                    <button
                        className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 py-2 aria-pressed:bg-ink aria-pressed:text-white"
                        data-cuelume-toggle="toggle"
                        aria-pressed={mode === "stack"}
                        onClick={() => chooseMode("stack")}
                    >
                        <StackIcon /> Stack
                    </button>
                </div>
                <span className="font-extrabold tabular-nums">
                    {index + 1} / {album.photos.length}
                </span>
            </header>
            <p className="sr-only" aria-live="polite">
                Photograph {index + 1} of {album.photos.length}
            </p>
            {mode === "spread" ? (
                <div className="grid min-h-150 place-items-center perspective-[1400px] max-[800px]:min-h-130">
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                            key={album.photos[index].id}
                            className="grid min-h-135 w-[min(100%,1000px)] cursor-grab grid-cols-2 border-[1.5px] border-ink bg-[#efe8d7] shadow-[10px_15px_30px_rgba(36,31,23,0.22)] max-[800px]:min-h-120 max-[800px]:grid-cols-1"
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
                                <div className="max-[800px]:hidden">
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
                <div className="relative grid min-h-150 place-items-center perspective-[1400px] max-[800px]:min-h-130">
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
            <div className="mt-6 flex justify-center gap-4">
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
