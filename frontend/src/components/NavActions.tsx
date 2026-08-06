"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, ChevronDown, LogOut, LayoutDashboard, User as UserIcon, Briefcase, ShieldCheck } from "lucide-react";

type Props = { user: { id: string; name: string; role: "ADMIN" | "EMPLOYER" | "SEEKER"; avatarUrl: string | null } | null };

export function NavActions({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Link href="/login" className="hidden sm:inline-flex text-sm px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors" data-testid="nav-login">
          Find Job
        </Link>
       <Link
  href="/employers/login"
  className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors"
  data-testid="nav-post-job"
>
  Post a job <ArrowUpRight className="h-3.5 w-3.5" />
</Link>
      </div>
    );
  }

  const dashHref =
    user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer" : "/dashboard";

  return (
    <div className="ml-auto flex items-center gap-2" ref={ref}>
      <Link href="/jobs" className="hidden sm:inline-flex text-sm px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors" data-testid="nav-login">
        Find Job
      </Link>
      <Link href={dashHref} className="hidden sm:inline-flex text-sm px-3 py-2 rounded-full text-zinc-700 hover:text-zinc-950 transition-colors" data-testid="nav-dashboard">
        Dashboard
      </Link>
      <button
        onClick={() => setOpen((s) => !s)}
        className="btn-glass rounded-full pl-1 pr-3 py-1 inline-flex items-center gap-2 text-sm"
        data-testid="nav-user-menu"
      >
        <span className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-blue to-brand-orange grid place-items-center text-white text-[11px] font-semibold">
          {user.name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {open && (
        <div className="absolute right-3 top-[64px] glass-strong rounded-2xl p-2 w-60 shadow-xl" data-testid="user-dropdown">
          <div className="px-3 py-2 text-xs text-zinc-500">Signed in as <span className="font-medium text-zinc-900">{user.name}</span></div>
          <div className="h-px bg-zinc-200/60 my-1" />
          <Link href={dashHref} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-white/80" data-testid="dropdown-dashboard">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          {user.role === "SEEKER" && (
            <Link href="/dashboard/profile" className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-white/80">
              <UserIcon className="h-4 w-4" /> My Profile
            </Link>
          )}
          {user.role === "EMPLOYER" && (
            <Link href="/employer/jobs" className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-white/80">
              <Briefcase className="h-4 w-4" /> My Jobs
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link href="/admin/jobs" className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-white/80">
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </Link>
          )}
          <button onClick={logout} className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-white/80 text-zinc-700" data-testid="dropdown-logout">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
