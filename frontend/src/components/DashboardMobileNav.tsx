"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

export function DashboardMobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-zinc-100">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo size={40} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-zinc-700" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
              <Logo size={44} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <div className="flex flex-1 flex-col" onClickCapture={() => setOpen(false)}>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
