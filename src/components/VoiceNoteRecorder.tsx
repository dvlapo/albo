import { MicrophoneIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { VoiceNote } from "../api/types";
import type { UploadStatus } from "../types/uploads";
import { UploadProgress } from "./UploadProgress";
import { VoiceNotePlayer } from "./VoiceNotePlayer";
import { Button } from "./ui/Button";

export function VoiceNoteRecorder({
    onConfirm,
}: {
    onConfirm: (
        blob: Blob,
        seconds: number,
        onProgress: (percentage: number) => void,
    ) => Promise<VoiceNote>;
}) {
    const recorder = useRef<MediaRecorder | null>(null);
    const timer = useRef<number | null>(null);
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [blob, setBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [savedNote, setSavedNote] = useState<VoiceNote | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!blob) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [blob]);

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
        setSavedNote(null);
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
                if (event.data.size > 0) chunks.push(event.data);
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
                () => setElapsed((value) => value + 1),
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

    const upload = async () => {
        if (!blob || uploadStatus === "uploading") return;
        setError("");
        setUploadStatus("uploading");
        setUploadProgress(0);
        try {
            const note = await onConfirm(blob, elapsed, (percentage) =>
                setUploadProgress(percentage < 0 ? null : percentage),
            );
            setUploadProgress(100);
            setUploadStatus("success");
            setSavedNote(note);
            window.setTimeout(() => {
                setBlob(null);
                setUploadStatus(null);
            }, 450);
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : "The voice note could not be saved.",
            );
            setUploadStatus("error");
        }
    };

    const discard = () => {
        setBlob(null);
        setUploadStatus(null);
        setUploadProgress(null);
        setError("");
    };

    return (
        <div className="recorder">
            {!recording && !blob && !savedNote && (
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
            {savedNote && !blob && (
                <div className="voice-note-saved">
                    <VoiceNotePlayer
                        src={savedNote.url}
                        label="Play saved story"
                    />
                </div>
            )}
            {blob && uploadStatus !== "success" && (
                <div className="recording-preview">
                    {previewUrl && <audio controls src={previewUrl} />}
                    <Button
                        variant="ink"
                        size="sm"
                        disabled={uploadStatus === "uploading"}
                        onClick={upload}
                    >
                        {uploadStatus === "uploading"
                            ? "Saving…"
                            : "Keep this story"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Discard recording"
                        disabled={uploadStatus === "uploading"}
                        onClick={discard}
                    >
                        <TrashIcon />
                    </Button>
                </div>
            )}
            {uploadStatus && (
                <UploadProgress
                    label="Voice note"
                    status={uploadStatus}
                    progress={uploadProgress}
                    error={error}
                    onRetry={uploadStatus === "error" ? upload : undefined}
                    onDismiss={uploadStatus === "error" ? discard : undefined}
                    layoutId="voice-note-upload"
                />
            )}
            {error && uploadStatus == null && (
                <small className="form-error" role="alert">
                    {error}
                </small>
            )}
        </div>
    );
}
