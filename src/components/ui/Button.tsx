import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Spinner } from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "light" | "ghostOnDark" | "text" | "danger";

interface CommonProps {
  variant?: ButtonVariant;
  compact?: boolean;
  fullWidth?: boolean;
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
    loading?: boolean;
    /** Text shown while loading, e.g. "Adding…" (Figma: ADD TO CART → ADDING...). */
    loadingText?: string;
    /** React 19 passes refs as props (used for focus management). */
    ref?: Ref<HTMLButtonElement>;
  };

type LinkProps = CommonProps & {
  href: string;
  prefetch?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page";
};

function classes({ variant = "primary", compact, fullWidth, wrap, className }: CommonProps, loading?: boolean) {
  return [
    styles.button,
    styles[variant],
    compact ? styles.compact : "",
    fullWidth ? styles.full : "",
    wrap ? styles.wrap : "",
    loading ? styles.loading : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const { href, children, prefetch, ...rest } = props as LinkProps;
    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={classes(props)}
        aria-label={rest["aria-label"]}
        aria-current={rest["aria-current"]}
      >
        {children}
      </Link>
    );
  }
  const {
    variant: _v,
    compact: _c,
    fullWidth: _f,
    wrap: _w,
    className: _cn,
    loading,
    loadingText,
    children,
    type = "button",
    disabled,
    ...rest
  } = props as ButtonProps;
  void _v;
  void _c;
  void _f;
  void _w;
  void _cn;
  const onDark = props.variant === "primary" || props.variant === "danger" || props.variant === undefined;
  return (
    <button
      type={type}
      className={classes(props, loading)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="sm" onDark={onDark} />
          <span aria-live="polite">{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
