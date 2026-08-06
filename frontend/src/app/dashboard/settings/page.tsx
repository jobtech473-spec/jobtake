import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Lock, Bell, Trash2, Shield, Eye,
} from "lucide-react";
import { ProfileEditor } from "@/components/settings/ProfileEditor";
import { ChangePasswordButton } from "@/components/settings/ChangePasswordButton";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { EmailNotificationsToggle } from "@/components/settings/EmailNotificationsToggle";
import { TwoFactorRow } from "@/components/settings/TwoFactorRow";
import { SessionsRow } from "@/components/settings/SessionsRow";

export default async function SeekerSettingsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/login");

  return (
    <DashboardShell role="SEEKER" current="/dashboard/settings">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">Settings</p>
        <h1 className="text-2xl font-black text-zinc-900 mt-1">Account Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="max-w-3xl space-y-4">

        {/* ── Profile Information ── */}
        <ProfileEditor initialName={user.name ?? ""} email={user.email} />

        {/* ── Security ── */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Lock className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-zinc-900 text-sm">Security</div>
              <div className="text-xs text-zinc-400">Manage your password and account security.</div>
            </div>
          </div>
          <div className="divide-y divide-zinc-50">

            {/* Password */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">Password</div>
                  <div className="text-xs text-zinc-400">
                    Last changed: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"}
                  </div>
                </div>
              </div>
              <ChangePasswordButton />
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">Two-Factor Authentication</div>
                  <div className="text-xs text-zinc-400">Add an extra layer of security to your account.</div>
                </div>
              </div>
              <TwoFactorRow initialEnabled={user.twoFactorEnabled} />
            </div>

            {/* Active Sessions */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">Active Sessions</div>
                  <div className="text-xs text-zinc-400">Manage where you&apos;re logged in.</div>
                </div>
              </div>
              <SessionsRow />
            </div>

          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
            <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="font-bold text-zinc-900 text-sm">Preferences</div>
              <div className="text-xs text-zinc-400">Manage your notification and communication preferences.</div>
            </div>
          </div>
          <div className="divide-y divide-zinc-50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">Email Notifications</div>
                  <div className="text-xs text-zinc-400">Choose what updates you want to receive.</div>
                </div>
              </div>
              <EmailNotificationsToggle initialEnabled={user.emailNotifications} />
            </div>
          </div>
        </div>

        {/* ── Account / Danger Zone ── */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="font-bold text-zinc-900 text-sm">Account</div>
              <div className="text-xs text-zinc-400">Manage your account settings.</div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-zinc-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-800">Delete Account</div>
                <div className="text-xs text-zinc-400">Permanently delete your account and all data.</div>
              </div>
            </div>
            <DeleteAccountButton />
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
