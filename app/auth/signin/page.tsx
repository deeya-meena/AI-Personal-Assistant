"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { Bot, Mail, Lock, AlertCircle, Phone, MessageSquare, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { syncUser } = useAuth();
  
  // Auth method state: 'email' or 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Email states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [phoneStep, setPhoneStep] = useState<'send' | 'verify'>('send');
  const [otpCode, setOtpCode] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Common UI states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  // Email Sign In Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      if (data?.user) {
        await syncUser(data.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    console.log("[Auth Log] Initializing Google OAuth sign-in...");
    try {
      const redirectUri = window.location.origin + "/auth/callback";
      console.log(`[Auth Log] Google OAuth redirect URI: ${redirectUri}`);

      const { data, error: oauthError } = await insforge.auth.signInWithOAuth("google", {
        redirectTo: redirectUri,
      });

      if (oauthError) {
        console.error("[Auth Log] Google OAuth initialization error:", oauthError);
        setError(oauthError.message || "Google auth failed");
        return;
      }

      if (data?.url) {
        console.log(`[Auth Log] Redirecting browser to OAuth URL: ${data.url}`);
        window.location.href = data.url;
      } else {
        console.log("[Auth Log] Google OAuth initiated (SDK auto-redirecting)");
      }
    } catch (err: any) {
      console.error("[Auth Log] Unexpected Google auth error:", err);
      setError(err.message || "Google auth failed");
    }
  };

  // Phone: Send OTP Code
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setError(null);
    setSandboxCode(null);
    setResendStatus(null);

    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, method: verificationMethod })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP code");
        setLoading(false);
        return;
      }

      setPhoneStep('verify');
      if (data.sandbox && data.code) {
        setSandboxCode(data.code);
      }
      setResendStatus(`Code sent to ${phoneNumber}`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Phone: Verify OTP and Log In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !otpCode) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otpCode, method: verificationMethod })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        setLoading(false);
        return;
      }

      // If OTP is verified, use the returned credentials to sign in
      const { data: authData, error: authError } = await insforge.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        setError(authError.message || "Sign in failed after verification");
        setLoading(false);
        return;
      }

      if (authData?.user) {
        await syncUser(authData.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent-indigo/10 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-md glassmorphism rounded-3xl p-8 space-y-6 relative z-10 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Welcome back</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to your Aura AI workspace</p>
        </div>

        {/* Method Selection Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-card-border">
          <button
            onClick={() => { setAuthMethod('email'); setError(null); setSandboxCode(null); }}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer font-bold ${
              authMethod === 'email' 
                ? 'bg-white dark:bg-zinc-900 text-text-primary shadow-md border border-zinc-200 dark:border-zinc-800/80' 
                : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => { setAuthMethod('phone'); setError(null); setSandboxCode(null); }}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer font-bold ${
              authMethod === 'phone' 
                ? 'bg-white dark:bg-zinc-900 text-text-primary shadow-md border border-zinc-200 dark:border-zinc-800/80' 
                : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
            }`}
          >
            Phone Login
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-sm text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {resendStatus && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 text-sm text-green-400">
            <Shield className="w-5 h-5 shrink-0" />
            <p>{resendStatus}</p>
          </div>
        )}

        {sandboxCode && (
          <div className="bg-accent-violet/10 border border-accent-violet/30 rounded-xl p-4 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <p className="font-semibold text-text-primary">Sandbox Mode Active</p>
            <p>Your mock verification code is: <span className="font-bold font-mono text-accent-violet bg-zinc-200 dark:bg-zinc-950 px-2 py-0.5 rounded">{sandboxCode}</span></p>
          </div>
        )}

        {/* Email Password View */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {/* Phone OTP View */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {phoneStep === 'send' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-card-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-zinc-500 focus:outline-none focus:border-accent-violet transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block leading-normal">
                    Enter your number with international prefix (e.g. +1 for US/Canada, +44 for UK, +91 for India).
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Verification Channel</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVerificationMethod('sms')}
                      className={`py-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        verificationMethod === 'sms'
                          ? 'bg-zinc-200 dark:bg-zinc-900 border-accent-violet text-text-primary'
                          : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-card-border text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationMethod('whatsapp')}
                      className={`py-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        verificationMethod === 'whatsapp'
                          ? 'bg-zinc-200 dark:bg-zinc-900 border-green-500 text-text-primary'
                          : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-card-border text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.994 9.994 0 0 0 4.779 1.22c5.507 0 9.99-4.478 9.99-9.985A9.997 9.997 0 0 0 12.012 2zm5.82 14.156c-.252.712-1.462 1.307-2.014 1.393-.497.077-1.147.14-3.344-.77-2.813-1.168-4.636-4.037-4.777-4.223-.14-.188-1.139-1.516-1.139-2.893 0-1.377.702-2.054.982-2.33.28-.276.616-.345.822-.345.205 0 .41.002.589.01.187.008.437-.072.684.526.252.61.862 2.097.937 2.247.075.15.127.325.027.525-.098.2-.149.324-.298.498-.15.176-.316.39-.45.524-.149.15-.306.314-.13.616.175.3.778 1.282 1.67 2.077.925.822 1.702 1.077 2.053 1.223.35.148.556.124.764-.114.207-.238.892-1.037 1.13-1.397.237-.36.474-.3.805-.176.33.125 2.092 1.033 2.443 1.208.35.175.584.263.647.375.064.113.064.654-.187 1.366z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2 text-center pb-2">
                  <p className="text-sm text-zinc-550 dark:text-zinc-400">
                    We sent a verification code to <span className="text-text-primary font-semibold">{phoneNumber}</span> via {verificationMethod.toUpperCase()}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-550 dark:text-zinc-400 block text-center">Enter 6-Digit Code</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-zinc-105 dark:bg-zinc-900 border border-card-border rounded-xl py-3 text-center text-lg font-bold tracking-[0.3em] text-text-primary placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:border-accent-violet transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>

                <div className="flex justify-between items-center text-xs font-mono pt-2">
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('send'); setError(null); setSandboxCode(null); setResendStatus(null); }}
                    className="text-zinc-500 hover:text-text-primary transition-colors cursor-pointer"
                  >
                    ← Change Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-accent-violet hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Third-party / OAuth Divider */}
        {authMethod === 'email' && (
          <>
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-x-0 h-px bg-card-border" />
              <span className="relative px-3 bg-bg-dark text-xs font-mono uppercase text-zinc-500">Or continue with</span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.414 0-6.19-2.776-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.483 0 2.844.525 3.913 1.396l3.056-3.056C18.9 2.19 15.748 1 12.24 1 6.032 1 1 6.032 1 12.24s5.032 11.24 11.24 11.24c5.892 0 10.8-4.22 10.8-11.24 0-.668-.06-1.32-.177-1.955H12.24z"
                />
              </svg>
              <span>Gmail / Google</span>
            </button>
          </>
        )}

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-accent-violet hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
