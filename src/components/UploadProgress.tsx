import {
    CheckCircleIcon,
    WarningCircleIcon,
    XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { UploadStatus } from "../types/uploads";
import { Button } from "./ui/Button";

export function UploadProgress({
    label,
    status,
    progress,
    error,
    onRetry,
    onDismiss,
    layoutId,
}: {
    label: string;
    status: UploadStatus;
    progress: number | null;
    error?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    layoutId?: string;
}) {
    const reducedMotion = useReducedMotion();
    const percentage = progress ?? 0;
    const statusText =
        status === "queued"
            ? `${label} is queued`
            : status === "uploading"
              ? `${label} is ${progress == null ? "uploading" : `${percentage}% uploaded`}`
              : status === "success"
                ? `${label} was saved`
                : `${label} failed to upload${error ? `: ${error}` : ""}`;

    return (
        <motion.div
            layout
            layoutId={layoutId}
            className={`upload-card upload-card--${status}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="upload-card__heading">
                <AnimatePresence initial={false} mode="wait">
                    <motion.span
                        key={status}
                        className="upload-card__icon"
                        initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    >
                        {status === "success" ? (
                            <CheckCircleIcon weight="fill" />
                        ) : status === "error" ? (
                            <WarningCircleIcon weight="fill" />
                        ) : (
                            <span className="upload-card__dot" />
                        )}
                    </motion.span>
                </AnimatePresence>
                <span className="upload-card__label" title={label}>{label}</span>
                {status === "uploading" && progress != null && (
                    <span className="upload-card__percentage tabular">{percentage}%</span>
                )}
                {status === "success" && <strong>Saved</strong>}
            </div>

            {(status === "queued" || status === "uploading") && (
                <div
                    className={`upload-meter${progress == null ? " upload-meter--indeterminate" : ""}`}
                    role="progressbar"
                    aria-label={`${label} upload progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress ?? undefined}
                >
                    {progress != null && (
                        <motion.span
                            initial={false}
                            animate={{ scaleX: percentage / 100 }}
                            transition={{ duration: 0.15, ease: "linear" }}
                        />
                    )}
                </div>
            )}

            {status === "error" && (
                <div className="upload-card__error">
                    <p>{error || "The upload failed. Please try again."}</p>
                    <div>
                        {onRetry && <Button size="sm" variant="paper" onClick={onRetry}>Retry</Button>}
                        {onDismiss && <Button size="sm" variant="ghost" aria-label={`Dismiss ${label}`} onClick={onDismiss}><XIcon /></Button>}
                    </div>
                </div>
            )}
            <span className="sr-only" aria-live="polite">{statusText}</span>
        </motion.div>
    );
}
