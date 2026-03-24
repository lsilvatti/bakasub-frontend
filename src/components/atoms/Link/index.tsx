import { Link as RouterLink } from "react-router-dom";
import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import styles from "./Link.module.css";

const variantsMap = {
  default: styles.default,
  primary: styles.primary,
  muted: styles.muted,
  nav: styles.nav,
  unstyled: styles.unstyled,
} as const;

type Variant = keyof typeof variantsMap;

type BaseLinkProps = {
  variant?: Variant;
  className?: string;
};

type ExternalLinkProps = BaseLinkProps &
  ComponentPropsWithoutRef<"a"> & {
    external: true;
  };

type InternalLinkProps = BaseLinkProps &
  ComponentPropsWithoutRef<typeof RouterLink> & {
    external?: false;
  };

type LinkProps = InternalLinkProps | ExternalLinkProps;

export function Link({
  variant = "default",
  className,
  children,
  ...rest
}: LinkProps) {
  
  const classes = clsx(styles.base, variantsMap[variant], className);

  if (rest.external) {
    const { external, href, ...anchorProps } = rest;
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const { external, to, ...routerProps } = rest;

  return (
    <RouterLink to={to} className={classes} {...routerProps}>
      {children}
    </RouterLink>
  );
}