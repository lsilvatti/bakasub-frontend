import { type ElementType, type ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import styles from "./Button.module.css";

const variantStyles = {
  primary: styles.primary,
  secondary: styles.secondary,
  success: styles.success,
  error: styles.error,
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
  loading?: boolean;
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
  loading = false,
  className,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonProps) {
  const explicitlyDisabled = "disabled" in rest ? rest.disabled : false;
  const isDisabled = explicitlyDisabled || loading;

  const classes = clsx(
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    rounded && styles.rounded,
    loading && styles.isLoading,
    isDisabled && styles.disabled,
    className
  );

  const iconClass = iconSizeMap[size];

  const Spinner = () => (
    <svg className={clsx(styles.spinner, iconClass)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const content = (
    <>
      {loading ? (
        <Spinner />
      ) : (
        IconLeft && <IconLeft className={iconClass} aria-hidden="true" />
      )}
      {children}
      {!loading && IconRight && <IconRight className={iconClass} aria-hidden="true" />}
    </>
  );

  if ("to" in rest && rest.to != null) {
    const { disabled, to, ...linkRest } = rest as ButtonAsLink;

    if (isDisabled) {
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

    if (isDisabled) {
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
    <button className={classes} disabled={isDisabled} {...(rest as Omit<ButtonAsButton, 'disabled'>)}>
      {content}
    </button>
  );
}