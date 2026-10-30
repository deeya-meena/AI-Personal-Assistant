"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { user, setUserState, loading: authLoading } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password reset flow states ('none' | 'request' | 'verify')
  const [resetStep, setResetStep] = useState<"none" | "request" | "verify">("none");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [devResetCode, setDevResetCode] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Handle email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccessMsg(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        setUserState(data.user);
        router.push("/dashboard");
      } else {
        setError("Sign in response was missing user data.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("[Sign In Error]:", err);
      setError(err.message || "Unable to connect to the authentication service. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setError(null);
    setIsGoogleLoading(true);

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const res = await fetch(`/api/auth/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error?.message || "Failed to initialize Google authentication.");
        setIsGoogleLoading(false);
        return;
      }

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError("Unable to obtain Google authorization URL.");
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      console.error("[Google OAuth Error]:", err);
      setError(err.message || "Failed to connect to Google authentication.");
      setIsGoogleLoading(false);
    }
  };

  // Handle requesting password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetSubmitting) return;

    setError(null);
    setSuccessMsg(null);
    setDevResetCode(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setResetSubmitting(true);

    try {
      const res = await fetch("/api/auth/email/send-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to send reset code. Please ensure the email is registered.");
        setResetSubmitting(false);
        return;
      }

      setResetStep("verify");
      setSuccessMsg("Reset instructions generated! Enter your 6-digit code and new password below.");
      if (data?.data?.code) {
        setDevResetCode(data.data.code);
        setResetCode(data.data.code); // Pre-fill for convenience
      }
    } catch (err: any) {
      setError(err.message || "Network error while requesting password reset.");
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle completing password reset
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetSubmitting) return;

    setError(null);
    setSuccessMsg(null);

    if (!resetCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetSubmitting(true);

    try {
      const res = await fetch("/api/auth/email/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to reset password. The code may be invalid or expired.");
        setResetSubmitting(false);
        return;
      }

      // Success: return to sign in
      setResetStep("none");
      setEmail(resetEmail);
      setPassword("");
      setSuccessMsg("Password reset successfully! You can now sign in with your new password.");
    } catch (err: any) {
      setError(err.message || "Network error while resetting password.");
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres & Background Grid */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/15 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-md glassmorphism rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl border border-card-border/80 backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg shadow-accent-violet/30 border border-white/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {resetStep === "none" ? "Welcome back" : "Reset Password"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {resetStep === "none"
              ? "Sign in to your Aura AI workspace"
              : resetStep === "request"
              ? "Enter your email to receive recovery instructions"
              : "Enter your verification code and choose a new password"}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 text-xs leading-relaxed">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-green-400 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-400" />
            <div className="flex-1 text-xs leading-relaxed">{successMsg}</div>
          </div>
        )}

        {devResetCode && (
          <div className="bg-accent-violet/10 border border-accent-violet/30 rounded-2xl p-3.5 space-y-1 text-xs text-zinc-300">
            <p className="font-semibold text-accent-violet flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Reset Code Generated
            </p>
            <p className="text-zinc-400">
              Verification Code: <span className="font-mono font-bold text-accent-violet bg-zinc-900 px-2 py-0.5 rounded border border-accent-violet/40">{devResetCode}</span>
            </p>
          </div>
        )}

        {/* VIEW 1: Main Sign In Form */}
        {resetStep === "none" && (
          <>
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("request");
                      setResetEmail(email);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-accent-violet hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-11 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-3 text-zinc-500 hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-violet/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Third-Party Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-x-0 h-px bg-card-border" />
              <span className="relative px-3 bg-bg-dark text-xs font-mono uppercase text-zinc-500">
                Or continue with
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isGoogleLoading || isSubmitting}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-accent-violet" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Switch to Sign Up */}
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-accent-violet hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </>
        )}

        {/* VIEW 2: Password Reset - Step 1 (Request Code) */}
        {resetStep === "request" && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Your Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={resetSubmitting}
                  className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetSubmitting || !resetEmail}
              className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-violet/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resetSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4.5 h-4.5" />
                  <span>Send Reset Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetStep("none");
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full py-2.5 text-xs font-mono text-zinc-500 hover:text-text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Sign In
            </button>
          </form>
        )}

        {/* VIEW 3: Password Reset - Step 2 (Verify Code & Set Password) */}
        {resetStep === "verify" && (
          <form onSubmit={handleCompleteReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                6-Digit Reset Code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
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
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-11 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
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
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetSubmitting || !resetCode || !newPassword || !confirmNewPassword}
              className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-violet/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resetSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                "Save & Update Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetStep("none");
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full py-2.5 text-xs font-mono text-zinc-500 hover:text-text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Cancel & Return to Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
