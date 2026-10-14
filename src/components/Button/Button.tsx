/**
 * @file components/Button/Button.tsx
 * @description Accessible, styled Button component.
 *
 * @example
 * <Button variant="primary" onClick={() => {}}>Save</Button>
 * <Button variant="secondary" isLoading>Saving…</Button>
 */

import React from "react";
import styles from "./Button.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={[styles.button, styles[variant], styles[size], className].join(
        " ",
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && leftIcon && (
        <span className={styles.icon}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className={styles.icon}>{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
