"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import {
  Loader2,
  Sparkles,
  X,
  Bell,
  BellRing,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ChevronDown,
  AlertTriangle,
  Send,
  Zap,
  MessageSquare,
  Eye,
  BellOff,
  ListChecks,
  ArrowRight,
  RefreshCw,
  Wand2,
  FileText,
  ExternalLink,
  ChevronLeft,
  Archive,
  Square,
  CheckSquare,
  PlayCircle
} from "lucide-react";

// ─── Platform Icon SVGs (reused from dashboard) ─────────────────────────────

const PlatformIcon = ({ platformId, className = "w-5 h-5" }: { platformId: string; className?: string }) => {
  switch (platformId?.toLowerCase()) {
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
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v6.303A2.528 2.528 0 0 1 8.823 24a2.528 2.528 0 0 1-2.52-2.532v-6.303zM8.823 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.522v2.52h-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v6.303a2.528 2.528 0 0 1-2.52 2.52A2.528 2.528 0 0 1 6.303 15.126V8.823a2.528 2.528 0 0 1 2.52-2.52zM18.958 8.823a2.528 2.528 0 0 1 2.522-2.52A2.528 2.528 0 0 1 24 8.823a2.528 2.528 0 0 1-2.52 2.522h-2.522V8.823zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522H8.874a2.528 2.528 0 0 1-2.522-2.522A2.528 2.528 0 0 1 8.874 6.303h6.302a2.528 2.528 0 0 1 2.52 2.52zM15.177 18.958a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.177 24a2.528 2.528 0 0 1-2.522-2.52v-2.522h2.522zm0-1.261a2.528 2.528 0 0 1-2.522-2.52V8.875a2.528 2.528 0 0 1 2.522-2.522A2.528 2.528 0 0 1 17.697 8.875v6.302a2.528 2.528 0 0 1-2.52 2.52z" fill="#E01E5A" />
        </svg>
      );
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" fill="currentColor" />
        </svg>
      );
    case "jira":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.577 24V12.518a1.005 1.005 0 00-1.006-1.005z" fill="#2684FF" />
          <path d="M5.821 5.756H17.392a5.218 5.218 0 00-5.232-5.215H10.03V-1.516A5.215 5.215 0 004.815 3.699v11.482a1.005 1.005 0 001.006 1.005z" fill="#2684FF" opacity="0.7" />
        </svg>
      );
    case "discord":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2" />
        </svg>
      );
    case "outlook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 01-.588.234h-8.42v-8.47l1.87 1.345a.25.25 0 00.296 0L24 6.478v.909zM23.174 5.25a.807.807 0 01.59.233l-6.78 4.878-2.23-1.606V4.5h8.42z" fill="#0078D4" />
          <path d="M8.111 8.75v7.735a.912.912 0 01-.26.648.888.888 0 01-.653.257H0V7.5h7.198c.253 0 .467.088.643.26a.88.88 0 01.27.633v.357zM14.754 4.5V12l-2.23-1.606V4.5h2.23z" fill="#0078D4" opacity="0.7" />
        </svg>
      );
    case "notion":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 4v12h1.5v-2.5l3.5 2.5h2.5V6H12v6l-3.5-3V6H6zm10 0v1.5h1.5V18h1.5V7.5H20V6h-4z" fill="currentColor" />
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
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.65 7.8c-.12.55-.46.68-.92.42l-2.51-1.85-1.21 1.16c-.13.13-.24.24-.5.24l.18-2.56 4.66-4.21c.2-.18-.04-.28-.31-.1L8.62 13.33l-2.48-.77c-.54-.17-.55-.54.11-.8l9.68-3.74c.45-.16.84.13.71.78z" fill="#24A1DE" />
        </svg>
      );
    case "system":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Token Helper ────────────────────────────────────────────────────────────

const getValidToken = async (): Promise<string> => {
  let token = (insforge as unknown as { tokenManager?: { getAccessToken: () => string } }).tokenManager?.getAccessToken() || "";
  if (!token) return "";
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp * 1000 < Date.now() + 10000;
      if (isExpired) {
        const { data, error } = await insforge.auth.refreshSession();
        if (!error && data?.accessToken) token = data.accessToken;
      }
    }
  } catch {}
  return token;
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface TriggeredAlert {
  id: string;
  user_id: string;
  alert_id: string | null;
  source_app: string;
  title: string;
  description: string;
  full_content: any;
  priority: "critical" | "high" | "medium" | "low";
  status: "active" | "acknowledged" | "resolved" | "snoozed";
  snoozed_until: string | null;
  ai_data: {
    summary?: string;
    action?: string;
    draft_reply?: string;
  };
  resolved_at: string | null;
  archived_at: string | null;
  source_id: string | null;
  dedupe_key: string | null;
  created_at: string;
}

interface AlertStats {
  active: number;
  triggeredToday: number;
  highPriority: number;
  resolved: number;
}

interface AISuggestion {
  name: string;
  description: string;
  apps: string[];
  condition: string;
  priority: string;
  icon: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

const priorityColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: "bg-red-500/10 dark:bg-red-950/40", text: "text-red-600 dark:text-red-400", border: "border-red-500/20 dark:border-red-500/25", dot: "bg-red-500" },
  high: { bg: "bg-rose-500/10 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20 dark:border-rose-500/25", dot: "bg-rose-500" },
  medium: { bg: "bg-amber-500/10 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20 dark:border-amber-500/25", dot: "bg-amber-500" },
  low: { bg: "bg-emerald-500/10 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20 dark:border-emerald-500/25", dot: "bg-emerald-500" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-blue-500/10 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  acknowledged: { bg: "bg-violet-500/10 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  resolved: { bg: "bg-emerald-500/10 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  snoozed: { bg: "bg-zinc-500/10 dark:bg-zinc-800/40", text: "text-zinc-500 dark:text-zinc-400" },
};

const appNames: Record<string, string> = {
  gmail: "Gmail",
  whatsapp: "WhatsApp",
  slack: "Slack",
  github: "GitHub",
  jira: "Jira",
  discord: "Discord",
  outlook: "Outlook",
  notion: "Notion",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  system: "Aura System",
};

const allApps = ["gmail", "whatsapp", "slack", "github", "jira", "discord", "outlook", "notion", "linkedin", "telegram"];

const triggerConditions = [
  { value: "keyword_match", label: "Keyword Match", desc: "Trigger when specific keywords are found" },
  { value: "priority_sender", label: "Priority Sender", desc: "Trigger for messages from specific senders" },
  { value: "mention", label: "Mention Detection", desc: "Trigger when you are @mentioned" },
  { value: "unread_threshold", label: "Unread Threshold", desc: "Trigger when unread count exceeds limit" },
  { value: "high_priority", label: "High Priority Items", desc: "Trigger for critical/high priority items" },
  { value: "deadline_approaching", label: "Deadline Approaching", desc: "Trigger when deadlines are near" },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AlertsPage() {
  const { user } = useAuth();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<TriggeredAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({ active: 0, triggeredToday: 0, highPriority: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const limit = 15;

  // Bulk action states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<TriggeredAlert | null>(null);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Create form
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formApps, setFormApps] = useState<string[]>([]);
  const [formCondition, setFormCondition] = useState("keyword_match");
  const [formKeywords, setFormKeywords] = useState("");
  const [formSenders, setFormSenders] = useState("");
  const [formThreshold, setFormThreshold] = useState("5");
  const [formHoursAhead, setFormHoursAhead] = useState("24");
  const [formPriority, setFormPriority] = useState("medium");
  const [formNotification, setFormNotification] = useState("in_app");
  const [formFrequency, setFormFrequency] = useState("realtime");
  const [formAction, setFormAction] = useState("notify");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formTesting, setFormTesting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail dialog AI
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  // Snooze
  const [showSnoozePicker, setShowSnoozePicker] = useState(false);

  // Animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await getValidToken();
      const params = new URLSearchParams();
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (includeArchived) params.set("include_archived", "true");
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/dashboard/alerts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data || []);
        if (json.stats) setStats(json.stats);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalAlerts(json.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error("[Alerts] Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, priorityFilter, statusFilter, searchQuery, includeArchived, page]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ─── AI Suggestions ─────────────────────────────────────────────────────────

  const fetchAiSuggestions = useCallback(async () => {
    if (!user) return;
    setLoadingSuggestions(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/dashboard/alerts/ai", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest_alerts" }),
      });
      if (res.ok) {
        const json = await res.json();
        setAiSuggestions(json.suggestions || []);
      }
    } catch (err) {
      console.error("[Alerts] AI suggestions error:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [user]);

  useEffect(() => { fetchAiSuggestions(); }, [fetchAiSuggestions]);

  // ─── Realtime Subscription (INSERT, UPDATE, DELETE) ───────────────────────────

  useEffect(() => {
    if (!user) return;
    let channel: any;
    try {
      channel = (insforge as any).realtime
        ?.channel?.("alerts-realtime-full")
        ?.on?.("postgres_changes", {
          event: "*", // Listen to all inserts, updates, and deletes
          schema: "public",
          table: "triggered_alerts",
          filter: `user_id=eq.${user.id}`,
        }, (payload: any) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const newAlert = payload.new as TriggeredAlert;
            const matchesArchive = includeArchived || !newAlert.archived_at;
            const matchesPriority = priorityFilter === "all" || newAlert.priority === priorityFilter;
            const matchesStatus = statusFilter === "all" || newAlert.status === statusFilter;
            
            if (matchesArchive && matchesPriority && matchesStatus) {
              setAlerts((prev) => {
                if (prev.some((a) => a.id === newAlert.id)) return prev;
                return [newAlert, ...prev];
              });
            }
            fetchAlerts(true);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updatedAlert = payload.new as TriggeredAlert;
            setAlerts((prev) =>
              prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
            );
            if (selectedAlert?.id === updatedAlert.id) {
              setSelectedAlert(updatedAlert);
            }
            fetchAlerts(true);
          } else if (payload.eventType === "DELETE" && payload.old) {
            const deletedId = payload.old.id;
            setAlerts((prev) => prev.filter((a) => a.id !== deletedId));
            if (selectedAlert?.id === deletedId) {
              setSelectedAlert(null);
            }
            fetchAlerts(true);
          }
        })
        ?.subscribe?.();
    } catch {}

    return () => {
      try { channel?.unsubscribe?.(); } catch {}
    };
  }, [user, includeArchived, priorityFilter, statusFilter, selectedAlert, fetchAlerts]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleAction = async (alertId: string, action: string, extraFields?: any) => {
    try {
      const token = await getValidToken();
      const res = await fetch(`/api/dashboard/alerts/${alertId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraFields }),
      });
      if (res.ok) {
        const json = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? json.data : a)));
        if (selectedAlert?.id === alertId) setSelectedAlert(json.data);
        fetchAlerts(true);
      }
    } catch (err) {
      console.error("[Alerts] Action error:", err);
    }
  };

  const handleBulkAction = async (action: "bulk_resolve" | "bulk_archive") => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/dashboard/alerts", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        fetchAlerts(true);
      }
    } catch (err) {
      console.error("[Alerts] Bulk action error:", err);
    }
  };

  const handleAiAction = async (alertId: string, action: string) => {
    setAiLoading(action);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/dashboard/alerts/ai", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, alertId }),
      });
      if (res.ok) {
        const json = await res.json();
        // The API returns the parsed text. We will manually update the local client state.
        // Wait, the API handler updates the database schema properly inside `ai_data`.
        // So fetching alerts again will refresh everything, but we can also modify local state:
        setAlerts((prev) =>
          prev.map((a) => {
            if (a.id !== alertId) return a;
            const updatedAiData = {
              ...(a.ai_data || {}),
              summary: action === "summarize" ? json.result : a.ai_data?.summary,
              action: action === "suggest_action" ? json.result : a.ai_data?.action,
              draft_reply: action === "draft_reply" ? json.result : a.ai_data?.draft_reply,
            };
            const updatedAlert = { ...a, ai_data: updatedAiData };
            if (selectedAlert?.id === alertId) setSelectedAlert(updatedAlert);
            return updatedAlert;
          })
        );
        if (action === "draft_reply") {
          setDraftReply(json.result);
          setShowReplyComposer(true);
        }
      }
    } catch (err) {
      console.error("[Alerts] AI action error:", err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formApps.length === 0) return;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = await getValidToken();
      const triggerConfig: any = {};
      if (formCondition === "keyword_match") triggerConfig.keywords = formKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      if (formCondition === "priority_sender") triggerConfig.senders = formSenders.split(",").map((s) => s.trim()).filter(Boolean);
      if (formCondition === "unread_threshold") triggerConfig.threshold = parseInt(formThreshold) || 5;
      if (formCondition === "deadline_approaching") triggerConfig.hours_ahead = parseInt(formHoursAhead) || 24;

      const res = await fetch("/api/dashboard/alerts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          selected_apps: formApps,
          trigger_condition: formCondition,
          trigger_config: triggerConfig,
          priority: formPriority,
          notification_method: formNotification,
          frequency: formFrequency,
          action_type: formAction,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchAlerts(true);
      } else {
        setFormError(json.error || "Failed to create alert rule");
      }
    } catch (err: any) {
      console.error("[Alerts] Create error:", err);
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTestAlert = async () => {
    if (!formName) {
      setFormError("Alert name is required to run a test");
      return;
    }
    setFormTesting(true);
    setFormError(null);
    try {
      const token = await getValidToken();
      const triggerConfig: any = {};
      if (formCondition === "keyword_match") triggerConfig.keywords = formKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      if (formCondition === "priority_sender") triggerConfig.senders = formSenders.split(",").map((s) => s.trim()).filter(Boolean);
      if (formCondition === "unread_threshold") triggerConfig.threshold = parseInt(formThreshold) || 5;
      if (formCondition === "deadline_approaching") triggerConfig.hours_ahead = parseInt(formHoursAhead) || 24;

      const res = await fetch("/api/dashboard/alerts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          selected_apps: formApps,
          trigger_condition: formCondition,
          trigger_config: triggerConfig,
          priority: formPriority,
          notification_method: formNotification,
          frequency: formFrequency,
          action_type: formAction,
          isTest: true, // Trigger test alert directly
        }),
      });

      const json = await res.json();
      if (res.ok) {
        fetchAlerts(true);
        alert(`Test alert "${json.data?.title}" successfully simulated!`);
      } else {
        setFormError(json.error || "Failed to trigger test alert");
      }
    } catch (err: any) {
      console.error("[Alerts] Test alert error:", err);
      setFormError(err.message || "An unexpected error occurred during test");
    } finally {
      setFormTesting(false);
    }
  };

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormApps([]);
    setFormCondition("keyword_match"); setFormKeywords(""); setFormSenders("");
    setFormThreshold("5"); setFormHoursAhead("24"); setFormPriority("medium");
    setFormNotification("in_app"); setFormFrequency("realtime"); setFormAction("notify");
    setFormError(null);
  };

  const prefillFromSuggestion = (s: AISuggestion) => {
    setFormName(s.name);
    setFormDesc(s.description);
    setFormApps(
      Array.isArray(s.apps)
        ? s.apps
        : typeof s.apps === "string"
        ? (s.apps as string).split(",").map((a) => a.trim()).filter(Boolean)
        : []
    );
    setFormCondition(s.condition);
    setFormPriority(s.priority);
    setShowCreateDialog(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === alerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(alerts.map((a) => a.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-8 w-full max-w-[1600px] mx-auto p-4 md:p-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Alerts Command Center</h1>
            <p className="text-xs font-mono text-text-secondary mt-0.5 uppercase tracking-wider">REAL-TIME MONITORING · AI-POWERED</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-card border border-card-border text-text-secondary hover:text-text-primary hover:bg-muted transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowCreateDialog(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Alert
          </button>
        </div>
      </div>

      {/* ── Metric Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Alerts", value: stats.active, icon: Bell, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/15" },
          { label: "Triggered Today", value: stats.triggeredToday, icon: Zap, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/15" },
          { label: "High Priority", value: stats.highPriority, icon: ShieldAlert, gradient: "from-rose-500 to-red-600", glow: "shadow-rose-500/15" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/15" },
        ].map((card) => (
          <div
            key={card.label}
            className={`glassmorphism rounded-2xl p-6 min-h-[140px] flex flex-col justify-between border border-card-border hover:border-card-border/80 transition-all group hover:scale-[1.01] cursor-default shadow-lg ${card.glow}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glassmorphism rounded-2xl p-4 border border-card-border shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Priority pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-text-secondary uppercase mr-1">Priority:</span>
            {["all", "critical", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => { setPriorityFilter(p); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-all cursor-pointer border ${
                  priorityFilter === p
                    ? p === "critical" ? "bg-red-500/15 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-500/30"
                    : p === "high" ? "bg-rose-500/15 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : p === "medium" ? "bg-amber-500/15 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : p === "low" ? "bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-card border border-card-border text-text-primary font-bold shadow-sm"
                    : "bg-transparent border-card-border text-text-secondary hover:text-text-primary hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 flex-wrap pl-4 border-l border-card-border">
            <span className="text-[10px] font-mono text-text-secondary uppercase mr-1">Status:</span>
            {["all", "active", "acknowledged", "resolved", "snoozed"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-all cursor-pointer border ${
                  statusFilter === s
                    ? "bg-card border border-card-border text-text-primary font-bold shadow-sm"
                    : "bg-transparent border-card-border text-text-secondary hover:text-text-primary hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Archive Toggle */}
          <div className="flex items-center gap-2 pl-4 border-l border-card-border">
            <button
              onClick={() => { setIncludeArchived(!includeArchived); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                includeArchived
                  ? "bg-card border border-card-border text-text-primary font-bold shadow-sm"
                  : "bg-transparent border-card-border text-text-secondary hover:text-text-primary hover:bg-muted"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Show Archived
            </button>
          </div>
        </div>

        {/* Search (Right Aligned) */}
        <div className="w-full lg:w-72 lg:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-card border border-card-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Bulk Actions Bar ──────────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-muted/60 border border-card-border rounded-2xl animate-fadeIn shadow-sm">
          <span className="text-xs font-semibold text-text-secondary">
            {selectedIds.size} alert(s) selected
          </span>
          <button
            onClick={() => handleBulkAction("bulk_resolve")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
          </button>
          <button
            onClick={() => handleBulkAction("bulk_archive")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-500/15 hover:bg-zinc-500/25 text-text-secondary border border-card-border transition-all cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" /> Archive Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-text-secondary hover:text-text-primary ml-auto transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* ── Main Content Grid (Two-Column Desktop Layout) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)] gap-6 items-start">
        {/* LEFT COLUMN: Recent Alerts Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Recent Alerts</h2>
              <span className="text-[10px] font-mono text-text-secondary bg-muted px-2 py-0.5 rounded-full border border-card-border">{totalAlerts}</span>
            </div>

            {alerts.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {selectedIds.size === alerts.length ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4" />}
                {selectedIds.size === alerts.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {alerts.length > 0 ? (
            <div className="relative">
              {/* True connected nodes vertical timeline line */}
              <div className="absolute left-[44px] top-6 bottom-6 w-px bg-gradient-to-b from-rose-500/40 via-card-border/80 to-transparent hidden sm:block" />

              <div className="space-y-4">
                {alerts.map((alert, idx) => {
                  const pc = priorityColors[alert.priority] || priorityColors.medium;
                  const sc = statusColors[alert.status] || statusColors.active;
                  const isSelected = selectedIds.has(alert.id);
                  return (
                    <div
                      key={alert.id}
                      onClick={() => { setSelectedAlert(alert); setShowReplyComposer(false); setDraftReply(""); setShowSnoozePicker(false); }}
                      className={`relative glassmorphism rounded-2xl p-5 pl-4 sm:pl-20 border transition-all cursor-pointer group hover:scale-[1.002] ${
                        alert.status === "active" ? `${pc.border} hover:border-card-border/80` : "border-card-border hover:border-card-border/80"
                      } ${alert.status === "resolved" ? "opacity-60" : ""} ${isSelected ? "ring-1 ring-rose-500/20 bg-rose-500/[0.01]" : ""}`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Node connection details */}
                      <div className="absolute left-10 top-7 w-2 h-2 rounded-full bg-card-border border border-card-bg hidden sm:block z-10 group-hover:bg-rose-500 transition-colors" />

                      {/* Timeline dot */}
                      <div className={`absolute left-[38px] top-6 w-3 h-3 rounded-full ${pc.dot} ring-4 ring-card-bg hidden sm:block z-20 ${alert.status === "active" ? "animate-pulse" : ""}`} />

                      <div className="flex items-start gap-4">
                        {/* Selector Checkbox */}
                        <div
                          className="flex items-center self-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectOne(alert.id);
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-500 cursor-pointer" />
                          ) : (
                            <Square className="w-4 h-4 text-text-secondary/60 group-hover:text-text-secondary cursor-pointer" />
                          )}
                        </div>

                        {/* App icon */}
                        <div className="w-11 h-11 rounded-xl bg-muted border border-card-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                          <PlatformIcon platformId={alert.source_app} className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="text-base font-bold text-text-primary truncate">{alert.title}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase ${pc.bg} ${pc.text} border ${pc.border}`}>
                              {alert.priority}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase ${sc.bg} ${sc.text}`}>
                              {alert.status}
                            </span>
                            {alert.archived_at && (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-zinc-500/10 text-zinc-550 border border-zinc-500/20">
                                Archived
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-text-secondary line-clamp-2 mb-2 leading-relaxed">{alert.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-text-secondary font-mono">
                            <span className="flex items-center gap-1.5">
                              <PlatformIcon platformId={alert.source_app} className="w-3.5 h-3.5" />
                              {appNames[alert.source_app] || alert.source_app}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(alert.created_at)}</span>
                            {alert.ai_data?.summary && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-violet-500"><Sparkles className="w-3.5 h-3.5" /> AI Enriched</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-start sm:self-center">
                          {alert.status !== "resolved" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(alert.id, "resolve"); }}
                              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer shadow-sm"
                              title="Resolve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {!alert.archived_at && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(alert.id, "archive"); }}
                              className="p-2.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-text-secondary border border-card-border transition-all cursor-pointer shadow-sm"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); }}
                            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-text-secondary hover:text-text-primary border border-card-border transition-all cursor-pointer shadow-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-card-border">
                  <span className="text-xs text-text-secondary font-mono">
                    Page {page} of {totalPages} ({totalAlerts} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-card-border bg-card text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-card-border bg-card text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card/50 border border-card-border border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-text-secondary animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">No alerts found</p>
              <p className="text-xs text-text-secondary">Create alert rules to start monitoring your connected apps</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Suggested Alerts */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">AI Suggested Alerts</h2>
            <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">SMART</span>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-12 glassmorphism rounded-2xl border border-card-border">
              <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
              <span className="ml-2 text-xs text-text-secondary">AI is analyzing your apps...</span>
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {aiSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="glassmorphism rounded-2xl p-5 border border-violet-500/20 hover:border-violet-500/40 transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg flex-shrink-0">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-text-primary mb-0.5">{suggestion.name}</h3>
                      <p className="text-xs text-text-secondary mb-3 leading-relaxed">{suggestion.description}</p>
                      <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                        {(Array.isArray(suggestion.apps)
                          ? suggestion.apps
                          : typeof suggestion.apps === "string"
                          ? (suggestion.apps as string).split(",").map((a) => a.trim()).filter(Boolean)
                          : []
                        ).map((app) => (
                          <span key={app} className="flex items-center gap-1 text-[10px] font-mono text-text-secondary bg-muted px-2 py-0.5 rounded-full border border-card-border">
                            <PlatformIcon platformId={app} className="w-3 h-3" />
                            {appNames[app] || app}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => prefillFromSuggestion(suggestion)}
                        className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:border-violet-500/30 transition-all cursor-pointer shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Enable Alert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-8 text-center">
              <Sparkles className="w-6 h-6 text-violet-500 mx-auto mb-2" />
              <p className="text-xs text-text-secondary">Connect more apps to get AI-powered alert suggestions</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CREATE ALERT DIALOG
         ═══════════════════════════════════════════════════════════════════════════ */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateDialog(false)}>
          <div
            className="bg-card rounded-3xl border border-card-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-card-border sticky top-0 bg-card z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-text-primary">Create New Alert</h2>
                  <p className="text-[10px] font-mono text-text-secondary uppercase">CONFIGURE MONITORING RULE</p>
                </div>
              </div>
              <button onClick={() => setShowCreateDialog(false)} className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-muted transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Body */}
            <form onSubmit={handleCreateAlert} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {/* Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Alert Name *</label>
                  <input
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., VIP Email Notifications"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Description</label>
                  <textarea
                    value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Describe what this alert monitors..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all resize-none shadow-sm"
                  />
                </div>
              </div>

              {/* Selected Apps */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-2">Monitor Apps *</label>
                <div className="grid grid-cols-5 gap-2">
                  {allApps.map((app) => (
                    <button
                      key={app} type="button"
                      onClick={() => setFormApps((prev) => prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app])}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
                        formApps.includes(app)
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm"
                          : "bg-muted/40 border-card-border text-text-secondary hover:text-text-primary hover:bg-muted"
                      }`}
                    >
                      <PlatformIcon platformId={app} className="w-5 h-5" />
                      <span className="text-[9px] font-mono">{appNames[app]?.substring(0, 6) || app}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Condition */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-2">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {triggerConditions.map((c) => (
                    <button
                      key={c.value} type="button"
                      onClick={() => setFormCondition(c.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        formCondition === c.value
                          ? "bg-rose-500/10 border-rose-500/30"
                          : "bg-muted/40 border-card-border hover:border-card-border/80"
                      }`}
                    >
                      <span className={`text-xs font-bold ${formCondition === c.value ? "text-rose-600 dark:text-rose-400" : "text-text-primary"}`}>{c.label}</span>
                      <p className="text-[10px] text-text-secondary mt-0.5">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Config */}
              {formCondition === "keyword_match" && (
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Keywords (comma-separated)</label>
                  <input type="text" value={formKeywords} onChange={(e) => setFormKeywords(e.target.value)} placeholder="urgent, ASAP, deadline, review"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm" />
                </div>
              )}
              {formCondition === "priority_sender" && (
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Priority Senders (comma-separated)</label>
                  <input type="text" value={formSenders} onChange={(e) => setFormSenders(e.target.value)} placeholder="ceo, john, boss@company.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm" />
                </div>
              )}
              {formCondition === "unread_threshold" && (
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Unread Count Threshold</label>
                  <input type="number" value={formThreshold} onChange={(e) => setFormThreshold(e.target.value)} min="1"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm" />
                </div>
              )}
              {formCondition === "deadline_approaching" && (
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Hours Before Deadline</label>
                  <input type="number" value={formHoursAhead} onChange={(e) => setFormHoursAhead(e.target.value)} min="1"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-sm" />
                </div>
              )}

              {/* Priority, Notification, Frequency, Action row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Priority Level</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-rose-500/50 cursor-pointer shadow-sm">
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Notification Method</label>
                  <select value={formNotification} onChange={(e) => setFormNotification(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-rose-500/50 cursor-pointer shadow-sm">
                    <option value="in_app">In-App Alert</option>
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Frequency</label>
                  <div className="flex gap-2">
                    {["realtime", "hourly", "daily"].map((f) => (
                      <button key={f} type="button" onClick={() => setFormFrequency(f)}
                        className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-semibold capitalize border transition-all cursor-pointer ${
                          formFrequency === f
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-muted/40 border-card-border text-text-secondary hover:text-text-primary"
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Action on Trigger</label>
                  <select value={formAction} onChange={(e) => setFormAction(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-rose-500/50 cursor-pointer shadow-sm">
                    <option value="notify">Notify Only</option>
                    <option value="auto_reply">Auto Reply</option>
                    <option value="create_task">Create Task</option>
                    <option value="escalate">Escalate</option>
                  </select>
                </div>
              </div>

              {/* Submit & Test row */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestAlert}
                  disabled={formTesting || !formName || formApps.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {formTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Test Alert
                </button>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowCreateDialog(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary border border-card-border hover:bg-muted transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={formSubmitting || !formName || formApps.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                    {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Create Alert Rule
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          ALERT DETAILS DIALOG
         ═══════════════════════════════════════════════════════════════════════════ */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
          <div
            className="bg-card rounded-3xl border border-card-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div className="flex items-center justify-between p-6 border-b border-card-border sticky top-0 bg-card z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted border border-card-border flex items-center justify-center shadow-sm">
                  <PlatformIcon platformId={selectedAlert.source_app} className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-text-primary">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${priorityColors[selectedAlert.priority]?.bg} ${priorityColors[selectedAlert.priority]?.text} border ${priorityColors[selectedAlert.priority]?.border}`}>
                      {selectedAlert.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${statusColors[selectedAlert.status]?.bg} ${statusColors[selectedAlert.status]?.text}`}>
                      {selectedAlert.status}
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary">{timeAgo(selectedAlert.created_at)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-muted transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-6">
              {/* Alert content */}
              <div className="glassmorphism rounded-2xl p-4 border border-card-border">
                <p className="text-xs font-mono text-text-secondary uppercase mb-2">Alert Description</p>
                <p className="text-sm text-text-primary leading-relaxed">{selectedAlert.description}</p>
                {selectedAlert.full_content && Object.keys(selectedAlert.full_content).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-card-border">
                    <p className="text-xs font-mono text-text-secondary uppercase mb-2">Full Content</p>
                    <pre className="text-xs text-text-primary bg-muted rounded-xl p-3 border border-card-border overflow-x-auto whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedAlert.full_content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedAlert.status !== "resolved" && (
                  <button onClick={() => handleAction(selectedAlert.id, "resolve")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
                {!selectedAlert.archived_at && (
                  <button onClick={() => handleAction(selectedAlert.id, "archive")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-550/10 hover:bg-zinc-550/20 text-text-secondary border border-card-border transition-all cursor-pointer shadow-sm">
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                )}
                {selectedAlert.status !== "acknowledged" && selectedAlert.status !== "resolved" && (
                  <button onClick={() => handleAction(selectedAlert.id, "acknowledge")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-all cursor-pointer shadow-sm">
                    <Eye className="w-3.5 h-3.5" /> Acknowledge
                  </button>
                )}
                {selectedAlert.status !== "snoozed" && selectedAlert.status !== "resolved" && (
                  <div className="relative">
                    <button onClick={() => setShowSnoozePicker(!showSnoozePicker)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-text-secondary hover:text-text-primary border border-card-border transition-all cursor-pointer shadow-sm">
                      <BellOff className="w-3.5 h-3.5" /> Snooze
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showSnoozePicker && (
                      <div className="absolute top-full left-0 mt-1 bg-card border border-card-border rounded-xl shadow-xl z-20 py-1 w-40">
                        {[
                          { label: "15 minutes", mins: 15 },
                          { label: "30 minutes", mins: 30 },
                          { label: "1 hour", mins: 60 },
                          { label: "4 hours", mins: 240 },
                          { label: "Tomorrow", mins: 1440 },
                        ].map((opt) => (
                          <button key={opt.mins} onClick={() => { handleAction(selectedAlert.id, "snooze", { snooze_minutes: opt.mins }); setShowSnoozePicker(false); }}
                            className="w-full text-left px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer">
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => handleAction(selectedAlert.id, "resolve")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer shadow-sm">
                  <ListChecks className="w-3.5 h-3.5" /> Convert to Task
                </button>
              </div>

              {/* AI Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-card-border pb-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Intelligence</h3>
                </div>

                {/* AI Summary */}
                <div className="glassmorphism rounded-2xl p-4 border border-violet-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-violet-500" /> AI Summary
                    </span>
                    <button onClick={() => handleAiAction(selectedAlert.id, "summarize")} disabled={aiLoading === "summarize"}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-all cursor-pointer disabled:opacity-50">
                      {aiLoading === "summarize" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate
                    </button>
                  </div>
                  {selectedAlert.ai_data?.summary ? (
                    <p className="text-xs text-text-secondary leading-relaxed">{selectedAlert.ai_data.summary}</p>
                  ) : (
                    <p className="text-[11px] text-text-secondary italic">Click &quot;Generate&quot; to create an AI summary</p>
                  )}
                </div>

                {/* AI Suggested Action */}
                <div className="glassmorphism rounded-2xl p-4 border border-violet-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Suggested Next Action
                    </span>
                    <button onClick={() => handleAiAction(selectedAlert.id, "suggest_action")} disabled={aiLoading === "suggest_action"}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-all cursor-pointer disabled:opacity-50">
                      {aiLoading === "suggest_action" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Suggest
                    </button>
                  </div>
                  {selectedAlert.ai_data?.action ? (
                    <p className="text-xs text-text-secondary leading-relaxed">{selectedAlert.ai_data.action}</p>
                  ) : (
                    <p className="text-[11px] text-text-secondary italic">Click &quot;Suggest&quot; to get AI recommendations</p>
                  )}
                </div>

                {/* AI Draft Reply */}
                <div className="glassmorphism rounded-2xl p-4 border border-violet-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Draft Reply
                    </span>
                    <button onClick={() => handleAiAction(selectedAlert.id, "draft_reply")} disabled={aiLoading === "draft_reply"}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-all cursor-pointer disabled:opacity-50">
                      {aiLoading === "draft_reply" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Draft
                    </button>
                  </div>

                  {showReplyComposer ? (
                    <div className="space-y-3">
                      <textarea
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-card border border-card-border text-text-primary focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none shadow-sm"
                      />
                      <div className="flex items-center justify-between">
                        <button onClick={() => { setShowReplyComposer(false); setDraftReply(""); }}
                          className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                          Cancel
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
                          onClick={() => { handleAction(selectedAlert.id, "resolve"); setShowReplyComposer(false); setDraftReply(""); }}
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send via {appNames[selectedAlert.source_app] || selectedAlert.source_app}
                        </button>
                      </div>
                    </div>
                  ) : selectedAlert.ai_data?.draft_reply ? (
                    <div>
                      <p className="text-xs text-text-secondary leading-relaxed mb-2 whitespace-pre-wrap">{selectedAlert.ai_data.draft_reply}</p>
                      <button onClick={() => { setDraftReply(selectedAlert.ai_data?.draft_reply || ""); setShowReplyComposer(true); }}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                        <ExternalLink className="w-3 h-3" /> Edit & Send
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-secondary italic">Click &quot;Draft&quot; to generate an AI reply</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
