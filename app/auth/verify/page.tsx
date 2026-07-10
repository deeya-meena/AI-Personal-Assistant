"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { Shield, AlertCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    if (emailParam) setEmail(emailParam);
    if (nameParam) setName(nameParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: verifyError } = await insforge.auth.verifyEmail({
        email,
        otp: code,
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid or expired verification code");
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Successful verification - Sync to database and redirect to dashboard
        await syncUser(data.user, name);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setError(null);
    setMessage(null);
    try {
      const { data, error: resendError } = await insforge.auth.resendVerificationEmail({
        email,
      });
      if (resendError) {
        setError(resendError.message || "Failed to resend code");
      } else {
        setMessage("Verification code resent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "Resend failed");
    }
  };

  return (
    <div className="w-full max-w-md glassmorphism rounded-3xl p-8 space-y-6 relative z-10 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Verify your email</h2>
        <p className="text-sm text-zinc-550 dark:text-zinc-400">
          We sent a 6-digit verification code to <br />
          <span className="text-text-primary font-semibold">{email || "your email"}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 text-sm text-green-400">
          <Shield className="w-5 h-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block text-center">Verification Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full bg-zinc-105 dark:bg-zinc-900 border border-card-border rounded-xl py-3.5 text-center text-lg font-bold tracking-[0.5em] text-text-primary placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:border-accent-violet transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={handleResendCode}
          type="button"
          className="text-sm text-zinc-500 hover:text-text-primary transition-colors underline font-medium cursor-pointer bg-transparent border-none"
        >
          Resend verification code
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-300">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <Suspense fallback={
        <div className="w-full max-w-md glassmorphism rounded-3xl p-8 flex items-center justify-center relative z-10 shadow-2xl">
          <Loader2 className="w-8 h-8 text-accent-violet animate-spin" />
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
