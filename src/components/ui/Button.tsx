import { forwardRef, type ButtonHTMLAttributes } from "react";
import {
    buttonClassName,
    type ButtonSize,
    type ButtonVariant,
} from "./buttonStyles";

export const Button = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: ButtonVariant;
        size?: ButtonSize;
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
            className={buttonClassName({ variant, size, className })}
            {...props}
        />
    ),
);
Button.displayName = "Button";
