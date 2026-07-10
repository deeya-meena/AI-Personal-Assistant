"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Tick01Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons";

export default function PricingPage() {
  const [activePlan, setActivePlan] = useState<"free" | "pro" | "enterprise">("pro");

  const plans = [
    {
      id: "free",
      name: "Free Sandbox",
      price: "$0",
      description: "Basic summarization of Gmail messaging feeds.",
      features: [
        "1 Sync channel (Gmail)",
        "Daily briefings digest",
        "Standard vector index search",
        "Aura AI Generalist Model",
      ],
      bgColor: "bg-zinc-950/40 border-zinc-900",
      buttonStyle: "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700",
      label: "Select Free Sandbox",
    },
    {
      id: "pro",
      name: "Aura Pro",
      price: "$19",
      period: "/ month",
      description: "Complete unified control over email, chat, and workspaces.",
      features: [
        "Unlimited sync channels (Gmail, WhatsApp, Outlook)",
        "Real-time smart priority alerts",
        "Creative auto-reply drafting options",
        "Fine-tuned vector search & custom rules",
        "Dedicated VIP priority agent routing",
      ],
      bgColor: "glassmorphism border-emerald-500/20 shadow-lg glow-cyan",
      buttonStyle: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:opacity-95 text-white",
      label: "Your Active Subscription",
      isPopular: true,
    },
    {
      id: "enterprise",
      name: "Aura Enterprise",
      price: "Custom",
      description: "For teams requiring dedicated server architectures and custom pipelines.",
      features: [
        "Self-hosted sandboxed edge execution nodes",
        "SLA auth logs & InsForge DB projections",
        "Custom agent fine-tuning & model training",
        "Dedicated enterprise account engineer",
        "Custom Stripe webhook integrations",
      ],
      bgColor: "bg-zinc-950/40 border-zinc-900",
      buttonStyle: "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700",
      label: "Contact Aura Sales",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <HugeiconsIcon icon={CreditCardIcon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Subscription & Billing</h1>
            <p className="text-xs text-zinc-500 font-mono">PRICING WORKSPACE SETTINGS</p>
          </div>
        </div>
      </div>

      {/* Plan list grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const isActive = activePlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 border flex flex-col justify-between relative ${plan.bgColor} min-h-[420px]`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                  RECOMMENDED BY AURA
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{plan.name}</span>
                    {isActive && (
                      <span className="text-[10px] font-mono bg-emerald-950/30 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 py-2">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-xs text-zinc-500 font-mono">{plan.period}</span>}
                </div>

                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                        <HugeiconsIcon icon={Tick01Icon} size={10} />
                      </div>
                      <span className="leading-normal">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => plan.id !== "enterprise" && setActivePlan(plan.id as any)}
                  className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${plan.buttonStyle}`}
                  disabled={plan.id === "enterprise"}
                >
                  {isActive ? "Manage Plan Billing" : plan.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
