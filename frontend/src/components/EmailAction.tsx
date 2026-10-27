import { Mail } from "lucide-react";

// Same bordered-button treatment as PhoneReveal's Call/WhatsApp buttons, so
// the email row looks consistent with the phone row next to it.
export function EmailAction({ email }: { email: string }) {
  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span>{email}</span>
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
      >
        <Mail className="h-3.5 w-3.5" /> Email
      </a>
    </span>
  );
}
