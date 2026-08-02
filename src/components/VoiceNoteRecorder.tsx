import { MicrophoneIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

export function VoiceNoteRecorder({
    onConfirm,
    busy = false,
}: {
    onConfirm: (blob: Blob, seconds: number) => Promise<void>;
    busy?: boolean;
}) {
    const recorder = useRef<MediaRecorder | null>(null);
    const timer = useRef<number | null>(null);
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [blob, setBlob] = useState<Blob | null>(null);
    const [error, setError] = useState("");
    useEffect(
        () => () => {
            if (timer.current) window.clearInterval(timer.current);
            recorder.current?.stream
                .getTracks()
                .forEach((track) => track.stop());
        },
        [],
    );

    const start = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const chunks: Blob[] = [];
            const mimeType = MediaRecorder.isTypeSupported(
                "audio/webm;codecs=opus",
            )
                ? "audio/webm;codecs=opus"
                : "audio/webm";
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, {
                    type: mediaRecorder.mimeType || "audio/webm",
                });

                if (audioBlob.size > 0) {
                    setBlob(audioBlob);
                } else {
                    setError(
                        "The recording was empty. Please record your story again.",
                    );
                }

                stream.getTracks().forEach((track) => track.stop());
            };
            recorder.current = mediaRecorder;
            mediaRecorder.start();
            setElapsed(0);
            setRecording(true);
            timer.current = window.setInterval(
                () => setElapsed((v) => v + 1),
                1000,
            );
        } catch {
            setError("Microphone access was not granted. You can try again.");
        }
    };
    const stop = () => {
        recorder.current?.stop();
        setRecording(false);
        if (timer.current) window.clearInterval(timer.current);
    };

    return (
        <div className="recorder">
            {!recording && !blob && (
                <Button variant="paper" size="sm" onClick={start}>
                    <MicrophoneIcon /> Record a story
                </Button>
            )}
            {recording && (
                <Button variant="coral" size="sm" onClick={stop}>
                    <StopIcon weight="fill" /> Stop{" "}
                    <span className="tabular">
                        {Math.floor(elapsed / 60)}:
                        {String(elapsed % 60).padStart(2, "0")}
                    </span>
                </Button>
            )}
            {blob && (
                <div className="recording-preview">
                    <audio controls src={URL.createObjectURL(blob)} />
                    <Button
                        variant="ink"
                        size="sm"
                        disabled={busy}
                        onClick={() => onConfirm(blob, elapsed)}
                    >
                        {busy ? "Saving…" : "Keep this story"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Discard recording"
                        onClick={() => setBlob(null)}
                    >
                        <TrashIcon />
                    </Button>
                </div>
            )}
            {error && (
                <small className="form-error" role="alert">
                    {error}
                </small>
            )}
        </div>
    );
}
