"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, UserIcon, BellIcon, SparklesIcon, SaveIcon } from "@hugeicons/core-free-icons";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "agent">("agent");
  
  // States for interactive settings toggles
  const [settings, setSettings] = useState({
    emailDigest: true,
    instantAlerts: true,
    autoReplySuggest: true,
    modelTemperature: 0.7,
    dailyDigestTime: "08:00",
    vipSenders: "ceo@aura.ai, partner@outlook.com",
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shadow-md">
            <HugeiconsIcon icon={Settings01Icon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">System Settings</h1>
            <p className="text-xs text-zinc-500 font-mono">WORKSPACE PREFERENCES MANAGER</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-900/40 pb-px">
        {[
          { id: "agent", name: "AI Agent Config", icon: SparklesIcon },
          { id: "notifications", name: "Digest & Alerts", icon: BellIcon },
          { id: "profile", name: "Profile Data", icon: UserIcon },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-mono transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                isActive
                  ? "border-accent-violet text-white bg-zinc-900/20 font-bold"
                  : "border-transparent text-zinc-450 hover:text-zinc-300"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} size={14} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Forms Container */}
      <form onSubmit={handleSave} className="glassmorphism rounded-3xl p-6 md:p-8 space-y-6">
        {activeTab === "agent" && (
          <div className="space-y-5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">Agent Intelligence</h3>
            
            <div className="space-y-4">
              {/* Auto reply trigger */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl">
                <div>
                  <label className="text-sm font-semibold text-white block">Auto-Reply Recommendations</label>
                  <span className="text-xs text-zinc-500 block mt-0.5">Let Aura suggest custom drafts directly in digests.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("autoReplySuggest")}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.autoReplySuggest ? "bg-accent-violet" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      settings.autoReplySuggest ? "right-1.5" : "left-1.5"
                    }`}
                  />
                </button>
              </div>

              {/* Temperature slider */}
              <div className="p-4 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-semibold text-white block">Creativity Index (Temperature)</label>
                    <span className="text-xs text-zinc-500 block mt-0.5">Controls summary brevity vs detailed insights.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-accent-violet">{settings.modelTemperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.modelTemperature}
                  onChange={(e) => setSettings((prev) => ({ ...prev, modelTemperature: parseFloat(e.target.value) }))}
                  className="w-full accent-accent-violet cursor-pointer h-1.5 rounded-lg bg-zinc-900"
                />
              </div>

              {/* Custom VIP senders */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">VIP Contacts (Instant Alerts)</label>
                <input
                  type="text"
                  value={settings.vipSenders}
                  onChange={(e) => setSettings((prev) => ({ ...prev, vipSenders: e.target.value }))}
                  className="w-full bg-[#0d0d0f]/60 hover:bg-[#0d0d0f]/90 focus:bg-[#0d0d0f] border border-zinc-900 focus:border-accent-violet rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                  placeholder="ceo@aura.ai, sarah.connor@gmail.com"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">Digest Synchronization</h3>
            
            <div className="space-y-4">
              {/* Daily Email Digest */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl">
                <div>
                  <label className="text-sm font-semibold text-white block">Email Digest Summary</label>
                  <span className="text-xs text-zinc-500 block mt-0.5">Receive a combined summaries email every morning.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("emailDigest")}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.emailDigest ? "bg-accent-violet" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      settings.emailDigest ? "right-1.5" : "left-1.5"
                    }`}
                  />
                </button>
              </div>

              {/* Daily email digest delivery time */}
              {settings.emailDigest && (
                <div className="p-4 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-white block">Digest Delivery Time</label>
                    <span className="text-xs text-zinc-500 block mt-0.5">Choose your local schedule summary timing.</span>
                  </div>
                  <input
                    type="time"
                    value={settings.dailyDigestTime}
                    onChange={(e) => setSettings((prev) => ({ ...prev, dailyDigestTime: e.target.value }))}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-violet"
                  />
                </div>
              )}

              {/* Instant High Priority alerts */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl">
                <div>
                  <label className="text-sm font-semibold text-white block">Instant Priority Interrupts</label>
                  <span className="text-xs text-zinc-500 block mt-0.5">Push alerts instantly for VIP contacts or keywords.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("instantAlerts")}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.instantAlerts ? "bg-accent-violet" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      settings.instantAlerts ? "right-1.5" : "left-1.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">Account Properties</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Profile details are synchronised automatically via **InsForge Authentication**. Use the main Dashboard Profile settings editing panel to modify your public display avatar or full name metadata rules.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-zinc-900/40 flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-mono">
            {savedMessage && <span className="text-green-400 font-bold">Preferences saved successfully!</span>}
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <HugeiconsIcon icon={SaveIcon} size={16} />
            <span>Save Workspace Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
