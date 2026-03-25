import { type ComponentPropsWithoutRef, forwardRef } from "react";
import clsx from "clsx";
import styles from "./Card.module.css";

const variantStyles = {
  default: styles.default,
  elevated: styles.elevated,
  outline: styles.outline,
} as const;

type Variant = keyof typeof variantStyles;

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  variant?: Variant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.card, variantStyles[variant], className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h3">>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={clsx(styles.title, className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";