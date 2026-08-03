import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

let activeAudio: HTMLAudioElement | null = null;

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
}: {
    src: string;
    label?: string;
    durationSeconds?: number;
}) {
    const ref = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
        normalizeDuration(durationSeconds),
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
        <div className="voice-note-player">
            <audio ref={ref} src={src} preload="metadata" />
            <Button variant="paper" size="sm" sound={false} onClick={toggle}>
                {playing ? (
                    <PauseIcon weight="fill" />
                ) : (
                    <PlayIcon weight="fill" />
                )}{" "}
                {playing ? "Pause story" : label}
            </Button>
            <span
                className="voice-note-wave"
                data-playing={playing}
                aria-hidden="true"
            >
                <i />
                <i />
                <i />
                <i />
                <i />
            </span>
            {duration && (
                <span
                    className="voice-note-duration tabular"
                    aria-label={`${duration} remaining`}
                >
                    {duration}
                </span>
            )}
        </div>
    );
}
