"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(user.length - visible.length, 3))}@${domain}`;
}

// Masked-by-default email, matching PhoneReveal's reveal-toggle pattern.
export function EmailAction({ email }: { email: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed(v => !v)}
      title={revealed ? "Hide email" : "Click to reveal email"}
      className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 transition"
    >
      {revealed ? email : maskEmail(email)}
      {revealed ? <EyeOff className="h-3.5 w-3.5 text-zinc-400" /> : <Eye className="h-3.5 w-3.5 text-zinc-400" />}
    </button>
  );
}
