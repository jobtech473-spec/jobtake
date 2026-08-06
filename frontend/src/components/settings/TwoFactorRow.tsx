"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "./Modal";

type Step = "idle" | "loading-setup" | "setup" | "confirming" | "enabled" | "disable";

export function TwoFactorRow({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openModal() {
    setOpen(true);
    setError(null);
    setCode("");
    setPassword("");
    if (enabled) {
      setStep("disable");
    } else {
      startSetup();
    }
  }

  async function startSetup() {
    setStep("loading-setup");
    setError(null);
    try {
      const res = await fetch("/api/account/2fa/setup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to start setup");
      setSecret(data.secret);
      setStep("setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start setup");
      setStep("setup");
    }
  }

  async function confirm() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setEnabled(true);
      setStep("enabled");
      setTimeout(() => setOpen(false), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to disable 2FA");
      setEnabled(false);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={openModal} type="button" className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${enabled ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
          {enabled ? "Enabled" : "Not enabled"}
        </span>
        <ChevronRight className="h-4 w-4 text-zinc-300" />
      </button>

      {open && (
        <Modal
          title="Two-Factor Authentication"
          subtitle={step === "disable" ? "Enter your password to turn off 2FA." : "Add an extra layer of security using an authenticator app."}
          onClose={() => setOpen(false)}
        >
          {error && <div className="mb-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}

          {step === "loading-setup" && (
            <div className="text-sm text-zinc-500">Generating your secret…</div>
          )}

          {step === "setup" && secret && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Enter this key manually into Google Authenticator, Authy, or any TOTP app, then enter the 6-digit code it generates.
              </p>
              <div className="font-mono text-sm font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 break-all select-all">
                {secret}
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">6-digit code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="000000"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-300 tracking-widest font-mono"
                />
              </div>
              <button
                onClick={confirm}
                disabled={loading || code.length !== 6}
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {loading ? "Verifying…" : "Verify & Enable"}
              </button>
            </div>
          )}

          {step === "enabled" && (
            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              Two-factor authentication enabled.
            </div>
          )}

          {step === "disable" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-red-300"
                />
              </div>
              <button
                onClick={disable}
                disabled={loading || !password}
                type="button"
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {loading ? "Disabling…" : "Disable Two-Factor Authentication"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
