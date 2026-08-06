import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield, Lock, Eye, Smartphone, Activity,
  Bell, Mail, Globe, Briefcase,
  Users, UserCog, Trash2, ChevronRight,
  Zap, Building2, ListChecks, Download, HeadphonesIcon,
  ExternalLink,
} from "lucide-react";
import { ChangePasswordButton } from "@/components/settings/ChangePasswordButton";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { EmailNotificationsToggle } from "@/components/settings/EmailNotificationsToggle";
import { TwoFactorRow } from "@/components/settings/TwoFactorRow";
import { SessionsRow } from "@/components/settings/SessionsRow";

const Row = ({
  icon, title, desc, action,
}: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-zinc-800">{title}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{desc}</div>
      </div>
    </div>
    {action ?? <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />}
  </div>
);

export default async function EmployerSettingsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") redirect("/employers/login");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/employers/login");

  return (
    <DashboardShell role="EMPLOYER" current="/employer/settings">
      <div className="grid lg:grid-cols-[1fr_260px] gap-6">

        {/* ── LEFT ── */}
        <div className="space-y-4">

          {/* Header */}
          <div className="mb-2">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">Settings</p>
            <h1 className="text-2xl font-black text-zinc-900 mt-1">Employer Settings</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your account, preferences, team and security.</p>
          </div>

          {/* ── Account & Security ── */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 text-sm">Account &amp; Security</div>
                <div className="text-xs text-zinc-400">Manage your password and keep your account secure.</div>
              </div>
            </div>
            <div className="divide-y divide-zinc-50 grid md:grid-cols-2">
              <Row icon={<Lock className="h-4 w-4 text-zinc-400" />}       title="Change Password"          desc="Update your account password"
                action={<ChangePasswordButton className="text-sm font-semibold text-blue-600" />} />
              <Row icon={<Eye className="h-4 w-4 text-zinc-400" />}        title="Active Sessions"           desc="Manage devices and sessions"
                action={<SessionsRow />} />
              <Row icon={<Smartphone className="h-4 w-4 text-zinc-400" />} title="Two-Factor Authentication" desc="Add extra layer of security"
                action={<TwoFactorRow initialEnabled={user.twoFactorEnabled} />} />
              <Row icon={<Activity className="h-4 w-4 text-zinc-400" />}   title="Login &amp; Security Activity" desc="See recent account activity" />
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
              <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 text-sm">Notifications</div>
                <div className="text-xs text-zinc-400">Choose what notifications you want to receive.</div>
              </div>
            </div>
            <div className="divide-y divide-zinc-50 grid md:grid-cols-2">
              <Row icon={<Mail className="h-4 w-4 text-zinc-400" />}    title="New Applicant Alerts"     desc="Email notifications for account activity"
                action={<EmailNotificationsToggle initialEnabled={user.emailNotifications} />} />
              <Row icon={<Briefcase className="h-4 w-4 text-zinc-400" />} title="Job Post Approved"      desc="When admin approves your posting" />
              <Row icon={<Bell className="h-4 w-4 text-zinc-400" />}    title="Applicant Status Updates" desc="Notify when applicant updates their profile" />
              <Row icon={<Globe className="h-4 w-4 text-zinc-400" />}   title="Weekly Hiring Report"     desc="Summary of your job performance" />
            </div>
          </div>

          {/* ── Team & Access ── */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
              <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 text-sm">Team &amp; Access</div>
                <div className="text-xs text-zinc-400">Manage your team members and their access.</div>
              </div>
            </div>
            <div className="divide-y divide-zinc-50 grid md:grid-cols-2">
              <Row icon={<Users className="h-4 w-4 text-zinc-400" />}   title="Team Members"       desc="Add or manage your team" />
              <Row icon={<UserCog className="h-4 w-4 text-zinc-400" />} title="Roles &amp; Permissions" desc="Manage access and permissions" />
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100">
              <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="font-bold text-red-600 text-sm">Danger Zone</div>
                <div className="text-xs text-zinc-400">Irreversible account actions.</div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">Delete Account</div>
                  <div className="text-xs text-zinc-400">Permanently delete your account</div>
                </div>
              </div>
              <DeleteAccountButton />
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-blue-500" />
              <h3 className="font-bold text-zinc-900 text-sm">Quick Actions</h3>
            </div>
            <div className="space-y-1">
              {[
                { icon: <Building2 className="h-4 w-4 text-zinc-400" />,  label: "View Company Profile",  href: "/employer/company", external: true },
                { icon: <Briefcase className="h-4 w-4 text-zinc-400" />,  label: "Manage Jobs",           href: "/employer/jobs" },
                { icon: <Users className="h-4 w-4 text-zinc-400" />,      label: "Invite Team Member",    href: "#" },
                { icon: <Download className="h-4 w-4 text-zinc-400" />,   label: "Download Reports",      href: "#" },
              ].map(({ icon, label, href, external }) => (
                <Link key={label} href={href}
                  className="flex items-center justify-between text-sm font-medium text-zinc-700 hover:text-blue-600 py-2.5 px-2 rounded-xl hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-3">{icon} {label}</div>
                  {external && <ExternalLink className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-400" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <HeadphonesIcon className="h-4 w-4 text-orange-500" />
              <h3 className="font-bold text-zinc-900 text-sm">Need Help?</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">Need assistance? We&apos;re here to help you with any questions.</p>
            <button className="w-full border border-zinc-200 text-zinc-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-zinc-50 transition">
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
