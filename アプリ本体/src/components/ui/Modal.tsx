"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./Button";

/** ×ボタン・外側クリック・Escキーで閉じるモーダル (4.2.2) */
export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-[720px]";
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`my-8 w-full ${width} overflow-hidden rounded-2xl bg-surface shadow-2xl outline-none`}
      >
        <div className="flex items-start gap-3 border-b border-border px-7 pt-6 pb-5">
          <div className="min-w-0 flex-1">
            <div id={titleId} className="flex flex-wrap items-center gap-2.5 text-lg font-bold">
              {title}
            </div>
            {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
          </div>
          <IconButton icon="close" label="閉じる" onClick={onClose} />
        </div>
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap items-center gap-3 bg-canvas px-7 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** 削除前の確認ダイアログ (F-C03) */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "削除する",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-label={title} className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl">
        <h2 className="text-base font-bold">{title}</h2>
        <div className="mt-2 text-sm text-muted">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-subtle">
            キャンセル
          </button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
