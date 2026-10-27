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
      <span className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 font-mono text-sm text-zinc-700">
        {revealed ? phone : maskPhone(digits)}
        <button
          type="button"
          onClick={() => setRevealed(v => !v)}
          className="text-zinc-400 hover:text-zinc-700"
          title={revealed ? "Hide number" : "Reveal number"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </span>
      <a href={`tel:+91${digits}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <PhoneIcon className="h-3 w-3" /> Call
      </a>
      <a href={`https://wa.me/91${digits}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </a>
    </span>
  );
}
