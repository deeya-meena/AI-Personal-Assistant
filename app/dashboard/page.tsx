"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  CheckmarkCircle01Icon,
  Activity01Icon,
  ArrowRight01Icon,
  CheckListIcon,
  BubbleChatIcon,
} from "@hugeicons/core-free-icons";

const mockDigests = [
  {
    id: 1,
    tag: "Gmail Digest",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
    title: "Q2 Budget & Roadmap Review",
    date: "Today · 11 min ago",
    preview:
      "Saloni requested a full review of the Q2 budget proposal. She suggests adjusting the marketing spend by 15% to accommodate our new product roadmap items for the next quarter.",
    action: "Ask Aura",
  },
  {
    id: 2,
    tag: "WhatsApp",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
    title: "Team Stand-up Summary",
    date: "Today · 2h ago",
    preview:
      "Engineering blocked on API rate limits. Design shipped new onboarding screens. Marketing ready for campaign launch pending legal sign-off.",
    action: "Ask Aura",
  },
];

const mockTasksData = [
  {
    id: 1,
    tag: "Email",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
    title: "Submit Q2 Slides to John",
    due: "Due today",
    done: false,
  },
  {
    id: 2,
    tag: "WhatsApp",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
    title: "Re-schedule sync meeting with marketing team",
    due: "Tomorrow",
    done: false,
  },
  {
    id: 3,
    tag: "Email",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
    title: "Review final NDA terms from client",
    due: "Overdue",
    done: false,
  },
  {
    id: 4,
    tag: "Telegram",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    title: "Confirm product demo time with investor",
    due: "In 3 days",
    done: true,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [tasks, setTasks] = useState(mockTasksData);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/signin");
  }, [user, loading, router]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-violet animate-spin" />
      </div>
    );
  }

  const fullName = profile?.name || "Aura User";

  const metrics = [
    {
      label: "UNREAD EMAIL SUMMARIES",
      value: "4",
      sub: "from Gmail",
      icon: Mail01Icon,
      iconBg: "bg-red-600",
      valueColor: "text-white",
    },
    {
      label: "PENDING ACTION ITEMS",
      value: "3",
      sub: "Require follow-up today",
      icon: CheckListIcon,
      iconBg: "bg-amber-500",
      valueColor: "text-white",
    },
    {
      label: "COGNITIVE LOAD INDEX",
      value: "-52%",
      sub: "Time saved vs manual",
      icon: Activity01Icon,
      iconBg: "bg-emerald-600",
      valueColor: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-violet-950/20 p-7 md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[11px] font-mono tracking-widest text-green-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          System Connected &amp; Active
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {fullName}
              </span>
            </h1>
            <p className="mt-2.5 text-sm text-zinc-400 max-w-md leading-relaxed">
              Your AI assistant has analysed{" "}
              <span className="text-zinc-200 font-semibold">14 conversations</span> and extracted{" "}
              <span className="text-zinc-200 font-semibold">3 urgent action items</span> from Gmail
              and WhatsApp in the last 30 minutes.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl border border-green-500/25 bg-green-500/10 px-4 py-2.5 text-sm text-green-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            WhatsApp Live Syncing
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
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                {m.label}
              </p>
              <p className={`text-3xl font-extrabold ${m.valueColor}`}>{m.value}</p>
              <p className="text-xs text-zinc-500">{m.sub}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl ${m.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <HugeiconsIcon icon={m.icon} size={22} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Communication Digests */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-white">Recent Communication Digests</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {mockDigests.length} new
            </span>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {mockDigests.map((d) => (
              <div key={d.id} className="p-5 hover:bg-zinc-900/30 transition-colors">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${d.tagColor}`}
                  >
                    {d.tag}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{d.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{d.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{d.preview}</p>
                <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">
                  {d.action}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Tasks & Commitments */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <HugeiconsIcon icon={CheckListIcon} size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-white">Extracted Tasks &amp; Commitments</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {tasks.filter((t) => !t.done).length} pending
            </span>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3.5 p-4 hover:bg-zinc-900/30 transition-colors"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    t.done
                      ? "border-violet-500 bg-violet-500"
                      : "border-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {t.done && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${t.tagColor}`}
                    >
                      {t.tag}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        t.due === "Overdue" ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      {t.due}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-snug ${
                      t.done ? "line-through text-zinc-600" : "text-zinc-200"
                    }`}
                  >
                    {t.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
