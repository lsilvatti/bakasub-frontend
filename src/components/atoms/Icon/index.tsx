import type { ElementType, SVGProps } from "react";
import clsx from "clsx";
import styles from "./Icon.module.css";

const sizeStyles = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

type Size = keyof typeof sizeStyles;

export type IconProps = SVGProps<SVGSVGElement> & {
  icon: ElementType;
  size?: Size;
};

export function Icon({ icon: Component, size = "sm", className, ...rest }: IconProps) {
  return (
    <Component
      className={clsx(sizeStyles[size], className)}
      aria-hidden="true"
      {...rest}
    />
  );
}