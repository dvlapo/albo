import {
    CheckCircleIcon,
    WarningCircleIcon,
    XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { UploadStatus } from "../types/uploads";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

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
            className={cn(
                "grid basis-full gap-2.5 overflow-hidden border-[1.5px] border-ink bg-paper-bright px-4 py-3.5 shadow-[2px_3px_0_rgba(23,23,20,0.85)] rounded-[7px_5px_8px_6px]",
                status === "success" && "bg-[#d9ebcb]",
                status === "error" &&
                    "border-[#872415] bg-[#f9d8d0] shadow-[2px_3px_0_#872415]",
            )}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <AnimatePresence initial={false} mode="wait">
                    <motion.span
                        key={status}
                        className={cn(
                            "grid size-5.5 shrink-0 place-items-center [&_svg]:size-5.5",
                            status === "success" && "text-[#27612d]",
                            status === "error" && "text-[#872415]",
                        )}
                        initial={{
                            opacity: 0,
                            scale: 0.25,
                            filter: "blur(4px)",
                        }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                        transition={{
                            type: "spring",
                            duration: 0.3,
                            bounce: 0,
                        }}
                    >
                        {status === "success" ? (
                            <CheckCircleIcon weight="fill" />
                        ) : status === "error" ? (
                            <WarningCircleIcon weight="fill" />
                        ) : (
                            <span className="size-2.5 rounded-full bg-coral shadow-[0_0_0_4px_rgba(240,109,85,0.18)]" />
                        )}
                    </motion.span>
                </AnimatePresence>
                <span
                    className="min-w-0 flex-1 truncate font-[750]"
                    title={label}
                >
                    {label}
                </span>
                {status === "uploading" && progress != null && (
                    <span className="ms-auto text-xs tabular-nums">
                        {percentage}%
                    </span>
                )}
                {status === "success" && (
                    <strong className="ms-auto text-xs">Saved</strong>
                )}
            </div>

            {(status === "queued" || status === "uploading") && (
                <div
                    className={cn(
                        "h-2 overflow-hidden border border-ink bg-[#ded9cb] transform-[translateZ(0)]",
                        progress == null &&
                            "after:block after:h-full after:w-[38%] after:animate-[upload-indeterminate_1s_linear_infinite] after:bg-coral after:content-['']",
                    )}
                    role="progressbar"
                    aria-label={`${label} upload progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress ?? undefined}
                >
                    {progress != null && (
                        <motion.span
                            className="block h-full w-full origin-left bg-coral"
                            initial={false}
                            animate={{ scaleX: percentage / 100 }}
                            transition={{ duration: 0.15, ease: "linear" }}
                        />
                    )}
                </div>
            )}

            {status === "error" && (
                <div className="flex items-center justify-between gap-4">
                    <p className="m-0 text-sm text-[#872415] font-bold">
                        {error || "The upload failed. Please try again."}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                        {onRetry && (
                            <Button size="sm" variant="paper" onClick={onRetry}>
                                Retry
                            </Button>
                        )}
                        {onDismiss && (
                            <Button
                                size="sm"
                                variant="ghost"
                                aria-label={`Dismiss ${label}`}
                                onClick={onDismiss}
                            >
                                <XIcon />
                            </Button>
                        )}
                    </div>
                </div>
            )}
            <span className="sr-only" aria-live="polite">
                {statusText}
            </span>
        </motion.div>
    );
}
