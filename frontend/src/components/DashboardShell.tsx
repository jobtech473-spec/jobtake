import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Role } from "@prisma/client";
import {
  LayoutDashboard, Briefcase, Bookmark, User as UserIcon,
  FileText, ShieldCheck, Building2, Users as UsersIcon,
  ListChecks, Settings, ExternalLink, Plus, Database,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { QuickActionsNavItem } from "./QuickActionsNavItem";
import { prisma } from "@/lib/prisma";

const NAV: Record<Role, { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  SEEKER: [
    { label: "Overview",        href: "/dashboard",              icon: LayoutDashboard },
    { label: "My Applications", href: "/dashboard/applications", icon: Briefcase },
    { label: "Saved Jobs",      href: "/dashboard/saved",        icon: Bookmark },
    { label: "Quick Actions",   href: "",                        icon: Settings },
    { label: "Profile",         href: "/dashboard/profile",      icon: UserIcon },
    { label: "Settings",        href: "/dashboard/settings",     icon: Settings },
  ],
  EMPLOYER: [
    { label: "Overview",        href: "/employer",               icon: LayoutDashboard },
    { label: "My Jobs",         href: "/employer/jobs",          icon: Briefcase },
    { label: "Post a Job",      href: "/employer/post-job",      icon: FileText },
    { label: "Company Profile", href: "/employer/company",       icon: Building2 },
    { label: "Settings",        href: "/employer/settings",      icon: Settings },
  ],
  ADMIN: [
    { label: "Overview",        href: "/admin",                  icon: ShieldCheck },
    { label: "Jobs",            href: "/admin/jobs",             icon: Briefcase },
    { label: "Companies",       href: "/admin/companies",        icon: Building2 },
    { label: "Users",           href: "/admin/users",            icon: UsersIcon },
    { label: "Master Data",     href: "/admin/options",          icon: Database },
    { label: "Homepage Stats",  href: "/admin/stats",            icon: ListChecks },
  ],
};

export async function DashboardShell({ children, role, current }: { children: React.ReactNode; role: Role; current?: string }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) {
    const dest = user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer" : "/dashboard";
    redirect(dest);
  }

  const items = NAV[role];
  const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  // Get company slug for employer
  let companySlug: string | null = null;
  if (role === "EMPLOYER") {
    const company = await prisma.company.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" }, select: { slug: true } });
    companySlug = company?.slug ?? null;
  }

  const navBody = (
    <>
      {/* Post a New Job button — employer only */}
      {role === "EMPLOYER" && (
        <div className="px-4 pb-4">
          <Link
            href="/employer/post-job"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" /> Post a New Job
          </Link>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((it) => {
          if (it.label === "Quick Actions") {
            return <QuickActionsNavItem key={it.label} />;
          }
          const active = current === it.href || (current?.startsWith(it.href + "/") && it.href !== `/${role === "EMPLOYER" ? "employer" : role === "ADMIN" ? "admin" : "dashboard"}`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-colors font-medium ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
              data-testid={`side-${it.href.split("/").pop()}`}
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-zinc-100 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-zinc-900 text-sm truncate">{user.name}</div>
            <div className="text-xs text-zinc-400 truncate">{user.email}</div>
          </div>
        </div>

        {/* View Company Profile — employer only */}
        {role === "EMPLOYER" && companySlug && (
          <Link
            href={`/jobs?q=${encodeURIComponent(user.name)}`}
            className="flex items-center justify-center gap-2 w-full border border-zinc-200 text-zinc-700 font-semibold text-sm py-2 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            View Company Profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}

        {/* Sign Out */}
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── MOBILE TOP BAR + DRAWER ── */}
      <DashboardMobileNav>{navBody}</DashboardMobileNav>

      <div className="mx-auto max-w-[1400px] grid lg:grid-cols-[220px_minmax(0,1fr)] gap-0">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className="hidden lg:flex bg-white border-r border-zinc-100 min-h-screen lg:sticky lg:top-0 flex-col"
          data-testid="dashboard-sidebar"
          style={{ height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}
        >
          {/* Logo */}
          <div className="px-5 pt-6 pb-4">
            <Logo size={72} />
          </div>

          {navBody}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="min-w-0 overflow-x-hidden p-4 sm:p-6 md:p-8 space-y-6 pb-16 min-h-screen bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
