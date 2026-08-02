import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

let activeAudio: HTMLAudioElement | null = null;

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

    useEffect(() => {
        const node = ref.current;
        const markPlaying = () => setPlaying(true);
        const markPaused = () => setPlaying(false);
        node?.addEventListener("play", markPlaying);
        node?.addEventListener("pause", markPaused);
        node?.addEventListener("ended", markPaused);
        return () => {
            node?.removeEventListener("play", markPlaying);
            node?.removeEventListener("pause", markPaused);
            node?.removeEventListener("ended", markPaused);
            node?.pause();
            if (activeAudio === node) activeAudio = null;
        };
    }, []);

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
        durationSeconds == null
            ? null
            : `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`;

    return (
        <div className="voice-note-player">
            <audio ref={ref} src={src} preload="metadata" />
            <Button variant="paper" size="sm" onClick={toggle}>
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
                <span className="voice-note-duration tabular">{duration}</span>
            )}
        </div>
    );
}
