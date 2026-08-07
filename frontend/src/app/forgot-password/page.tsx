"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center px-8 py-5 border-b border-zinc-100">
        <Logo size={72} />
      </header>

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-sm w-full">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>

          {submitted ? (
            <div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-zinc-900">Check your email</h1>
              <p className="text-zinc-500 mt-2 text-sm">
                If an account exists for <span className="font-semibold text-zinc-700">{email}</span>, we&apos;ve sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">Forgot your password?</h1>
              <p className="text-zinc-500 mt-2 text-sm">
                Enter the email address linked to your account and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                  Send reset link <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
