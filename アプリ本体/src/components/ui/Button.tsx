import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../icons";

type Variant = "primary" | "secondary" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-blue-700 border border-brand",
  secondary: "bg-surface text-ink border border-border hover:bg-subtle",
  danger: "bg-surface text-red-700 border border-border hover:bg-red-50",
};

export function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: { variant?: Variant; icon?: IconName } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className = "",
  ...props
}: { icon: IconName; label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand ${className}`}
      {...props}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
