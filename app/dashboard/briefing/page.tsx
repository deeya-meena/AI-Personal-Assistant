"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  BookOpen01Icon, 
  Calendar03Icon, 
  Mail01Icon, 
  Message01Icon, 
  StarIcon, 
  ArrowRight01Icon,
  PlusSignIcon,
  Delete02Icon,
  Clock01Icon
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { 
  Loader2, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  AtSign, 
  CheckSquare, 
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  Plus,
  Lock,
  ChevronRight
} from "lucide-react";

const getValidToken = async (): Promise<string> => {
  let token = (insforge as unknown as { tokenManager?: { getAccessToken: () => string } }).tokenManager?.getAccessToken() || "";
  if (!token) return "";
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp * 1000 < Date.now() + 10000; // 10s buffer
      if (isExpired) {
        console.log("[Briefing] Access token expired, refreshing session...");
        const { data, error } = await insforge.auth.refreshSession();
        if (!error && data?.accessToken) {
          token = data.accessToken;
        } else {
          console.error("[Briefing] Failed to refresh session:", error);
        }
      }
    }
  } catch (err) {
    console.error("[Briefing] Error parsing/refreshing token:", err);
  }
  return token;
};

interface CategoryData {
  count: number;
  summary: string;
  items: any[];
}

interface BriefingContent {
  welcomeMessage: string;
  highlight: string;
  categories: {
    email: CategoryData;
    messages: CategoryData;
    mentions: CategoryData;
    tasks: CategoryData;
    follow_ups: CategoryData;
  };
}

interface Schedule {
  id: string;
  name: string;
  description: string;
  selected_apps: string[];
  selected_categories: string[];
  scheduled_time: string;
  frequency: string;
  priority_level: string;
  next_run_at: string;
}

interface BriefingRun {
  id: string;
  name: string;
  summary: string;
  created_at: string;
  schedule_id: string | null;
  custom_briefing_schedules?: {
    name: string;
    description: string;
  };
}

// Platform vector SVGs for App Catalog selection
const PlatformIcon = ({ source, className = "w-4 h-4" }: { source: string; className?: string }) => {
  if (source === "gmail") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#F87171" />
      </svg>
    );
  }
  if (source === "whatsapp") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12.004 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12.004 22C17.528 22 22 17.52 22 12C22 6.48 17.52 2 12.004 2ZM17.184 15.65C16.964 16.27 16.084 16.76 15.424 16.9C14.974 17 14.394 17.09 12.424 16.27C9.904 15.22 8.274 12.66 8.154 12.5C8.034 12.34 7.154 11.17 7.154 9.96C7.154 8.75 7.774 8.16 8.024 7.9C8.214 7.71 8.524 7.63 8.824 7.63C8.924 7.63 9.024 7.64 9.114 7.64C9.384 7.65 9.524 7.67 9.704 8.1C9.934 8.65 10.494 10.01 10.564 10.15C10.634 10.29 10.704 10.48 10.614 10.67C10.524 10.86 10.454 10.95 10.314 11.11C10.174 11.27 10.044 11.4 9.904 11.57C9.774 11.72 9.624 11.89 9.794 12.18C9.964 12.47 10.554 13.43 11.424 14.21C12.554 15.22 13.484 15.54 13.804 15.67C14.044 15.77 14.324 15.75 14.504 15.56C14.734 15.31 15.024 14.91 15.314 14.5C15.524 14.21 15.774 14.17 16.034 14.27C16.304 14.37 17.704 15.06 17.994 15.21C18.284 15.36 18.474 15.44 18.544 15.57C18.614 15.7 18.614 16.34 16.394 16.97C16.394 16.97 17.184 15.65 17.184 15.65Z" fill="#34D399" />
      </svg>
    );
  }
  if (source === "slack") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.835 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 8.835 0a2.528 2.528 0 0 1 2.52 2.522v2.52h-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.793a2.528 2.528 0 0 1-2.52-2.522V8.823a2.528 2.528 0 0 1 2.52-2.52h5.042zm10.123 3.793a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.261 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.793a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.042zm-3.793 10.123a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zm0-1.261a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.042a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.042z" fill="#E2E8F0" />
      </svg>
    );
  }
  if (source === "github") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#9CA3AF" />
      </svg>
    );
  }
  if (source === "jira") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M11.58 2.03c.27 0 .53.11.71.3l9.38 9.38a1 1 0 0 1 0 1.42l-9.38 9.38a1 1 0 0 1-1.42 0l-9.38-9.38a1 1 0 0 1 0-1.42l9.38-9.38c.18-.19.44-.3.71-.3z" fill="#3B82F6" />
      </svg>
    );
  }
  return (
    <div className={`${className} rounded bg-muted border border-card-border flex items-center justify-center text-[9px] font-bold text-cyan-600 dark:text-cyan-400 capitalize shadow-sm`}>
      {source?.charAt(0) || "P"}
    </div>
  );
};

export default function BriefingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyBrief, setDailyBrief] = useState<BriefingContent | null>(null);
  const [runs, setRuns] = useState<BriefingRun[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    description: "",
    selected_apps: [] as string[],
    selected_categories: [] as string[],
    scheduled_time: "09:00",
    frequency: "daily",
    priority_level: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // App catalog
  const availableApps = [
    { id: "gmail", name: "Gmail" },
    { id: "whatsapp", name: "WhatsApp" },
    { id: "slack", name: "Slack" },
    { id: "github", name: "GitHub" },
    { id: "jira", name: "Jira" },
    { id: "outlook", name: "Outlook" },
    { id: "discord", name: "Discord" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "telegram", name: "Telegram" },
    { id: "notion", name: "Notion" }
  ];

  // Category catalog
  const categoriesList = [
    { id: "email", name: "Email", icon: Mail, desc: "Emails from Gmail and Outlook" },
    { id: "messages", name: "Messages", icon: MessageSquare, desc: "Personal chats and DMs" },
    { id: "mentions", name: "Mentions", icon: AtSign, desc: "Channel mentions and comments" },
    { id: "tasks", name: "Tasks", icon: CheckSquare, desc: "Action items and issues" },
    { id: "follow_ups", name: "Follow-ups", icon: AlertCircle, desc: "Replies and urgent flags" }
  ];

  // Fetch all initial data
  const fetchData = async (forceRefresh = false) => {
    try {
      if (!user) return;
      
      const token = await getValidToken();
      if (!token) return;

      // 1. Fetch connected integrations
      const { data: integrations } = await insforge.database
        .from("user_integrations")
        .select("platform_id, status")
        .eq("user_id", user.id);
      
      const connected = integrations
        ?.filter((i: any) => i.status === "connected")
        .map((i: any) => i.platform_id) || [];
      setConnectedApps(connected);

      // 2. Fetch default daily briefing
      const briefUrl = `/api/dashboard/brief${forceRefresh ? "?refresh=true" : ""}`;
      const briefRes = await fetch(briefUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (briefRes.ok) {
        const briefData = await briefRes.json();
        setDailyBrief(briefData);
      }

      // 3. Fetch custom runs (runs where schedule_id is not null)
      const runsRes = await fetch("/api/dashboard/briefing/runs?custom=true", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setRuns(runsData);
      }

      // 4. Fetch schedules
      const schedulesRes = await fetch("/api/dashboard/briefing/schedules", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      }

    } catch (err) {
      console.error("Failed to load briefing dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
  };

  // Create custom schedule
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.name) return;
    setIsSubmitting(true);

    try {
      const token = await getValidToken();
      if (!token) return;

      // Calculate next_run_at in user local time context
      const [hours, minutes] = newSchedule.scheduled_time.split(":").map(Number);
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);

      // If scheduled time is in the past, schedule for tomorrow
      if (targetDate.getTime() <= Date.now()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const res = await fetch("/api/dashboard/briefing/schedules", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newSchedule,
          next_run_at: targetDate.toISOString()
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setNewSchedule({
          name: "",
          description: "",
          selected_apps: [],
          selected_categories: [],
          scheduled_time: "09:00",
          frequency: "daily",
          priority_level: "medium"
        });
        // Reload data
        fetchData();
      }

    } catch (err) {
      console.error("Failed to create schedule:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom schedule?")) return;
    
    try {
      const token = await getValidToken();
      if (!token) return;

      const res = await fetch(`/api/dashboard/briefing/schedules?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  const toggleAppSelection = (appId: string) => {
    if (!connectedApps.includes(appId)) return;
    setNewSchedule(prev => ({
      ...prev,
      selected_apps: prev.selected_apps.includes(appId)
        ? prev.selected_apps.filter(id => id !== appId)
        : [...prev.selected_apps, appId]
    }));
  };

  const toggleCategorySelection = (catId: string) => {
    setNewSchedule(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(catId)
        ? prev.selected_categories.filter(id => id !== catId)
        : [...prev.selected_categories, catId]
    }));
  };

  const todayItems = dailyBrief
    ? Object.keys(dailyBrief.categories).flatMap((catKey) => {
        const catData = dailyBrief.categories[catKey as keyof typeof dailyBrief.categories];
        return (catData.items || []).map((item: any) => ({
          ...item,
          category: catKey,
        }));
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-secondary">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
        <p className="text-sm font-mono tracking-widest">SYNTHESIZING DAILY COMMUNICATIONS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-card-border">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Intelligence Briefing</h1>
          <p className="text-xs text-text-secondary">Daily digests generated from all your connected platforms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-card hover:bg-muted border border-card-border transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>Regenerate</span>
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Briefing</span>
          </button>
        </div>
      </div>

      {/* Today's Briefing Card (100% width) */}
      {dailyBrief && (
        <div className="relative group overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-950/20 p-6 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-inner">
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                Today's Briefing
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">
              {dailyBrief.welcomeMessage}
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm leading-relaxed font-medium">
              {dailyBrief.highlight}
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (~65-70% width: md:span-7 lg:span-8) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {/* Highlights Feed Card */}
          <div className="bg-card border border-card-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Highlights Feed
              </h3>
            </div>
            
            {todayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 text-text-secondary min-h-[300px]">
                <Sparkles className="w-8 h-8 text-text-secondary mb-2 animate-pulse" />
                <p className="text-sm font-medium text-text-primary">Your feed is fully caught up!</p>
                <p className="text-xs text-text-secondary mt-1 max-w-[240px]">No new updates detected in Gmail, WhatsApp, Slack, GitHub, or Jira today.</p>
              </div>
            ) : (
              <div className="space-y-1 divide-y divide-card-border max-h-[600px] overflow-y-auto pr-1">
                {todayItems.map((item: any, idx: number) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => router.push(`/dashboard/briefing/details?category=${item.category}`)}
                    className="group py-4 first:pt-0 last:pb-0 hover:bg-muted/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-card border border-card-border flex items-center justify-center shadow-sm">
                          <PlatformIcon source={item.source} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary group-hover:text-accent-violet transition-colors line-clamp-1">
                            {item.sender}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {item.time && (
                          <span className="text-[10px] font-mono text-text-secondary">
                            {item.time}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 pl-9">
                      <h4 className="text-xs font-semibold text-text-primary line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-text-secondary text-xs leading-normal line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (~30-35% width: md:span-5 lg:span-4) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          
          {/* Category Analytics Card */}
          <div className="bg-card border border-card-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Category Analytics
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">Explore sections in detail</p>
            </div>
            
            <div className="space-y-3">
              {categoriesList.map((cat) => {
                const currentCatData = dailyBrief?.categories?.[cat.id as keyof typeof dailyBrief.categories] || { count: 0, summary: "No updates found." };
                const IconComponent = cat.icon;
                
                const themeStyles = {
                  email: {
                    card: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-700 dark:text-blue-200",
                    iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-300",
                  },
                  messages: {
                    card: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-700 dark:text-emerald-200",
                    iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
                  },
                  mentions: {
                    card: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-700 dark:text-purple-200",
                    iconBg: "bg-purple-500/20 text-purple-600 dark:text-purple-300",
                  },
                  tasks: {
                    card: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-700 dark:text-amber-200",
                    iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
                  },
                  follow_ups: {
                    card: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-700 dark:text-rose-200",
                    iconBg: "bg-rose-500/20 text-rose-600 dark:text-rose-300",
                  },
                };
                
                const currentStyle = themeStyles[cat.id as keyof typeof themeStyles] || themeStyles.email;
                
                return (
                  <div
                    key={cat.id}
                    onClick={() => router.push(`/dashboard/briefing/details?category=${cat.id}`)}
                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-sm ${currentStyle.card}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-inner ${currentStyle.iconBg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold font-sans">
                          {cat.name}
                        </span>
                      </div>
                      {currentCatData.count > 0 && (
                        <span className="text-xs font-bold opacity-80">
                          {currentCatData.count}
                        </span>
                      )}
                    </div>
                    <p className="opacity-75 text-[11px] font-medium line-clamp-1 leading-normal">
                      {currentCatData.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Schedules Card */}
          <div className="bg-card border border-card-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Custom Schedules
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Automated briefing timing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 border border-card-border flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {schedules.length === 0 ? (
              <div className="border border-card-border border-dashed rounded-2xl p-6 text-center text-text-secondary bg-muted/20 min-h-[120px] flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-text-secondary mb-2" />
                <p className="text-[11px]">No schedules configured.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-3 rounded-2xl border border-card-border bg-muted/30 space-y-2 relative group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                          <HugeiconsIcon icon={Calendar03Icon} size={13} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary line-clamp-1">{schedule.name}</h4>
                          <p className="text-[10px] text-text-secondary font-medium">
                            {schedule.frequency} @ {schedule.scheduled_time}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer flex-shrink-0"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Briefings Card */}
          <div className="bg-card border border-card-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Past Briefings
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">History of generated runs</p>
            </div>
            
            {runs.length === 0 ? (
              <div className="border border-card-border border-dashed rounded-2xl p-6 text-center text-text-secondary bg-muted/20 min-h-[120px] flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 text-text-secondary mb-2" />
                <p className="text-[11px]">No past runs found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => router.push(`/dashboard/briefing/details?briefingId=${run.id}`)}
                    className="p-3 rounded-2xl border border-card-border hover:border-accent-violet/30 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-text-secondary">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-text-primary line-clamp-1">
                          {run.name}
                        </h4>
                        <p className="text-[9px] font-mono text-text-secondary">
                          {new Date(run.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. Custom Briefing Dialog/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-card-border rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Create Custom Briefing</h3>
                <p className="text-xs text-text-secondary mt-1">Configure automated background syntheses for select apps.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-card-border hover:bg-muted transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Briefing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Synced Align"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-card-border focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none text-sm text-text-primary placeholder-text-secondary shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Description or Goal</label>
                <textarea
                  placeholder="e.g. Gather core updates on PR merges and deploy blockers."
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-card-border focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none text-sm text-text-primary placeholder-text-secondary resize-none shadow-sm"
                />
              </div>

              {/* Selected Apps */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block">Select Platforms</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {availableApps.map((app) => {
                    const isSelected = newSchedule.selected_apps.includes(app.id);
                    const isConnected = connectedApps.includes(app.id);
                    return (
                      <div
                        key={app.id}
                        onClick={() => isConnected && toggleAppSelection(app.id)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                          !isConnected
                            ? "opacity-40 cursor-not-allowed bg-muted border-card-border text-text-secondary"
                            : isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 text-text-primary cursor-pointer shadow-sm"
                            : "bg-card border-card-border text-text-secondary hover:text-text-primary hover:bg-muted cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <PlatformIcon source={app.id} className="w-4 h-4 flex-shrink-0" />
                          <span>{app.name}</span>
                        </div>
                        {!isConnected && (
                          <span className="text-[9px] font-mono text-text-secondary flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Categories */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block">Select Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categoriesList.map((cat) => {
                    const isSelected = newSchedule.selected_categories.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 text-text-primary shadow-sm"
                            : "bg-card border-card-border text-text-secondary hover:text-text-primary hover:bg-muted"
                        }`}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule time, frequency, priority */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.scheduled_time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-card-border text-sm text-text-primary outline-none focus:border-accent-violet shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">Frequency</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-xs text-text-primary outline-none focus:border-accent-violet cursor-pointer shadow-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">Priority</label>
                  <select
                    value={newSchedule.priority_level}
                    onChange={(e) => setNewSchedule({ ...newSchedule, priority_level: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-xs text-text-primary outline-none focus:border-accent-violet cursor-pointer shadow-sm"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-card-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-card border border-card-border hover:bg-muted transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Run Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
