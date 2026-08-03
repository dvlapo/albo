import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Button = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: "ink" | "paper" | "coral" | "ghost";
        size?: "sm" | "md" | "lg";
        sound?: boolean;
    }
>(
    (
        {
            className,
            variant = "ink",
            size = "md",
            sound = true,
            type = "button",
            disabled,
            ...props
        },
        ref,
    ) => (
        <button
            ref={ref}
            type={type}
            disabled={disabled}
            data-cuelume-press={sound && !disabled ? "press" : undefined}
            data-cuelume-release={sound && !disabled ? "release" : undefined}
            className={cn(
                "button",
                `button--${variant}`,
                `button--${size}`,
                "squircle",
                className,
            )}
            {...props}
        />
    ),
);
Button.displayName = "Button";
