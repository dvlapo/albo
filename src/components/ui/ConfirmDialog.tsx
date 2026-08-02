import * as Dialog from "@radix-ui/react-dialog";
import { WarningIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./Button";

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancel",
    pendingLabel = "Working…",
    pending = false,
    error,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    pendingLabel?: string;
    pending?: boolean;
    error?: string;
    onConfirm: () => void;
}) {
    const reducedMotion = useReducedMotion();

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(nextOpen) => {
                if (!pending) onOpenChange(nextOpen);
            }}
        >
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="confirm-dialog__overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content
                            asChild
                            onPointerDownOutside={(event) =>
                                pending && event.preventDefault()
                            }
                        >
                            <motion.section
                                className="confirm-dialog"
                                initial={
                                    reducedMotion
                                        ? { opacity: 0 }
                                        : {
                                              opacity: 0,
                                              transform:
                                                  "translate(-50%, -48%) scale(0.97)",
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    transform: "translate(-50%, -50%) scale(1)",
                                }}
                                exit={
                                    reducedMotion
                                        ? { opacity: 0 }
                                        : {
                                              opacity: 0,
                                              transform:
                                                  "translate(-50%, -49%) scale(0.98)",
                                          }
                                }
                                transition={{
                                    type: "spring",
                                    duration: 0.28,
                                    bounce: 0,
                                }}
                            >
                                <div
                                    className="confirm-dialog__tape"
                                    aria-hidden="true"
                                />
                                <Dialog.Close asChild>
                                    <button
                                        className="confirm-dialog__close"
                                        aria-label="Close confirmation"
                                        disabled={pending}
                                    >
                                        <XIcon />
                                    </button>
                                </Dialog.Close>
                                <span
                                    className="confirm-dialog__icon"
                                    aria-hidden="true"
                                >
                                    <WarningIcon weight="fill" />
                                </span>
                                <Dialog.Title>{title}</Dialog.Title>
                                <Dialog.Description>
                                    {description}
                                </Dialog.Description>
                                {error && (
                                    <p className="form-error" role="alert">
                                        {error}
                                    </p>
                                )}
                                <div className="confirm-dialog__actions">
                                    <Dialog.Close asChild>
                                        <Button
                                            variant="paper"
                                            disabled={pending}
                                        >
                                            {cancelLabel}
                                        </Button>
                                    </Dialog.Close>
                                    <Button
                                        variant="coral"
                                        disabled={pending}
                                        onClick={onConfirm}
                                    >
                                        {pending ? pendingLabel : confirmLabel}
                                    </Button>
                                </div>
                            </motion.section>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
