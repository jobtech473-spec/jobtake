"use client";
import { useState } from "react";
import { Eye, EyeOff, Phone as PhoneIcon, MessageCircle } from "lucide-react";

function maskPhone(digits: string) {
  if (digits.length <= 4) return "•".repeat(digits.length);
  return `${digits.slice(0, 2)}${"•".repeat(digits.length - 4)}${digits.slice(-2)}`;
}

// Masked-by-default phone number with a reveal toggle, plus one-tap Call and
// WhatsApp actions — used wherever an admin or employer looks up a
// candidate's contact details.
export function PhoneReveal({ phone }: { phone: string | null }) {
  const [revealed, setRevealed] = useState(false);
  if (!phone) return <span className="text-zinc-400">Not provided</span>;

  const digits = phone.replace(/\D/g, "");

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => setRevealed(v => !v)}
        title={revealed ? "Hide number" : "Click to reveal number"}
        className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 font-mono text-sm text-zinc-700 hover:bg-zinc-100 transition"
      >
        {revealed ? phone : maskPhone(digits)}
        {revealed ? <EyeOff className="h-3.5 w-3.5 text-zinc-400" /> : <Eye className="h-3.5 w-3.5 text-zinc-400" />}
      </button>
      <a
        href={`tel:+91${digits}`}
        className="inline-flex items-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
      >
        <PhoneIcon className="h-3.5 w-3.5" /> Call candidate
      </a>
      <a
        href={`https://wa.me/91${digits}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
    </span>
  );
}
