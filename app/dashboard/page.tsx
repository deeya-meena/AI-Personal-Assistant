"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { insforge } from "../../lib/insforge";
import { 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Flame,
  UserCheck
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Layers01Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";

// High-fidelity Vector SVGs for platforms
const PlatformIcon = ({ platformId, className = "w-6 h-6" }: { platformId: string; className?: string }) => {
  switch (platformId.toLowerCase()) {
    case "gmail":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#EA4335" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12.004 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12.004 22C17.528 22 22 17.52 22 12C22 6.48 17.52 2 12.004 2ZM17.184 15.65C16.964 16.27 16.084 16.76 15.424 16.9C14.974 17 14.394 17.09 12.424 16.27C9.904 15.22 8.274 12.66 8.154 12.5C8.034 12.34 7.154 11.17 7.154 9.96C7.154 8.75 7.774 8.16 8.024 7.9C8.214 7.71 8.524 7.63 8.824 7.63C8.924 7.63 9.024 7.64 9.114 7.64C9.384 7.65 9.524 7.67 9.704 8.1C9.934 8.65 10.494 10.01 10.564 10.15C10.634 10.29 10.704 10.48 10.614 10.67C10.524 10.86 10.454 10.95 10.314 11.11C10.174 11.27 10.044 11.4 9.904 11.57C9.774 11.72 9.624 11.89 9.794 12.18C9.964 12.47 10.554 13.43 11.424 14.21C12.554 15.22 13.484 15.54 13.804 15.67C14.044 15.77 14.324 15.75 14.504 15.56C14.734 15.31 15.024 14.91 15.314 14.5C15.524 14.21 15.774 14.17 16.034 14.27C16.304 14.37 17.704 15.06 17.994 15.21C18.284 15.36 18.474 15.44 18.544 15.57C18.614 15.7 18.614 16.34 16.394 16.97C16.394 16.97 17.184 15.65 17.184 15.65Z" fill="#25D366" />
        </svg>
      );
    case "slack":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.043zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zm0 1.262a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.825a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.78a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522h-5.043a2.528 2.528 0 0 1-2.522-2.522V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.134a2.528 2.528 0 0 1 2.52 2.522a2.528 2.528 0 0 1-2.52 2.521a2.528 2.528 0 0 1-2.522-2.521v-2.522h2.522zm0-1.261a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H20.22a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" fill="#4A154B" />
        </svg>
      );
    case "outlook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2H4C2.9 2 2.01 2.9 2.01 4L2 20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8L12 2ZM20 20H4V8H12V4H20V20ZM10 12H6V10H10V12ZM16 16H6V14H16V16ZM18 10H14V12H18V10Z" fill="#0078D4" />
        </svg>
      );
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" fill="#F0F6FC" />
        </svg>
      );
    case "jira":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M11.53 2C11.53 2 11.53 3.5 10 5C8.5 6.5 2 13 2 13L7.5 18.5C7.5 18.5 14 12 15.5 10.5C17 9 18.5 9 18.5 9L11.53 2Z" fill="#0052CC" />
          <path d="M22 12.47C22 12.47 22 13.97 20.47 15.47C18.97 16.97 12.47 23.47 12.47 23.47L17.97 18C17.97 18 24.47 11.5 25.97 10C27.47 8.5 28.97 8.5 28.97 8.5L22 12.47Z" fill="#0052CC" />
        </svg>
      );
    case "discord":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.172-.393-.412-.882-.63-1.25a.074.074 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" fill="#5865F2" />
        </svg>
      );
    case "notion":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v12h1.5v-2.5l3.5 2.5h2.5V6H12v6l-3.5-3V6H6zm10 0v1.5h1.5V18h1.5V7.5H20V6h-4z" fill="#A3A3A3" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2" />
        </svg>
      );
    case "telegram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8L14.99 16.6C14.87 17.15 14.53 17.28 14.07 17.02L11.56 15.17L10.35 16.33C10.22 16.46 10.11 16.57 9.85 16.57L10.03 14.01L14.69 9.8C14.89 9.62 14.65 9.52 14.38 9.7L8.62 13.33L6.14 12.56C5.6 12.39 5.59 12.02 6.25 11.76L15.93 8.02C16.38 7.86 16.77 8.13 16.64 8.8Z" fill="#24A1DE" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
  }
};

const topApps = [
  { id: "gmail", name: "Gmail" },
  { id: "outlook", name: "Calendar" },
  { id: "slack", name: "Slack" },
  { id: "whatsapp", name: "WhatsApp" }
];

interface BriefItem {
  id: string;
  source: string;
  title: string;
  sender: string;
  summary: string;
  time: string;
}

interface PriorityItem {
  id: string;
  source: string;
  title: string;
  time: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface BriefResponse {
  welcomeMessage: string;
  stats: {
    importantCount: number;
    priorityCount: number;
    followUpsCount: number;
  };
  briefs: BriefItem[];
  demoMode: boolean;
}

// Helper to ensure we always use a valid, unexpired access token for custom backend API routes
const getValidToken = async (): Promise<string> => {
  let token = (insforge as unknown as { tokenManager?: { getAccessToken: () => string } }).tokenManager?.getAccessToken() || "";
  if (!token) return "";
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp * 1000 < Date.now() + 10000; // 10s buffer
      if (isExpired) {
        console.log("[Dashboard] Access token expired, refreshing session...");
        const { data, error } = await insforge.auth.refreshSession();
        if (!error && data?.accessToken) {
          token = data.accessToken;
        } else {
          console.error("[Dashboard] Failed to refresh session:", error);
        }
      }
    }
  } catch (err) {
    console.error("[Dashboard] Error parsing/refreshing token:", err);
  }
  return token;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [integrationsStatus, setIntegrationsStatus] = useState<Record<string, string>>({});
  
  const [briefData, setBriefData] = useState<BriefResponse | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [priorityData, setPriorityData] = useState<{ priorityItems: PriorityItem[]; demoMode?: boolean } | null>(null);
  const [loadingPriority, setLoadingPriority] = useState(true);
  const [errorPriority, setErrorPriority] = useState("");

  const [regenerating, setRegenerating] = useState(false);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Load connection statuses from DB
  const loadStatuses = async () => {
    if (!user) return;
    try {
      const { data, error } = await insforge.database
        .from("user_integrations")
        .select("platform_id, status")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to load integrations status:", error);
      } else if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: { platform_id: string; status: string }) => {
          map[row.platform_id] = row.status;
        });
        setIntegrationsStatus(map);
      }
    } catch (err) {
      console.error("DB load exception in Dashboard:", err);
    }
  };

  // Fetch Daily Brief
  const fetchBrief = async (showRegenSpinner = false, forceRefresh = false) => {
    if (!user) return;
    if (!showRegenSpinner) {
      setLoadingBrief(true);
    }
    setErrorMsg("");

    try {
      const token = await getValidToken();
      const res = await fetch(`/api/dashboard/brief${forceRefresh ? "?refresh=true" : ""}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to compile today's briefing context.");
      }

      const data = await res.json();
      setBriefData(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMsg(errMsg || "An error occurred fetching dashboard brief.");
    } finally {
      setLoadingBrief(false);
    }
  };

  // Fetch Priority Items
  const fetchPriority = async (showRegenSpinner = false, forceRefresh = false) => {
    if (!user) return;
    if (!showRegenSpinner) {
      setLoadingPriority(true);
    }
    setErrorPriority("");

    try {
      const token = await getValidToken();
      const res = await fetch(`/api/dashboard/priority${forceRefresh ? "?refresh=true" : ""}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to compile priority focus items.");
      }

      const data = await res.json();
      setPriorityData(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorPriority(errMsg || "An error occurred fetching priority items.");
    } finally {
      setLoadingPriority(false);
    }
  };

  // Trigger parallel load with refresh parameter
  const handleRegenerate = async () => {
    setRegenerating(true);
    loadStatuses();
    await Promise.all([
      fetchBrief(true, true),
      fetchPriority(true, true)
    ]);
    setRegenerating(false);
  };

  const handleAskAura = async (qText?: string) => {
    const queryText = qText || question;
    if (!queryText.trim()) return;

    setLoadingAnswer(true);
    setAiAnswer(null);
    if (!qText) {
      setQuestion("");
    }

    try {
      const token = await getValidToken();
      const res = await fetch("/api/dashboard/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: queryText })
      });

      if (!res.ok) {
        throw new Error("Failed to consult Aura.");
      }

      const data = await res.json();
      setAiAnswer(data.answer);
    } catch (err: unknown) {
      console.error("[Dashboard Ask Aura] Query failed:", err);
      setAiAnswer("Sorry, I had trouble reaching the AI assistant. Please check your connection.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        loadStatuses();
        fetchBrief();
        fetchPriority();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-violet animate-spin" />
      </div>
    );
  }

  const fullName = profile?.name || user.email?.split("@")[0] || "Aura User";

  // Build the metrics mapping
  const metrics = [
    {
      label: "Important Updates",
      value: briefData?.stats?.importantCount ?? 0,
      sub: "Across all active platforms",
      icon: Inbox,
      iconBg: "bg-blue-600/20 text-blue-400 border border-blue-500/20",
    },
    {
      label: "Schedule",
      value: briefData?.stats?.priorityCount ?? 0,
      sub: "Active items today",
      icon: Flame,
      iconBg: "bg-rose-600/20 text-rose-400 border border-rose-500/20",
    },
    {
      label: "Follow-ups & Replies",
      value: briefData?.stats?.followUpsCount ?? 0,
      sub: "Pending items",
      icon: UserCheck,
      iconBg: "bg-amber-600/20 text-amber-400 border border-amber-500/20",
    },
  ];

  const hasDemoMode = briefData?.demoMode || priorityData?.demoMode;

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* Demo Mode Notice Banner */}
      {hasDemoMode && (
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <div className="flex-1">
            <span className="font-bold">Aura Demo Mode:</span> Connect your <code className="bg-amber-900/40 px-1 py-0.5 rounded font-mono font-semibold text-amber-200">GEMINI_API_KEY</code> in <code className="bg-amber-900/40 px-1 py-0.5 rounded font-mono font-semibold text-amber-200">.env.local</code> to enable real-time Gemini AI workspace synthesis.
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-violet-950/20 p-7 md:p-8">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Refresh / Regenerate button */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating || loadingBrief || loadingPriority}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white px-4 py-2.5 text-xs font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin text-accent-violet" : ""}`} />
            {regenerating ? "Regenerating..." : "Regenerate Brief"}
          </button>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[11px] font-mono tracking-widest text-green-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Aura Connected &amp; Synthesizing
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 max-w-4xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {fullName}
              </span>
            </h1>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-medium">
              {loadingBrief ? (
                <span className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  Analyzing inbox activity and workspace items...
                </span>
              ) : (
                briefData?.welcomeMessage || "Your AI assistant has scanned your integrations and compiled your briefing notes."
              )}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 flex items-center justify-between gap-4 hover:border-zinc-700/60 transition-colors"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                {m.label}
              </p>
              <p className="text-3xl font-extrabold text-white">
                {loadingBrief ? (
                  <span className="inline-block w-8 h-8 rounded bg-zinc-800/60 animate-pulse" />
                ) : (
                  m.value
                )}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">{m.sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${m.iconBg}`}>
              <m.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3-Column Layout Row (Today's Brief, Connected Apps, Priority Items side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Brief Card */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Today&apos;s Brief</h2>
            </div>
            <button className="text-[10px] font-bold text-zinc-550 hover:text-white uppercase tracking-wider transition-colors cursor-pointer">
              View all
            </button>
          </div>

          {loadingBrief ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
              <p className="text-[11px] text-zinc-550 font-medium">Compiling feed...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-6 text-center text-rose-400 text-xs font-semibold flex-1 flex items-center justify-center">
              {errorMsg}
            </div>
          ) : !briefData?.briefs || briefData.briefs.length === 0 ? (
            <div className="p-8 text-center text-zinc-550 text-xs flex-1 flex items-center justify-center">
              No active briefing feed items. Connect apps to begin.
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[300px]">
              {briefData.briefs.map((brief) => (
                <div key={brief.id} className="flex gap-3 items-start group">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors block leading-tight truncate">
                      {brief.title}
                    </span>
                    <span className="text-[10.5px] text-zinc-500 block mt-0.5 font-medium leading-relaxed">
                      {brief.summary} • {brief.sender}
                    </span>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <PlatformIcon platformId={brief.source} className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Apps Card */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <HugeiconsIcon icon={Layers01Icon} size={14} />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Connected Apps</h2>
            </div>
            <button
              onClick={() => router.push("/dashboard/integrations")}
              className="text-[10px] font-bold text-zinc-550 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto flex-1 max-h-[300px]">
            {topApps.map((app) => {
              const status = integrationsStatus[app.id] || "disconnected";
              const isConnected = status === "connected";
              
              return (
                <div
                  key={app.id}
                  className="flex flex-col justify-between p-3.5 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-zinc-850 hover:bg-zinc-900/10 transition-all cursor-pointer"
                  onClick={() => router.push("/dashboard/integrations")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800/60">
                      <PlatformIcon platformId={app.id} className="w-4.5 h-4.5" />
                    </div>
                    {isConnected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200 leading-tight mb-0.5">{app.name}</p>
                    <span className={`text-[10px] font-bold ${
                      isConnected ? "text-emerald-500/90" : "text-zinc-650"
                    }`}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Focus Items Card */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Priority Items</h2>
            </div>
            <button className="text-[10px] font-bold text-zinc-550 hover:text-white uppercase tracking-wider transition-colors cursor-pointer">
              View all
            </button>
          </div>

          {loadingPriority ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-rose-400 animate-spin" />
              <p className="text-[11px] text-zinc-550 font-medium">Extracting tasks...</p>
            </div>
          ) : errorPriority ? (
            <div className="p-6 text-center text-rose-400 text-xs font-semibold flex-1 flex items-center justify-center">
              {errorPriority}
            </div>
          ) : !priorityData?.priorityItems || priorityData.priorityItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-550 text-xs flex-1 flex items-center justify-center">
              No high-priority task items extracted today.
            </div>
          ) : (
            <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[300px]">
              {priorityData.priorityItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-900/40 bg-zinc-950/20 hover:border-zinc-850 transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900/80 border border-zinc-800/60 flex items-center justify-center">
                      <PlatformIcon platformId={item.source} className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block truncate leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-zinc-550 block font-medium truncate mt-0.5">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9.5px] text-zinc-550 font-mono font-semibold">{item.time}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.priority === "high"
                          ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                          : item.priority === "medium"
                          ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                          : "bg-blue-500 shadow-sm shadow-blue-500/50"
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick AI Suggestion & Ask Aura Box */}
      <div className="rounded-3xl border border-zinc-800/60 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-violet-950/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Ask Aura AI Assistant
            </h3>
            <p className="text-[11px] text-zinc-550 font-medium">Ask questions about your daily schedule, connected integrations, or how to use Aura.</p>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Summarize my day", query: "Can you summarize my daily brief and priority items?" },
              { label: "Check status", query: "Which integrations are currently connected?" },
              { label: "Urgent tasks?", query: "Show me all high priority items." }
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => handleAskAura(s.query)}
                disabled={loadingAnswer}
                className="text-[10px] font-bold text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAura();
          }}
          className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-850 focus-within:border-violet-500/50 rounded-2xl p-2.5 transition-all"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loadingAnswer}
            placeholder="Type a question (e.g., Do I have any meetings today?)..."
            className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-200 placeholder-zinc-650 px-2"
          />
          <button
            type="submit"
            disabled={loadingAnswer || !question.trim()}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loadingAnswer ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Ask Aura"
            )}
          </button>
        </form>

        {/* AI Answer Display */}
        {(aiAnswer || loadingAnswer) && (
          <div className="rounded-2xl border border-violet-950/40 bg-violet-950/5 p-4 transition-all">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-extrabold font-mono">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-bold mb-1">Aura Response</p>
                {loadingAnswer ? (
                  <div className="flex items-center gap-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-150" />
                  </div>
                ) : (
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">{aiAnswer}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
