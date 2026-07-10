"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Delete01Icon, Message01Icon, Mail01Icon, ShieldIcon } from "@hugeicons/core-free-icons";

interface Alert {
  id: string;
  source: "gmail" | "whatsapp" | "system";
  sender: string;
  message: string;
  time: string;
  priority: "high" | "medium" | "low";
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "a1",
      source: "whatsapp",
      sender: "CEO (John)",
      message: "Can you jump on a quick alignment check in 10 minutes? The OKX pricing parameters need adjustment.",
      time: "2 mins ago",
      priority: "high",
    },
    {
      id: "a2",
      source: "gmail",
      sender: "security-alert@google.com",
      message: "New login detected on your linked sandbox channel from Chrome on Linux (IP: 198.162.0.1).",
      time: "15 mins ago",
      priority: "medium",
    },
    {
      id: "a3",
      source: "system",
      sender: "Aura Storage System",
      message: "Sync buffer threshold has crossed 85%. Free database capacity is running low.",
      time: "1 hour ago",
      priority: "high",
    },
    {
      id: "a4",
      source: "whatsapp",
      sender: "Marcus (Dev)",
      message: "Briefing files uploaded. Pipeline test complete. Let me know when you check.",
      time: "Yesterday",
      priority: "low",
    },
  ]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.priority === filter;
  });

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
            <HugeiconsIcon icon={Notification01Icon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Alerts Inbox</h1>
            <p className="text-xs text-zinc-500 font-mono">HIGH PRIORITY CHANNEL INTERRUPTS</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 pb-2">
        {(["all", "high", "medium", "low"] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => setFilter(tier)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono capitalize transition-all cursor-pointer border ${
              filter === tier
                ? tier === "high"
                  ? "bg-rose-950/40 text-rose-350 border-rose-500/30"
                  : tier === "medium"
                  ? "bg-amber-950/40 text-amber-350 border-amber-500/30"
                  : tier === "low"
                  ? "bg-emerald-950/40 text-emerald-355 border-emerald-500/30"
                  : "bg-zinc-900 text-white border-zinc-800"
                : "bg-zinc-950/20 border-zinc-900/80 text-zinc-405 hover:text-white"
            }`}
          >
            {tier} {tier !== "all" && `(${alerts.filter((a) => a.priority === tier).length})`}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glassmorphism rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alert.priority === "high"
                  ? "border-rose-500/10 hover:border-rose-500/20 shadow-inner"
                  : "border-zinc-900/60 hover:border-zinc-800"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                    alert.source === "gmail"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : alert.source === "whatsapp"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                  }`}
                >
                  <HugeiconsIcon
                    icon={
                      alert.source === "gmail"
                        ? Mail01Icon
                        : alert.source === "whatsapp"
                        ? Message01Icon
                        : ShieldIcon
                    }
                    size={16}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{alert.sender}</span>
                    <span className="text-[10px] font-mono text-zinc-550">• {alert.time}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed pr-6">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                    alert.priority === "high"
                      ? "bg-rose-950/30 text-rose-400 border border-rose-500/25"
                      : alert.priority === "medium"
                      ? "bg-amber-950/30 text-amber-400 border border-amber-500/25"
                      : "bg-emerald-950/30 text-emerald-400 border border-emerald-500/25"
                  }`}
                >
                  {alert.priority}
                </span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-2 rounded-lg bg-zinc-950/40 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-900 hover:border-red-500/20 transition-all cursor-pointer"
                  title="Dismiss Alert"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-950/10 border border-zinc-900 border-dashed rounded-3xl p-12 text-center text-zinc-550 flex flex-col items-center justify-center h-48">
            <HugeiconsIcon icon={Notification01Icon} size={28} className="text-zinc-700 mb-2 animate-bounce" style={{ animationDuration: "3s" }} />
            <p className="text-sm">Inbox clear. No active alerts under the "{filter}" filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
