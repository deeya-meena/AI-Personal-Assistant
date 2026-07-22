"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTheme as useNextTheme } from "next-themes";
import { insforge } from "../../../lib/insforge";
import {
  User,
  Brain,
  Bell,
  Lock,
  Compass,
  Eye,
  Settings,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  Save,
  CheckCircle2
} from "lucide-react";

// Official brand vector SVGs customized to w-8 h-8 p-1.5
const GmailIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#ea4335" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M12.004 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12.004 22C17.528 22 22 17.52 22 12C22 6.48 17.52 2 12.004 2ZM17.184 15.65C16.964 16.27 16.084 16.76 15.424 16.9C14.974 17 14.394 17.09 12.424 16.27C9.904 15.22 8.274 12.66 8.154 12.5C8.034 12.34 7.154 11.17 7.154 9.96C7.154 8.75 7.774 8.16 8.024 7.9C8.214 7.71 8.524 7.63 8.824 7.63C8.924 7.63 9.024 7.64 9.114 7.64C9.384 7.65 9.524 7.67 9.704 8.1C9.934 8.65 10.494 10.01 10.564 10.15C10.634 10.29 10.704 10.48 10.614 10.67C10.524 10.86 10.454 10.95 10.314 11.11C10.174 11.27 10.044 11.4 9.904 11.57C9.774 11.72 9.624 11.89 9.794 12.18C9.964 12.47 10.554 13.43 11.424 14.21C12.554 15.22 13.484 15.54 13.804 15.67C14.044 15.77 14.324 15.75 14.504 15.56C14.734 15.31 15.024 14.91 15.314 14.5C15.524 14.21 15.774 14.17 16.034 14.27C16.304 14.37 17.704 15.06 17.994 15.21C18.284 15.36 18.474 15.44 18.544 15.57C18.614 15.7 18.614 16.34 16.394 16.97C16.394 16.97 17.184 15.65 17.184 15.65Z" fill="#25d366" />
  </svg>
);

const SlackIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.043zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zm0 1.262a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.825a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.78a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522h-5.043a2.528 2.528 0 0 1-2.522-2.522V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.134a2.528 2.528 0 0 1 2.52 2.522a2.528 2.528 0 0 1-2.52 2.521a2.528 2.528 0 0 1-2.522-2.521v-2.522h2.522zm0-1.261a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H20.22a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" fill="#4a154b" />
  </svg>
);

const OutlookIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M12 2H4C2.9 2 2.01 2.9 2.01 4L2 20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8L12 2ZM20 20H4V8H12V4H20V20ZM10 12H6V10H10V12ZM16 16H6V14H16V16ZM18 10H14V12H18V10Z" fill="#0078d4" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8L14.99 16.6C14.87 17.15 14.53 17.28 14.07 17.02L11.56 15.17L10.35 16.33C10.22 16.46 10.11 16.57 9.85 16.57L10.03 14.01L14.69 9.8C14.89 9.62 14.65 9.52 14.38 9.7L8.62 13.33L6.14 12.56C5.6 12.39 5.59 12.02 6.25 11.76L15.93 8.02C16.38 7.86 16.77 8.13 16.64 8.8Z" fill="#24a1de" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-8 h-8 p-1.5" viewBox="0 0 24 24" fill="none">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.172-.393-.412-.882-.63-1.25a.074.074 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865f2" />
  </svg>
);

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { theme: rawTheme, setTheme } = useNextTheme();

  // Settings States
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC-5");
  const [assistantContext, setAssistantContext] = useState("");

  // AI behavior states
  const [summaryDetail, setSummaryDetail] = useState("Standard Detail");
  const [replyTone, setReplyTone] = useState("Professional");
  const [writingStyle, setWritingStyle] = useState("Direct & Clear");
  const [autoPrepareDrafts, setAutoPrepareDrafts] = useState(true);
  const [prioritizeImportant, setPrioritizeImportant] = useState(true);
  const [dailyBriefingLevel, setDailyBriefingLevel] = useState("Full Details");

  // Notifications states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [calendarReminders, setCalendarReminders] = useState(true);
  const [criticalAlertsOnly, setCriticalAlertsOnly] = useState(false);

  // Privacy & security states
  const [storeHistory, setStoreHistory] = useState(true);
  const [aiMemory, setAiMemory] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  // Database Integration Statuses
  const [dbData, setDbData] = useState<Record<string, { status: string; synced_count: number }>>({});
  const [loadingDb, setLoadingDb] = useState(true);

  // Form saving feedback
  const [savedMessage, setSavedMessage] = useState(false);

  // Sync profile display name and default values
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name || "Aura User");
    } else {
      setDisplayName("Aura User");
    }
    setAssistantContext("Summarize calendar changes, keep email replies concise.");
  }, [profile]);

  // Load connection statuses from database
  useEffect(() => {
    async function loadStatuses() {
      if (!user) return;
      setLoadingDb(true);
      try {
        const { data, error } = await insforge.database
          .from("user_integrations")
          .select("platform_id, status, synced_count")
          .eq("user_id", user.id);

        if (error) {
          console.error("Failed to load integrations from DB:", error);
        } else if (data) {
          const map: Record<string, { status: string; synced_count: number }> = {};
          data.forEach((row: any) => {
            map[row.platform_id] = {
              status: row.status,
              synced_count: row.synced_count || 0
            };
          });
          setDbData(map);
        }
      } catch (err) {
        console.error("DB Load exception:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    loadStatuses();
  }, [user]);

  const handleReset = () => {
    if (profile?.name) {
      setDisplayName(profile.name);
    } else {
      setDisplayName("Aura User");
    }
    setTimezone("UTC-5");
    setAssistantContext("Summarize calendar changes, keep email replies concise.");
    setSummaryDetail("Standard Detail");
    setReplyTone("Professional");
    setWritingStyle("Direct & Clear");
    setAutoPrepareDrafts(true);
    setPrioritizeImportant(true);
    setDailyBriefingLevel("Full Details");
    setEmailNotifications(true);
    setDesktopNotifications(true);
    setWhatsappAlerts(true);
    setSlackAlerts(false);
    setCalendarReminders(true);
    setCriticalAlertsOnly(false);
    setStoreHistory(true);
    setAiMemory(true);
    setAnalytics(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const { error } = await insforge.database
          .from("users")
          .update({ name: displayName })
          .eq("id", user.id);
        
        if (error) {
          console.error("Failed to save display name:", error);
        } else {
          await refreshProfile();
        }
      } catch (err) {
        console.error("Database save error:", err);
      }
    }
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {savedMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400/20 animate-toast-in">
          <CheckCircle2 className="w-5 h-5 animate-pulse" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      {/* Main settings form wrapper */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your personal workspace, AI preferences and connected integrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-95 duration-200"
            >
              Reset
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-lg bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* CSS Grid Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.85fr_1fr] lg:grid-cols-[2.2fr_minmax(360px,1fr)] gap-6 items-start">
          
          {/* Left Column (70%) */}
          <div className="space-y-6">
            
            {/* Account Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Account Profile</h2>
                  <p className="text-xs text-muted-foreground">Manage your workspace identity and personal details.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm"
                    placeholder="Enter your display name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <option value="UTC-8">Pacific Time (PT) - UTC-8</option>
                    <option value="UTC-5">Eastern Time (ET) - UTC-5</option>
                    <option value="UTC+0">Coordinated Universal Time (UTC)</option>
                    <option value="UTC+1">Central European Time (CET) - UTC+1</option>
                    <option value="UTC+5.5">Indian Standard Time (IST) - UTC+5.5</option>
                    <option value="UTC+8">Singapore Time (SGT) - UTC+8</option>
                    <option value="UTC+9">Japan Standard Time (JST) - UTC+9</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Assistant Context</label>
                <textarea
                  value={assistantContext}
                  onChange={(e) => setAssistantContext(e.target.value)}
                  className="w-full min-h-[120px] p-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm resize-y"
                  placeholder="Describe rules or instructions for Aura, e.g. Summarize calendar changes, keep email replies concise."
                />
              </div>
            </div>

            {/* AI Agent Behavior */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">AI Agent Behavior</h2>
                  <p className="text-xs text-muted-foreground">Customize how Aura interacts, drafts replies, and summarizes tasks.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Summary Detail</label>
                  <select
                    value={summaryDetail}
                    onChange={(e) => setSummaryDetail(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <option>Short Summary</option>
                    <option>Standard Detail</option>
                    <option>Comprehensive Analysis</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Reply Tone</label>
                  <select
                    value={replyTone}
                    onChange={(e) => setReplyTone(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Enthusiastic</option>
                    <option>Empathetic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <option>Direct & Clear</option>
                    <option>Descriptive & Eloquent</option>
                    <option>Technical & Precise</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Daily Briefing Level</label>
                  <select
                    value={dailyBriefingLevel}
                    onChange={(e) => setDailyBriefingLevel(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent-violet transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <option>Summary Only</option>
                    <option>Full Details</option>
                    <option>Critical Flags Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                {/* Auto Prepare Drafts */}
                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-foreground block">Auto Prepare Drafts</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">Let Aura suggest custom drafts directly in digests.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPrepareDrafts(!autoPrepareDrafts)}
                    className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
                      autoPrepareDrafts ? "bg-accent-violet" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white dark:bg-card absolute top-1 transition-all shadow-sm ${
                        autoPrepareDrafts ? "right-1.5" : "left-1.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Prioritize Important Items */}
                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-foreground block">Prioritize Important</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">Filter out non-urgent emails and notifications.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrioritizeImportant(!prioritizeImportant)}
                    className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
                      prioritizeImportant ? "bg-accent-violet" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white dark:bg-card absolute top-1 transition-all shadow-sm ${
                        prioritizeImportant ? "right-1.5" : "left-1.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                  <p className="text-xs text-muted-foreground">Manage your digest synchronization and communication alerts.</p>
                </div>
              </div>

              <div className="divide-y divide-border/60">
                {[
                  {
                    id: "email",
                    title: "Email Notifications",
                    description: "Receive daily email digests of your AI highlights.",
                    state: emailNotifications,
                    setter: setEmailNotifications
                  },
                  {
                    id: "desktop",
                    title: "Desktop Notifications",
                    description: "Show browser push notifications for urgent alerts.",
                    state: desktopNotifications,
                    setter: setDesktopNotifications
                  },
                  {
                    id: "whatsapp",
                    title: "WhatsApp Alerts",
                    description: "Receive critical direct messages on your connected WhatsApp number.",
                    state: whatsappAlerts,
                    setter: setWhatsappAlerts
                  },
                  {
                    id: "slack",
                    title: "Slack Alerts",
                    description: "Push notifications and reports to designated Slack channels.",
                    state: slackAlerts,
                    setter: setSlackAlerts
                  },
                  {
                    id: "calendar",
                    title: "Calendar Reminders",
                    description: "Sync events and schedule changes directly to calendar.",
                    state: calendarReminders,
                    setter: setCalendarReminders
                  },
                  {
                    id: "critical",
                    title: "Critical Alerts Only",
                    description: "Mute non-urgent notifications to minimize distractions.",
                    state: criticalAlertsOnly,
                    setter: setCriticalAlertsOnly
                  }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="pr-4">
                      <span className="text-sm font-semibold text-foreground block">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setter(!item.state)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
                        item.state ? "bg-accent-violet" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white dark:bg-card absolute top-1 transition-all shadow-sm ${
                          item.state ? "right-1.5" : "left-1.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Privacy & Security</h2>
                  <p className="text-xs text-muted-foreground">Control how your personal workspace and AI memory context are stored.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "history",
                    title: "Store conversation history",
                    description: "Keep history of your chats to train and improve context accuracy.",
                    state: storeHistory,
                    setter: setStoreHistory
                  },
                  {
                    id: "memory",
                    title: "AI memory",
                    description: "Enable persistent user context learning between sessions.",
                    state: aiMemory,
                    setter: setAiMemory
                  },
                  {
                    id: "analytics",
                    title: "Analytics sharing",
                    description: "Share anonymous usage analytics to help improve Aura.",
                    state: analytics,
                    setter: setAnalytics
                  }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                    <div className="pr-4">
                      <span className="text-sm font-semibold text-foreground block">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setter(!item.state)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
                        item.state ? "bg-accent-violet" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white dark:bg-card absolute top-1 transition-all shadow-sm ${
                          item.state ? "right-1.5" : "left-1.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/60 flex flex-wrap gap-3 items-center justify-between">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 duration-200"
                  onClick={() => alert("Data export queued. You will receive an email shortly.")}
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span>Export Data</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 duration-200"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this workspace? This action is permanent and cannot be undone.")) {
                      alert("Workspace deletion is locked for demo safety.");
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Workspace</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column / Sidebar (30%) */}
          <div className="space-y-6">
            
            {/* Appearance Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Appearance</h2>
                  <p className="text-xs text-muted-foreground">Personalize your interface theme choice.</p>
                </div>
              </div>

              {/* Theme Selector Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Theme Mode</label>
                <div className="flex gap-2">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor }
                  ].map((t) => {
                    const rawThemeValue = rawTheme || "system";
                    const isActive = rawThemeValue === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 duration-200 ${
                          isActive
                            ? "bg-accent-violet/10 border-accent-violet text-accent-violet shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <t.icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] font-semibold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Row */}
              <div className="p-3.5 bg-muted/60 border border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Active Interface:</span>
                </div>
                <span className="text-xs font-bold text-foreground capitalize flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-accent-indigo animate-pulse" : "bg-amber-400 animate-pulse"}`} />
                  {theme} mode
                </span>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-sm font-semibold text-foreground">Quick Toggle</span>
                  <p className="text-xs text-muted-foreground">Switch between light and dark modes.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    theme === "dark" ? "bg-accent-violet" : "bg-muted"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white dark:bg-card absolute top-1 transition-all shadow-sm ${
                      theme === "dark" ? "right-1.5" : "left-1.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Connected Apps Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 transition-all hover:shadow-md hover:border-border/80 duration-350">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-accent-violet">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Connected Apps</h2>
                  <p className="text-xs text-muted-foreground">List and manage connected integrations.</p>
                </div>
              </div>

              {loadingDb ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  <span>Loading integration statuses...</span>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {[
                    { id: "gmail", name: "Gmail", icon: GmailIcon },
                    { id: "whatsapp", name: "WhatsApp", icon: WhatsAppIcon },
                    { id: "slack", name: "Slack", icon: SlackIcon },
                    { id: "outlook", name: "Calendar", icon: OutlookIcon },
                    { id: "telegram", name: "Telegram", icon: TelegramIcon },
                    { id: "discord", name: "Discord", icon: DiscordIcon }
                  ].map((app) => {
                    const isConnected = dbData[app.id]?.status === "connected";
                    return (
                      <div key={app.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-background rounded-lg border border-border flex items-center justify-center overflow-hidden">
                            <app.icon />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">{app.name}</span>
                            {isConnected ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-muted text-muted-foreground border border-border mt-0.5">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href="/dashboard/integrations"
                          className="px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-[11px] font-bold text-foreground transition-all cursor-pointer shadow-sm hover:border-accent-violet hover:text-accent-violet active:scale-95 duration-200"
                        >
                          Manage
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
          
        </div>
        
      </form>
    </div>
  );
}
