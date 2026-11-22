import { ICON_PATHS, type IconName } from "./icon-paths";

export type { IconName };

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Provide a label only when the icon conveys meaning on its own. */
  label?: string;
}

/** Material Symbols Outlined glyphs — the icon family used in the approved Figma. */
export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
