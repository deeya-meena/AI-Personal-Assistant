"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon, Calendar03Icon, Mail01Icon, Message01Icon, StarIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface BriefItem {
  id: string;
  source: "gmail" | "whatsapp" | "outlook";
  title: string;
  sender: string;
  summary: string;
  time: string;
  priority: "high" | "medium" | "low";
}

export default function BriefingPage() {
  const [selectedBrief, setSelectedBrief] = useState<BriefItem | null>(null);

  const briefings: BriefItem[] = [
    {
      id: "b1",
      source: "gmail",
      title: "Sarah Connor - Q3 Contract Draft Review",
      sender: "sarah.connor@corporation.com",
      summary: "Sent the updated Q3 contract draft containing new sandboxing and liability clauses. Requires review and digital signature before tomorrow's board meeting at 10 AM.",
      time: "10:24 AM",
      priority: "high",
    },
    {
      id: "b2",
      source: "whatsapp",
      title: "Dev Team Chat - Deployment Failure",
      sender: "Marcus (Lead Dev)",
      summary: "Production deployment failed at step 4 due to database migration locks. The team is roll-backing. Direct contact requested if pipeline needs manual recovery override.",
      time: "09:45 AM",
      priority: "high",
    },
    {
      id: "b3",
      source: "outlook",
      title: "John Miller - Weekly Synced Alignment",
      sender: "john.miller@partner.org",
      summary: "Sent briefing agenda files for the alignment call. Main topics include regional server allocation and OKX payment node expansions.",
      time: "Yesterday",
      priority: "medium",
    },
    {
      id: "b4",
      source: "gmail",
      title: "Aura System - Storage Limit Notification",
      sender: "Aura Core Daemon",
      summary: "Free tier sandbox storage usage has exceeded 80%. Consider creating edge buckets or upgrading plans to avoid message drop flags.",
      time: "Yesterday",
      priority: "low",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
            <HugeiconsIcon icon={BookOpen01Icon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Daily Briefing</h1>
            <p className="text-xs text-zinc-500 font-mono">INTELLIGENT FEED SYNTHESIS</p>
          </div>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Last updated: 5 minutes ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-500 mb-2">Today's Feed Summary</h3>
          <div className="space-y-3">
            {briefings.map((brief) => {
              const isActive = selectedBrief?.id === brief.id;
              return (
                <div
                  key={brief.id}
                  onClick={() => setSelectedBrief(brief)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-900/80 border-cyan-500/35"
                      : "bg-zinc-950/40 border-zinc-900 hover:bg-zinc-900/30 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                          brief.source === "gmail"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : brief.source === "whatsapp"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={
                            brief.source === "gmail"
                              ? Mail01Icon
                              : brief.source === "whatsapp"
                              ? Message01Icon
                              : Calendar03Icon
                          }
                          size={14}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{brief.sender}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-550">{brief.time}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                          brief.priority === "high"
                            ? "bg-rose-950/30 text-rose-450 border border-rose-500/20"
                            : brief.priority === "medium"
                            ? "bg-amber-950/30 text-amber-450 border border-amber-500/20"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        {brief.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-3 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{brief.title}</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {brief.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Drawer Panel (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-500 mb-2">Detailed Digest</h3>
          {selectedBrief ? (
            <div className="glassmorphism rounded-3xl p-6 space-y-5 border border-zinc-900 sticky top-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                      selectedBrief.source === "gmail"
                        ? "bg-red-500/20 text-red-400"
                        : selectedBrief.source === "whatsapp"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={
                        selectedBrief.source === "gmail"
                          ? Mail01Icon
                          : selectedBrief.source === "whatsapp"
                          ? Message01Icon
                          : Calendar03Icon
                      }
                      size={16}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-350 capitalize">{selectedBrief.source} Feed</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                    selectedBrief.priority === "high"
                      ? "bg-rose-950/40 text-rose-300 border border-rose-500/20"
                      : selectedBrief.priority === "medium"
                      ? "bg-amber-950/40 text-amber-300 border border-amber-500/20"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  }`}
                >
                  {selectedBrief.priority} priority
                </span>
              </div>

              <div>
                <h4 className="text-xs font-mono text-zinc-500">Sender</h4>
                <p className="text-sm font-medium text-white break-all mt-0.5">{selectedBrief.sender}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-zinc-500">Topic</h4>
                <p className="text-base font-bold text-white mt-0.5 leading-snug">{selectedBrief.title}</p>
              </div>

              <div className="pt-4 border-t border-zinc-900/60">
                <h4 className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
                  <HugeiconsIcon icon={StarIcon} size={12} className="text-cyan-400" />
                  <span>Aura Smart Summary</span>
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-4">
                  {selectedBrief.summary}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl text-center text-xs transition-all shadow-md cursor-pointer">
                  Draft Quick Response
                </button>
                <button className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
                  Mute
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/20 border border-zinc-900 border-dashed rounded-3xl p-8 text-center text-zinc-550 flex flex-col items-center justify-center h-64">
              <HugeiconsIcon icon={BookOpen01Icon} size={28} className="text-zinc-700 mb-2" />
              <p className="text-sm">Select an item from your summary feed to view detailed Aura insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
