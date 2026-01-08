"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl"
};

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = "md"
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div
        className={clsx(
          "w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl",
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
          >
            Zamknij
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
