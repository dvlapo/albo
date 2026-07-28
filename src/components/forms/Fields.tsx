import { ErrorMessage, Field, useField } from "formik";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function TextField({ label, className, name, ...props }: InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; className?: string }) {
  const [field, meta] = useField<string>(name);
  const inputId = useId();
  const isPassword = props.type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);

  return <div className={cn("field", className)}>
    <label htmlFor={inputId}>{label}</label>
    <div className={cn(isPassword && "password-field")}>
      <input
        {...field}
        {...props}
        id={inputId}
        name={name}
        type={isPassword && passwordVisible ? "text" : props.type}
        className="paper-input"
        aria-invalid={meta.touched && Boolean(meta.error)}
      />
      {isPassword && (
        <button
          type="button"
          className="password-toggle"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          onClick={() => setPasswordVisible((visible) => !visible)}
        >
          {passwordVisible ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      )}
    </div>
    <ErrorMessage name={name} component="small" />
  </div>;
}

export function TextAreaField({ label, name, rows = 4 }: { label: string; name: string; rows?: number }) {
  return <label className="field"><span>{label}</span><Field as="textarea" name={name} rows={rows} className="paper-input" /><ErrorMessage name={name} component="small" /></label>;
}
