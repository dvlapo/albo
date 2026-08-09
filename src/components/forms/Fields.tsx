import { ErrorMessage, Field, useField } from "formik";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function TextField({
    label,
    className,
    name,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    className?: string;
}) {
    const [field, meta] = useField<string>(name);
    const inputId = useId();
    const isPassword = props.type === "password";
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className={cn("grid gap-1.5 text-xs font-[750]", className)}>
            <label htmlFor={inputId}>{label}</label>
            <div className={cn(isPassword && "relative")}>
                <input
                    {...field}
                    {...props}
                    id={inputId}
                    name={name}
                    type={isPassword && passwordVisible ? "text" : props.type}
                    className={cn(
                        "w-full resize-y border-[1.5px] border-ink bg-paper-bright px-[0.85rem] py-3 text-base transition-shadow duration-150 focus:outline-none focus:shadow-[3px_3px_0_var(--color-ink)] rounded-[5px_7px_5px_6px] supports-[corner-shape:squircle]:[corner-shape:squircle]",
                        isPassword && "pe-13",
                    )}
                    aria-invalid={meta.touched && Boolean(meta.error)}
                />
                {isPassword && (
                    <button
                        data-cuelume-toggle="toggle"
                        type="button"
                        className="absolute inset-y-0 inset-e-1 grid min-h-11 w-11 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] [&_svg]:size-5"
                        aria-label={
                            passwordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={passwordVisible}
                        onClick={() =>
                            setPasswordVisible((visible) => !visible)
                        }
                    >
                        {passwordVisible ? (
                            <EyeSlashIcon aria-hidden="true" />
                        ) : (
                            <EyeIcon aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>
            <ErrorMessage
                name={name}
                component="small"
                className="text-[#872415] font-bold"
            />
        </div>
    );
}

export function TextAreaField({
    label,
    name,
    rows = 4,
}: {
    label: string;
    name: string;
    rows?: number;
}) {
    return (
        <label className="grid gap-1.5 text-xs font-[750]">
            <span>{label}</span>
            <Field
                as="textarea"
                name={name}
                rows={rows}
                className="w-full resize-y border-[1.5px] border-ink bg-paper-bright px-[0.85rem] py-3 text-base transition-shadow duration-150 focus:outline-none focus:shadow-[3px_3px_0_var(--color-ink)] rounded-[5px_7px_5px_6px]"
            />
            <ErrorMessage
                name={name}
                component="small"
                className="text-[#872415] font-bold"
            />
        </label>
    );
}
