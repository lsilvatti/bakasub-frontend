import React, { type ElementType, type ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import styles from "./Button.module.css";

const variantStyles = {
  primary: styles.primary,
  outline: styles.outline,
  ghost: styles.ghost,
} as const;

const sizeStyles = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const iconSizeMap = {
  sm: styles.iconSm,
  md: styles.iconMd,
  lg: styles.iconLg,
} as const;

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

type BaseProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  rounded?: boolean;
  className?: string;
  iconLeft?: ElementType;
  iconRight?: ElementType;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & {
    to?: never;
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps> & {
    to: string;
    href?: never;
    disabled?: boolean;
  };

type ButtonAsExternalLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & {
    href: string;
    to?: never;
    disabled?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsExternalLink;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  rounded = false,
  className,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonProps) {
  const classes = clsx(
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    rounded && styles.rounded,
    className
  );

  const iconClass = iconSizeMap[size];

  const content = (
    <>
      {IconLeft && <IconLeft className={iconClass} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={iconClass} aria-hidden="true" />}
    </>
  );

  if ("to" in rest && rest.to != null) {
    const { disabled, to, ...linkRest } = rest as ButtonAsLink;

    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {content}
        </span>
      );
    }

    return (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  if ("href" in rest && rest.href != null) {
    const { disabled, href, ...anchorRest } = rest as ButtonAsExternalLink;

    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {content}
        </span>
      );
    }

    return (
      <a href={href} className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {content}
    </button>
  );
}