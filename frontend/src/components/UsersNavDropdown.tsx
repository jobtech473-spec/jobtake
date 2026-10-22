"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Users as UsersIcon, User as UserIcon, Building2, Users2 } from "lucide-react";

const ACTIONS = [
  { icon: Users2,   label: "All Users", href: "/admin/users" },
  { icon: UserIcon, label: "Seekers",   href: "/admin/users?role=SEEKER" },
  { icon: Building2, label: "Employers", href: "/admin/users?role=EMPLOYER" },
];

export function UsersNavDropdown({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.right + 8 });
    }
    setOpen(v => !v);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        data-testid="side-users"
        className={`flex w-full items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-colors font-medium ${
          active || open ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        <UsersIcon className="h-4 w-4 shrink-0" /> Users
      </button>

      {open && coords && (
        <div
          ref={popupRef}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="z-50 w-52 rounded-2xl border border-zinc-100 bg-white shadow-xl p-2"
        >
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
    </>
  );
}
