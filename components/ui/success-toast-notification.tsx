"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";

type SuccessToastNotificationProps = {
  title: string;
  description: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SuccessToastNotification({
  title,
  description,
  onClose,
  actionLabel,
  onAction,
}: SuccessToastNotificationProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-[var(--success)]" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-2 font-medium text-primary transition hover:opacity-80"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onClose}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
