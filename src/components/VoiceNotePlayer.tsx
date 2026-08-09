import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

let activeAudio: HTMLAudioElement | null = null;

export type VoiceNotePlayerJustify = "center" | "between";

function normalizeDuration(value?: number) {
    return value != null && Number.isFinite(value) ? Math.max(0, value) : null;
}

function formatDuration(value: number) {
    const seconds = Math.max(0, Math.ceil(value));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function VoiceNotePlayer({
    src,
    label = "Play story",
    durationSeconds,
    justify = "center",
}: {
    src: string;
    label?: string;
    durationSeconds?: number;
    justify?: VoiceNotePlayerJustify;
}) {
    const ref = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
        () => normalizeDuration(durationSeconds),
    );

    useEffect(() => {
        const node = ref.current;
        const markPlaying = () => setPlaying(true);
        const markPaused = () => setPlaying(false);
        const updateRemaining = () => {
            if (!node) return;
            const total = normalizeDuration(durationSeconds ?? node.duration);
            setRemainingSeconds(
                total == null ? null : Math.max(0, total - node.currentTime),
            );
        };
        const markEnded = () => {
            markPaused();
            setRemainingSeconds(0);
        };

        updateRemaining();
        node?.addEventListener("play", markPlaying);
        node?.addEventListener("pause", markPaused);
        node?.addEventListener("ended", markEnded);
        node?.addEventListener("timeupdate", updateRemaining);
        node?.addEventListener("loadedmetadata", updateRemaining);
        node?.addEventListener("durationchange", updateRemaining);
        return () => {
            node?.removeEventListener("play", markPlaying);
            node?.removeEventListener("pause", markPaused);
            node?.removeEventListener("ended", markEnded);
            node?.removeEventListener("timeupdate", updateRemaining);
            node?.removeEventListener("loadedmetadata", updateRemaining);
            node?.removeEventListener("durationchange", updateRemaining);
            node?.pause();
            if (activeAudio === node) activeAudio = null;
        };
    }, [durationSeconds, src]);

    const toggle = async () => {
        const audio = ref.current;
        if (!audio) return;
        if (audio.paused) {
            if (activeAudio && activeAudio !== audio) activeAudio.pause();
            activeAudio = audio;
            await audio.play();
        } else {
            audio.pause();
        }
    };

    const duration =
        remainingSeconds == null ? null : formatDuration(remainingSeconds);

    return (
        <div
            className={cn(
                "flex min-w-0 items-center gap-2.5 max-[520px]:flex-wrap",
                justify === "between" ? "justify-between" : "justify-center",
            )}
        >
            <audio ref={ref} src={src} preload="metadata" />
            <Button
                className="shrink-0"
                variant="paper"
                size="sm"
                sound={false}
                onClick={toggle}
            >
                {playing ? (
                    <PauseIcon weight="fill" />
                ) : (
                    <PlayIcon weight="fill" />
                )}{" "}
                {playing ? "Pause story" : label}
            </Button>
            <span
                className="flex h-6 items-center gap-0.75> text-coral"
                data-playing={playing}
                aria-hidden="true"
            >
                {[8, 16, 22, 16, 8].map((height, index) => (
                    <i
                        key={index}
                        className={cn(
                            "block w-0.75 origin-center rounded-full bg-current",
                            playing &&
                                "animate-[voice-wave_0.68s_ease-in-out_infinite] motion-reduce:animate-none",
                            playing &&
                                [
                                    "[animation-duration:0.58s] [animation-delay:-0.18s]",
                                    "[animation-duration:0.82s] [animation-delay:-0.46s]",
                                    "[animation-duration:0.52s] [animation-delay:-0.31s]",
                                    "[animation-duration:0.74s] [animation-delay:-0.57s]",
                                    "[animation-duration:0.9s] [animation-delay:-0.24s]",
                                ][index],
                        )}
                        style={{ height }}
                    />
                ))}
            </span>
            {duration && (
                <span
                    className="ms-auto text-[0.78rem] text-graphite font-[750] tabular-nums max-[520px]:ms-0"
                    aria-label={`${duration} remaining`}
                >
                    {duration}
                </span>
            )}
        </div>
    );
}
