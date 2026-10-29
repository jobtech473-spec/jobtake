import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getManagedOptions } from "@/lib/job-options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, CreditCard } from "lucide-react";
import { PostJobForm } from "./PostJobForm";

export const dynamic = "force-dynamic";

export default async function PostJobPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/employers/login");
  if (me.role !== "EMPLOYER" && me.role !== "ADMIN") redirect("/dashboard");
  const [cats, options, company] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getManagedOptions(true, true),
    prisma.company.findFirst({
      where: { ownerId: me.id },
      orderBy: { createdAt: "asc" },
      select: {
        name: true, logoUrl: true, description: true, headquarters: true, founded: true, verified: true, jobCredits: true,
      },
    }),
  ]);

  const blocked = me.role === "EMPLOYER" && !company?.verified;
  const outOfCredits = me.role === "EMPLOYER" && !!company?.verified && (company?.jobCredits ?? 0) <= 0;

  return (
    <DashboardShell role={me.role === "ADMIN" ? "ADMIN" : "EMPLOYER"} current="/employer/post-job">
      <div className="mb-6">
        <a href="/employer/jobs" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition mb-1">← Back to My Jobs</a>
        <h1 className="text-2xl font-black text-zinc-900">Post a New Job</h1>
        <p className="text-sm text-zinc-500 mt-1">Fill in the details below to create your job post. Fields marked with <span className="text-red-500">*</span> are required.</p>
      </div>
      {blocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-900">GST Verification Pending</h2>
          <p className="text-sm text-zinc-600 mt-2">
            You can post jobs once our admin team verifies your company&apos;s GST certificate. Make sure you&apos;ve uploaded it on your Company Profile.
          </p>
          <Link href="/employer/company" className="inline-flex items-center gap-1.5 mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition">
            Go to Company Profile
          </Link>
        </div>
      ) : outOfCredits ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center max-w-xl mx-auto">
          <CreditCard className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-900">You&apos;re out of job posting credits</h2>
          <p className="text-sm text-zinc-600 mt-2">
            Choose a plan to get more job posting credits and publish your next job.
          </p>
          <Link href="/employer/pricing" className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition">
            View Plans
          </Link>
        </div>
      ) : (
        <PostJobForm categories={cats.map(c => ({ id: c.id, name: c.name }))} options={options} isAdmin={me.role === "ADMIN"} company={company} />
      )}
    </DashboardShell>
  );
}
