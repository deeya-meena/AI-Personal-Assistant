"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Calendar, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  Bot, 
  Zap, 
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

// Raw SVG icons for authentic logos
export const GmailLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.9c0 .904-.733 1.643-1.636 1.643h-3.818V11.514L12 16.64l-6.545-5.127v9.485H1.636A1.638 1.638 0 0 1 0 19.356V5.457c0-.904.733-1.643 1.636-1.643h3.818l6.546 5.127 6.545-5.127h3.818c.903 0 1.637.739 1.637 1.643z"/>
  </svg>
);

export const WhatsAppLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.976C16.6 1.91 14.12 1.88 12.008 1.88c-5.437 0-9.863 4.42-9.867 9.864-.001 2.029.533 4.02 1.545 5.781L2.68 21.32l3.967-1.042z"/>
  </svg>
);

export const TelegramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 6.6 5.344 11.944 11.944 11.944 6.6 0 11.944-5.344 11.944-11.944C23.888 5.344 18.544 0 11.944 0zm5.836 8.283l-1.95 9.19c-.145.65-.53 1.8-.93 1.8-.46 0-.85-.43-.85-.43l-2.92-2.15-1.41 1.36c-.15.15-.28.27-.58.27l.21-2.97 5.4-4.88c.24-.21-.05-.33-.37-.12l-6.68 4.2-2.88-.9c-.63-.2-.64-.63.13-.93l11.23-4.33c.52-.2.98.11.83.93z"/>
  </svg>
);

export const OutlookLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.075 4.5c.345 0 .675.045.99.135 1.545.45 2.76 1.635 3.24 3.195.09.315.135.645.135.99v6.36c0 .345-.045.675-.135.99-.48 1.56-1.695 2.745-3.24 3.195-.315.09-.645.135-.99.135H6.915c-.345 0-.675-.045-.99-.135-1.545-.45-2.76-1.635-3.24-3.195-.09-.315-.135-.645-.135-.99V9.82c0-.345.045-.675.135-.99.48-1.56 1.695-2.745 3.24-3.195.315-.09.645-.135.99-.135h5.16zm0 1.5h-5.16c-.225 0-.42.03-.615.09-.99.3-1.77 1.05-2.085 2.04-.06.195-.09.39-.09.615v6.36c0 .225.03.42.09.615.315.99 1.095 1.74 2.085 2.04.195.06.39.09.615.09h5.16c.225 0 .42-.03.615-.09.99-.3 1.77-1.05 2.085-2.04.06-.195.09-.39.09-.615V9.82c0-.225-.03-.42-.09-.615-.315-.99-1.095-1.74-2.085-2.04-.195-.06-.39-.09-.615-.09zm.425 2.25l4.335 3.42-4.335 3.42V8.25zm-1 0v6.84L7.165 11.67l4.335-3.42zm.5 1.22l2.79 2.2-2.79 2.2v-4.4z"/>
  </svg>
);

interface MockMessage {
  sender: string;
  avatar: string;
  time: string;
  subject?: string;
  body: string[];
}

interface AISummary {
  bullets: string[];
  reminders: {
    task: string;
    due: string;
    priority: "high" | "medium" | "low";
  }[];
  draftReply?: string;
}

const mockData: Record<string, { logo: React.ReactNode; color: string; bgGradient: string; data: MockMessage; ai: AISummary }> = {
  gmail: {
    logo: <GmailLogo />,
    color: "text-brand-gmail border-brand-gmail/30 bg-brand-gmail/10",
    bgGradient: "from-brand-gmail/20 via-transparent to-transparent",
    data: {
      sender: "Sarah Jenkins",
      avatar: "SJ",
      time: "10:42 AM",
      subject: "URGENT: Q3 Roadmap Alignment & Client Deliverables",
      body: [
        "Hi Team,",
        "Following up on our sync yesterday. We need to finalize the Q3 roadmap deck by Friday morning so we can share it with the client.",
        "Also, please make sure the Figma links are updated on the main page. Diyad, can you review the security compliance section by tomorrow afternoon? Thanks!"
      ]
    },
    ai: {
      bullets: [
        "Finalize the Q3 roadmap presentation deck by Friday morning for the client presentation.",
        "Ensure all Figma design workspace links are updated on the dashboard page.",
        "Diyad must review and approve the security compliance section by tomorrow afternoon."
      ],
      reminders: [
        { task: "Review security compliance section", due: "Tomorrow, 2:00 PM", priority: "high" },
        { task: "Finalize Q3 roadmap deck", due: "Friday, 9:00 AM", priority: "medium" }
      ],
      draftReply: "Hi Sarah, got it. I'll review the security compliance section by tomorrow afternoon and verify the Figma links are fully up to date. Let's sync if there are any blocking items."
    }
  },
  whatsapp: {
    logo: <WhatsAppLogo />,
    color: "text-brand-whatsapp border-brand-whatsapp/30 bg-brand-whatsapp/10",
    bgGradient: "from-brand-whatsapp/20 via-transparent to-transparent",
    data: {
      sender: "Family Group Chat (4 unread)",
      avatar: "FG",
      time: "09:15 AM",
      body: [
        "Dad: Don't forget mom's birthday dinner tomorrow is at 7 PM! We booked the place downtown.",
        "Sis: I'll bring the cake. Diyad, can you make sure to pick up the flowers on your way back?",
        "Mom: Thanks girls, excited to see you all!"
      ]
    },
    ai: {
      bullets: [
        "Mom's birthday dinner is scheduled for tomorrow at 7:00 PM.",
        "Dinner will be held at the restaurant booked downtown.",
        "Diyad is requested to pick up flowers on the way to the dinner.",
        "Sis will be bringing the birthday cake."
      ],
      reminders: [
        { task: "Mom's Birthday Dinner", due: "Tomorrow, 7:00 PM", priority: "high" },
        { task: "Pick up flowers for Mom", due: "Tomorrow, 6:00 PM", priority: "medium" }
      ],
      draftReply: "Hey everyone, I've got the flowers covered! I'll pick them up tomorrow afternoon and see you all at the dinner by 7:00 PM."
    }
  },
  telegram: {
    logo: <TelegramLogo />,
    color: "text-brand-telegram border-brand-telegram/30 bg-brand-telegram/10",
    bgGradient: "from-brand-telegram/20 via-transparent to-transparent",
    data: {
      sender: "Alex (Core Dev)",
      avatar: "AD",
      time: "08:45 AM",
      body: [
        "Hey man, we found a critical memory leak in the WebSockets client when reconnecting under poor network conditions.",
        "I've pushed a temporary hotfix to the staging branch. Can you look at it and approve the PR before the staging deploy at 4 PM today?"
      ]
    },
    ai: {
      bullets: [
        "A critical memory leak was detected in the WebSockets reconnection client.",
        "A temporary fix has been deployed to the staging branch codebase.",
        "Diyad must review and approve the Pull Request before staging deploy at 4:00 PM today."
      ],
      reminders: [
        { task: "Review and approve staging PR", due: "Today, 4:00 PM", priority: "high" }
      ],
      draftReply: "Hey Alex, thanks for finding this. I'll jump on the staging branch right now, review the hotfix, and approve the PR well before the 4:00 PM deploy."
    }
  },
  outlook: {
    logo: <OutlookLogo />,
    color: "text-brand-outlook border-brand-outlook/30 bg-brand-outlook/10",
    bgGradient: "from-brand-outlook/20 via-transparent to-transparent",
    data: {
      sender: "HR Benefits Team",
      avatar: "HR",
      time: "Yesterday",
      subject: "Action Required: Annual Health Insurance Enrollment Window Closing",
      body: [
        "Dear Employee,",
        "This is a final reminder that the annual benefits open enrollment window closes on July 10th at 11:59 PM. If you do not submit your enrollment choices by then, your coverage will default to the basic plan.",
        "Please log into the Workday portal, review your coverage options, and submit your final confirmation."
      ]
    },
    ai: {
      bullets: [
        "Annual health insurance enrollment window closes on July 10 at 11:59 PM.",
        "Failure to submit choices defaults coverage to the basic employee plan.",
        "Action is required inside the Workday portal to review and confirm coverage."
      ],
      reminders: [
        { task: "Submit Health Insurance Enrollment", due: "July 10, 11:59 PM", priority: "high" }
      ],
      draftReply: "Thank you for the notification. I will log into the Workday portal today and finalize my enrollment choices well before the July 10 deadline."
    }
  }
};

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<string>("gmail");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedData = mockData[activeTab];

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);
    }, 1500); // Simulated processing delay
  };

  // Reset states when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsProcessed(false);
    setIsProcessing(false);
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glassmorphism rounded-3xl overflow-hidden border border-card-border shadow-2xl relative">
      {/* Background soft glow */}
      <div className={`absolute top-0 left-0 w-64 h-64 bg-gradient-to-br ${selectedData.bgGradient} rounded-full blur-[100px] -z-10 transition-all duration-700`} />
      
      {/* Workspace Header */}
      <div className="border-b border-card-border p-5 flex flex-wrap justify-between items-center bg-zinc-100/40 dark:bg-zinc-950/40 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-zinc-500 text-xs font-mono ml-2">omnikey_agent_agent.env</span>
        </div>
        <div className="flex gap-2">
          {Object.entries(mockData).map(([key, value]) => (
            <button
              key={key}
              suppressHydrationWarning
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === key
                  ? "bg-zinc-200 dark:bg-zinc-800 text-text-primary shadow-md border border-zinc-350 dark:border-zinc-700/80"
                  : "text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-250 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/60 border border-transparent"
              }`}
            >
              <span className={activeTab === key ? "scale-110" : "opacity-80"}>{value.logo}</span>
              <span className="capitalize">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
        {/* Left Side: Raw Input Feed */}
        <div className="p-6 md:p-8 border-r border-card-border flex flex-col justify-between bg-zinc-100/20 dark:bg-zinc-950/20">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-500">Messy Raw Channel Feed</span>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-300/50 dark:border-zinc-800/50">
                <Clock className="w-3.5 h-3.5" />
                <span>Last sync: {selectedData.data.time}</span>
              </div>
            </div>

            {/* Email / Chat Body */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-105/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-purple-400 border border-zinc-300 dark:border-zinc-700/50">
                    {selectedData.data.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm">{selectedData.data.sender}</h4>
                    {selectedData.data.subject && (
                      <p className="text-zinc-550 dark:text-zinc-400 text-xs truncate max-w-[280px] md:max-w-md">{selectedData.data.subject}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed font-mono">
                  {selectedData.data.body.map((paragraph, index) => (
                    <p key={index} className="opacity-95">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {!isProcessed && !isProcessing ? (
              <button
                onClick={handleProcess}
                suppressHydrationWarning
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-accent-violet to-accent-indigo hover:from-accent-indigo hover:to-accent-pink text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Synthesize with Personal AI Agent</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:animate-shimmer" />
              </button>
            ) : isProcessing ? (
              <div className="w-full py-4 px-6 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                <span className="font-mono text-sm">AI Agent digesting, extracting, and cross-referencing...</span>
              </div>
            ) : (
              <button
                onClick={() => handleTabChange(activeTab)}
                suppressHydrationWarning
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-zinc-150 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-250 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl transition-all duration-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: AI Agent Output (Summary & Reminders) */}
        <div className="p-6 md:p-8 flex flex-col justify-between bg-zinc-100/10 dark:bg-zinc-950/40 relative">
          {!isProcessed && !isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-150 dark:bg-zinc-900/80 border border-zinc-250 dark:border-zinc-800 flex items-center justify-center glow-violet relative">
                <Bot className="w-8 h-8 text-purple-400" />
                <Zap className="w-4 h-4 text-cyan-400 absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-lg mb-1">AI Output Engine Idle</h4>
                <p className="text-zinc-500 text-sm max-w-xs">Click "Synthesize with Personal AI Agent" on the left to see action-item extraction in action.</p>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="h-full flex flex-col justify-center space-y-6">
              {/* Skeleton UI Loading */}
              <div className="space-y-3">
                <div className="h-4 bg-zinc-205 dark:bg-zinc-800/50 rounded-full w-1/4 animate-pulse" />
                <div className="h-3.5 bg-zinc-150 dark:bg-zinc-800/30 rounded-full w-3/4 animate-pulse" />
                <div className="h-3.5 bg-zinc-150 dark:bg-zinc-800/30 rounded-full w-5/6 animate-pulse" />
                <div className="h-3.5 bg-zinc-150 dark:bg-zinc-800/30 rounded-full w-2/3 animate-pulse" />
              </div>
              <div className="space-y-3 pt-6 border-t border-card-border">
                <div className="h-4 bg-zinc-205 dark:bg-zinc-800/50 rounded-full w-1/3 animate-pulse" />
                <div className="h-12 bg-zinc-100 dark:bg-zinc-800/20 rounded-xl w-full animate-pulse" />
              </div>
              <div className="space-y-3 pt-6 border-t border-card-border">
                <div className="h-4 bg-zinc-205 dark:bg-zinc-800/50 rounded-full w-1/4 animate-pulse" />
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800/20 rounded-xl w-full animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn transition-all duration-500">
              {/* AI Summary Block */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">AI Synthesized Summary</span>
                </div>
                <ul className="space-y-3">
                  {selectedData.ai.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-2.5 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                      <span className="text-purple-400 font-bold mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Smart Reminders */}
              <div className="pt-5 border-t border-card-border">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Extracted Reminders & Tasks</span>
                </div>
                <div className="space-y-2">
                  {selectedData.ai.reminders.map((reminder, i) => (
                    <div 
                      key={i} 
                      className="p-3 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-center justify-between hover:bg-zinc-150 dark:hover:bg-zinc-850 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full ${
                          reminder.priority === "high" 
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                            : reminder.priority === "medium" 
                            ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" 
                            : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        }`} />
                        <div>
                          <p className="text-text-primary text-sm font-medium">{reminder.task}</p>
                          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono mt-0.5">Due: {reminder.due}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        reminder.priority === "high" 
                          ? "text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/20" 
                          : reminder.priority === "medium" 
                          ? "text-yellow-750 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/20" 
                          : "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/20"
                      }`}>
                        {reminder.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context-Aware Draft Reply */}
              {selectedData.ai.draftReply && (
                <div className="pt-5 border-t border-card-border">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Context-Aware AI Draft</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedData.ai.draftReply!)}
                      suppressHydrationWarning
                      className="flex items-center gap-1.5 text-xs text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-card-border text-zinc-700 dark:text-zinc-300 text-xs font-mono leading-relaxed relative">
                    "{selectedData.ai.draftReply}"
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Active Indicator */}
          {isProcessed && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-green-500/80" />
              <span>Processed with 99.4% context confidence</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
