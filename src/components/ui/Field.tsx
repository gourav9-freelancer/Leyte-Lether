"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Field.module.css";

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  labelAction?: ReactNode;
  children: ReactNode;
}

function FieldShell({ id, label, required, optional, hint, error, labelAction, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {" "}*
            </span>
          )}
          {optional && <span className={styles.optional}> (optional)</span>}
        </label>
        {labelAction}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <Icon name="error" size={16} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return [error ? `${id}-error` : "", hint && !error ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  icon?: IconName;
  labelAction?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, icon, labelAction, required, className, type = "text", ...rest },
  ref,
) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  return (
    <FieldShell id={id} label={label} required={required} optional={optional} hint={hint} error={error} labelAction={labelAction}>
      <div className={styles.control}>
        {icon && <Icon name={icon} size={20} className={styles.leadingIcon} />}
        <input
          ref={ref}
          id={id}
          type={isPassword && reveal ? "text" : type}
          className={[
            styles.input,
            icon ? styles.withIcon : "",
            isPassword ? styles.withAction : "",
            error ? styles.invalid : "",
            className ?? "",
          ].join(" ")}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.action}
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
          >
            <Icon name={reveal ? "visibility_off" : "visibility"} size={20} />
          </button>
        )}
      </div>
    </FieldShell>
  );
});

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, optional, required, ...rest },
  ref,
) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={id}
        className={[styles.textarea, error ? styles.invalid : ""].join(" ")}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </FieldShell>
  );
});

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  children: ReactNode;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, required, children, hideLabel, ...rest },
  ref,
) {
  const id = useId();
  const select = (
    <div className={styles.control}>
      <select
        ref={ref}
        id={id}
        className={[styles.select, error ? styles.invalid : ""].join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-label={hideLabel ? label : undefined}
        {...rest}
      >
        {children}
      </select>
      <Icon name="keyboard_arrow_down" size={20} className={styles.chevron} />
    </div>
  );
  if (hideLabel) return select;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      {select}
    </FieldShell>
  );
});

export { styles as fieldStyles };
