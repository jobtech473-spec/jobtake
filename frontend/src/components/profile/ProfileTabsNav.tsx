"use client";
import Link from "next/link";
import {
  LayoutDashboard, User, Zap, FileText, Settings, GraduationCap, Briefcase, LucideIcon,
} from "lucide-react";

type Tab = { key: string; label: string; icon: LucideIcon; href: string };

const TABS: Tab[] = [
  { key: "overview",   label: "Overview",      icon: LayoutDashboard, href: "/dashboard/profile" },
  { key: "personal",   label: "Personal Info", icon: User,            href: "/dashboard/profile/edit" },
  { key: "skills",     label: "Skills",        icon: Zap,             href: "/dashboard/profile?tab=skills" },
  { key: "experience", label: "Experience",    icon: Briefcase,       href: "/dashboard/profile?tab=experience" },
  { key: "education",  label: "Education",     icon: GraduationCap,   href: "/dashboard/profile?tab=education" },
  { key: "resume",     label: "Resume",        icon: FileText,        href: "/dashboard/profile?tab=resume" },
  { key: "settings",   label: "Settings",      icon: Settings,        href: "/dashboard/settings" },
];

export function ProfileTabsNav({ active }: { active: string }) {
  return (
    <div className="flex gap-0 border-t border-zinc-100 overflow-x-auto">
      {TABS.map(t => {
        const isActive = t.key === active;
        return (
          <Link key={t.key} href={t.href}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-3.5 border-b-2 whitespace-nowrap transition ${isActive ? "text-blue-600 border-blue-600" : "text-zinc-400 border-transparent hover:text-zinc-700"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
