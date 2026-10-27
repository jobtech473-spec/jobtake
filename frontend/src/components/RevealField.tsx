"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function defaultMask(value: string) {
  return "•".repeat(Math.min(value.length, 10));
}

// Generic masked-by-default value with a click-to-reveal eye toggle,
// matching the style used for phone numbers and emails.
export function RevealField({ value, mask = defaultMask }: { value: string | null; mask?: (v: string) => string }) {
  const [revealed, setRevealed] = useState(false);
  if (!value) return <span className="text-zinc-400">Not provided</span>;

  return (
    <button
      type="button"
      onClick={() => setRevealed(v => !v)}
      title={revealed ? "Hide" : "Click to reveal"}
      className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 transition"
    >
      {revealed ? value : mask(value)}
      {revealed ? <EyeOff className="h-3.5 w-3.5 text-zinc-400" /> : <Eye className="h-3.5 w-3.5 text-zinc-400" />}
    </button>
  );
}
