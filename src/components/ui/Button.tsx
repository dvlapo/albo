import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "ink" | "paper" | "coral" | "ghost"; size?: "sm" | "md" | "lg" }>(
  ({ className, variant = "ink", size = "md", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn("button", `button--${variant}`, `button--${size}`, className)} {...props} />
  ),
);
Button.displayName = "Button";
