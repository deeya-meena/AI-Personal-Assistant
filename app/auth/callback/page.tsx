"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Bot, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUserState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Verifying authorization code with Google...");

  useEffect(() => {
    let isCancelled = false;

    const processOAuthCallback = async () => {
      try {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const urlError = params.get("error");
        const urlErrorDescription = params.get("error_description");
        const code = params.get("code") || params.get("insforge_code");

        // 1. Check for provider error or user cancellation
        if (urlError) {
          if (urlError === "access_denied") {
            setError("Google sign-in was cancelled or access was denied.");
          } else {
            setError(urlErrorDescription || `Google authentication error: ${urlError}`);
          }
          return;
        }

        // 2. Missing authorization code
        if (!code) {
          setError("No authorization code was found in the callback request.");
          return;
        }

        setStatusMessage("Completing authentication and linking account...");

        const redirectUri = `${window.location.origin}/auth/callback`;

        // 3. Exchange authorization code on server
        const res = await fetch("/api/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        });

        const data = await res.json();

        if (isCancelled) return;

        if (!res.ok || data.error) {
          setError(data.error?.message || "Failed to complete Google authentication.");
          return;
        }

        if (data?.user) {
          setUserState(data.user);
          setStatusMessage("Authentication successful! Redirecting to workspace...");
          setTimeout(() => {
            if (!isCancelled) {
              router.push("/dashboard");
            }
          }, 400);
        } else {
          setError("Authentication succeeded, but no user profile was returned.");
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("[OAuth Callback Exception]:", err);
          setError(err.message || "An unexpected error occurred while processing the login callback.");
        }
      }
    };

    processOAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [router, setUserState]);

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/15 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-md glassmorphism rounded-3xl p-8 space-y-6 text-center relative z-10 shadow-2xl border border-card-border/80 backdrop-blur-xl">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg shadow-accent-violet/30 border border-white/20 animate-pulse">
          <Bot className="w-7 h-7 text-white" />
        </div>

        {error ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-400 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">{error}</div>
            </div>

            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-card-border text-sm font-semibold rounded-xl text-text-primary transition-all cursor-pointer w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Completing Authentication</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{statusMessage}</p>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-7 h-7 text-accent-violet animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
