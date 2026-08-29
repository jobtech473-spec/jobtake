"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Zap, Briefcase, FileText, Bell, Bookmark } from "lucide-react";

const ACTIONS = [
  { icon: Briefcase, label: "Browse Jobs",   href: "/jobs" },
  { icon: FileText,  label: "Update Resume", href: "/dashboard/profile" },
  { icon: Bell,      label: "Job Alerts",    href: "/dashboard/settings" },
  { icon: Bookmark,  label: "Saved Jobs",    href: "/dashboard/saved" },
];

export function QuickActionsNavItem() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref} data-testid="side-quick-actions">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex w-full items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-colors font-medium ${
          open ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        <Zap className="h-4 w-4 shrink-0" /> Quick Actions
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-2 z-50 w-56 rounded-2xl border border-zinc-100 bg-white shadow-xl p-2">
          {ACTIONS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-700"
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-zinc-500" />
              </div>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
