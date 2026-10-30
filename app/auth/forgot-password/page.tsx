"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Mail, AlertCircle, CheckCircle2, Loader2, KeyRound, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setGeneratedCode(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/email/send-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to issue password reset code.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset code generated successfully!");
      if (data?.data?.code) {
        setGeneratedCode(data.data.code);
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(cleanEmail)}&code=${encodeURIComponent(data.data.code)}`);
        }, 1500);
      } else {
        router.push(`/auth/reset-password?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/15 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-md glassmorphism rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl border border-card-border/80 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg shadow-accent-violet/30 border border-white/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Forgot Password</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your registered email to receive a recovery code
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-green-400 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">{successMsg}</div>
          </div>
        )}

        {generatedCode && (
          <div className="bg-accent-violet/10 border border-accent-violet/30 rounded-2xl p-3.5 text-xs text-zinc-300">
            <p className="font-semibold text-accent-violet">Your 6-Digit Reset Code:</p>
            <p className="font-mono text-base font-bold text-accent-violet tracking-wider mt-1">{generatedCode}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-violet/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4.5 h-4.5" />
                <span>Send Reset Code</span>
              </>
            )}
          </button>

          <div className="pt-2">
            <Link
              href="/auth/signin"
              className="text-xs font-mono text-zinc-500 hover:text-text-primary transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
