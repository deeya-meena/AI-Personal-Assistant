"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCode = searchParams.get("code") || searchParams.get("token") || searchParams.get("otp") || "";
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim();
    if (!cleanCode) {
      setError("Please enter your 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/email/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: cleanCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to reset password. The code may be invalid or expired.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glassmorphism rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl border border-card-border/80 backdrop-blur-xl">
      <div className="text-center space-y-2">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg shadow-accent-violet/30 border border-white/20">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Set New Password</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your recovery code and choose a secure new password
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-400 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed">{error}</div>
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center animate-fadeIn py-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Password Reset Successful!</h2>
          <p className="text-xs text-zinc-400">
            Your credentials have been securely updated. Redirecting you to the sign in page...
          </p>
          <div className="pt-2">
            <Link
              href="/auth/signin"
              className="px-5 py-2.5 bg-accent-violet text-white text-xs font-semibold rounded-xl inline-block"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              6-Digit Recovery Code
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                disabled={loading}
                className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-4 py-3 text-base font-mono font-bold tracking-widest text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all text-center"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={loading}
                className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-11 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
                className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-11 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code || !newPassword || !confirmPassword}
            className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-violet/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              "Update Password"
            )}
          </button>

          <div className="pt-2">
            <Link
              href="/auth/signin"
              className="text-xs font-mono text-zinc-500 hover:text-text-primary transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Cancel & Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/15 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <Suspense fallback={
        <div className="w-full max-w-md glassmorphism rounded-3xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-accent-violet animate-spin mx-auto" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
