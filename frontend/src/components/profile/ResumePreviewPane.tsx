import type { ResumePreview } from "@/lib/resume-preview";

// Shared resume viewer — used on the candidate's own dashboard, the admin
// user profile, and the employer candidate profile, so the preview looks
// identical no matter who is viewing it.
export function ResumePreviewPane({
  resume, preview,
}: {
  resume: { id: string; fileName: string } | null | undefined;
  preview: ResumePreview | null | undefined;
}) {
  if (!resume) return <p className="text-sm text-zinc-400">No resume uploaded.</p>;

  return (
    <>
      <div className="mb-3 text-xs text-zinc-500">{resume.fileName}</div>
      {preview?.type === "html" && (
        <div
          className="prose prose-sm prose-zinc max-w-none border border-zinc-100 rounded-xl p-5 max-h-[700px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      )}
      {preview?.type === "unsupported" && (
        <div className="border border-zinc-100 rounded-xl p-5 text-center">
          <p className="text-sm text-zinc-500">Preview isn&apos;t available for this file type.</p>
          <a href={`/api/resumes/${resume.id}`} target="_blank" className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline">
            Open {resume.fileName}
          </a>
        </div>
      )}
    </>
  );
}
