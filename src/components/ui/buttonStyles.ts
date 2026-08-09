import { cn } from "../../lib/utils";

export type ButtonVariant = "ink" | "paper" | "coral" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
    ink: "bg-ink text-paper-bright shadow-[2px_3px_0_#88847b]",
    paper: "bg-paper-bright text-ink shadow-[2px_3px_0_var(--color-ink)]",
    coral: "bg-coral text-ink shadow-paper",
    ghost: "border-transparent bg-transparent shadow-none",
};

const sizes: Record<ButtonSize, string> = {
    sm: "min-h-10 px-3 py-[0.45rem] text-xs",
    md: "px-4 py-[0.65rem]",
    lg: "px-[1.2rem] py-[0.85rem]",
};

export function buttonClassName({
    variant = "ink",
    size = "md",
    className,
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
} = {}) {
    return cn(
        "inline-flex min-h-11 cursor-pointer select-none items-center justify-center gap-2 rounded-[8px_6px_9px_7px] border-[1.5px] border-ink font-[750] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.96] active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 [--squircle-radius:20px] supports-[corner-shape:squircle]:[corner-shape:squircle] supports-[corner-shape:squircle]:rounded-(--squircle-radius)",
        variants[variant],
        sizes[size],
        className,
    );
}
