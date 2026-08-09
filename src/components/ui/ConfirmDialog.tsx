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
                                className="fixed inset-0 z-100 bg-ink/48 backdrop-blur-[5px] [@media(prefers-reduced-transparency:reduce)]:bg-ink/72 [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none"
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
                                className="fixed top-1/2 left-1/2 z-101 w-[min(calc(100vw-2rem),460px)] rounded-[10px_7px_11px_8px] border-[1.5px] border-ink bg-paper-bright p-[2.1rem] text-start shadow-[8px_10px_0_rgba(23,23,20,0.88),0_24px_70px_rgba(23,23,20,0.3)] max-[520px]:px-5 max-[520px]:pt-7 max-[520px]:pb-5 max-[520px]:shadow-[5px_7px_0_rgba(23,23,20,0.88),0_18px_50px_rgba(23,23,20,0.28)]"
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
                                    className="absolute -top-3.25 left-1/2 h-6.75 w-23 -translate-x-1/2 rotate-[-1.5deg] border-x border-ink/10 bg-yellow/76"
                                    aria-hidden="true"
                                />
                                <Dialog.Close asChild>
                                    <button
                                        className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center rounded-lg border-0 bg-transparent transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45"
                                        aria-label="Close confirmation"
                                        disabled={pending}
                                    >
                                        <XIcon />
                                    </button>
                                </Dialog.Close>
                                <span
                                    className="mb-4 grid size-10.5 -rotate-2 place-items-center rounded-[8px_6px_9px_7px] border-[1.5px] border-[#872415] bg-[#f9d8d0] text-[#872415] [&_svg]:size-5.75"
                                    aria-hidden="true"
                                >
                                    <WarningIcon weight="fill" />
                                </span>
                                <Dialog.Title className="mb-2.5 max-w-87.5 text-[clamp(2rem,7vw,2.7rem)]">
                                    {title}
                                </Dialog.Title>
                                <Dialog.Description className="max-w-[48ch] text-graphite">
                                    {description}
                                </Dialog.Description>
                                {error && (
                                    <p
                                        className="text-[#872415] font-bold"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                )}
                                <div className="mt-6 flex justify-end gap-3 max-[520px]:flex-col-reverse max-[520px]:[&>button]:w-full">
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
