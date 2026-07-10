"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { Bot, Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { syncUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The SDK automatically exchanges the code in the URL for a session on initialization
        // We fetch the current user to verify authentication is complete.
        const { data, error: authError } = await insforge.auth.getCurrentUser();
        
        if (authError) {
          setError(authError.message || "Authentication callback failed");
          return;
        }

        if (data?.user) {
          // Sync user to the database users table on first Google sign in
          await syncUser(data.user);
          router.push("/dashboard");
        } else {
          // No user found, redirect to signin
          router.push("/auth/signin");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during auth callback");
      }
    };

    handleCallback();
  }, [router, syncUser]);

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-300">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-indigo/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-md glassmorphism rounded-3xl p-8 space-y-6 text-center relative z-10 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Bot className="w-6 h-6 text-white" />
        </div>
        
        {error ? (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-sm text-red-400 text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-sm font-semibold rounded-xl text-text-primary transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">Completing sign in</h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-400">Syncing workspace credentials...</p>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 text-accent-violet animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
