"use client";
import { X } from "lucide-react";
import { ReactNode } from "react";

export function Modal({
  title, subtitle, onClose, children, maxWidth = "max-w-md",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} p-6 max-h-[85vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pr-6">
          <h2 className="text-lg font-black text-zinc-900">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
