"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Brain01Icon, SentIcon, SparklesIcon, UserIcon } from "@hugeicons/core-free-icons";

interface Message {
  id: string;
  sender: "user" | "aura";
  text: string;
  timestamp: string;
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "aura",
      text: "Hello! I am Aura, your Personal AI Agent. I have successfully synchronized with your Gmail and WhatsApp channels. How can I assist you today?",
      timestamp: "12:00 PM",
    },
    {
      id: "2",
      sender: "user",
      text: "What are my high-priority emails today?",
      timestamp: "12:01 PM",
    },
    {
      id: "3",
      sender: "aura",
      text: "You have 2 high-priority messages. One is from Sarah Connor regarding the Q3 Contract Review (Action required by tomorrow), and the other is a calendar invite from your CEO for a briefing at 3:00 PM today. Would you like me to draft a reply or summarize either of them?",
      timestamp: "12:01 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const suggestionChips = [
    "Summarize my morning emails",
    "Any urgent WhatsApp updates?",
    "Draft reply to Sarah Connor",
    "Schedule a briefing draft",
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate Aura AI typing response
    setTimeout(() => {
      const auraMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "aura",
        text: `I've received your request: "${userMsg.text}". In a fully connected environment, I would analyze your email threads, vector databases, and real-time feeds to perform this action. Let me know if you would like me to simulate other pipeline steps!`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, auraMsg]);
    }, 1000);
  };

  const handleChipClick = (chipText: string) => {
    setInputText(chipText);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shadow-md">
            <HugeiconsIcon icon={Brain01Icon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Aura AI Agent</h1>
            <p className="text-xs text-zinc-500 font-mono">ACTIVE SANDBOX | MODEL: GENERALIST-V2</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-950/20 border border-fuchsia-500/20 text-[10px] font-mono text-fuchsia-300">
          <HugeiconsIcon icon={SparklesIcon} size={10} className="animate-pulse" />
          <span>Realtime Agent Active</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.sender === "user"
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  : "bg-fuchsia-600 text-white"
              }`}
            >
              <HugeiconsIcon icon={msg.sender === "user" ? UserIcon : Brain01Icon} size={16} />
            </div>
            <div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-sm ${
                  msg.sender === "user"
                    ? "bg-zinc-900/60 border-zinc-850 text-white rounded-tr-none"
                    : "glassmorphism border-zinc-900 text-zinc-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className={`text-[10px] font-mono text-zinc-650 block mt-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Inputs and Prompts */}
      <div className="space-y-4 flex-shrink-0 pt-2 border-t border-zinc-900/40">
        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3.5 py-1.5 rounded-full text-xs bg-zinc-950/40 border border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Aura agent to summarize, compose, or search..."
            className="w-full bg-[#0d0d0f]/60 hover:bg-[#0d0d0f]/90 focus:bg-[#0d0d0f] border border-zinc-900 focus:border-fuchsia-500/50 rounded-2xl pl-5 pr-14 py-4 text-sm text-white placeholder-zinc-550 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-3.5 p-2 rounded-xl bg-gradient-to-r from-fuchsia-650 to-pink-600 text-white hover:opacity-95 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={SentIcon} size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
