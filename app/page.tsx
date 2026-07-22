"use client";

import React, { useState, useEffect } from "react";
import InteractiveDemo, { GmailLogo, WhatsAppLogo, TelegramLogo, OutlookLogo } from "./components/interactive-demo";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { 
  Bot, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Send, 
  Calendar, 
  Shield, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Check, 
  Star, 
  Activity,
  ArrowUpRight,
  Cpu,
  Layers,
  Users,
  Bell,
  Sliders,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

export default function Home() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoConnected, setDemoConnected] = useState<Record<string, boolean>>({
    gmail: true,
    whatsapp: false,
    telegram: false,
    outlook: false
  });
  const [syncedCount, setSyncedCount] = useState(148202);

  // Auto-increment mock sync counter to make it look alive
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncedCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleConnection = (key: string) => {
    setDemoConnected(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqData = [
    {
      q: "How does Aura AI access my chats and emails securely?",
      a: "Aura uses official sandboxed APIs (like Google OAuth and official Graph APIs) with strict read-only permissions. Your authentication credentials are encrypted using AES-256 at rest, and we never write or send messages without your explicit confirmation."
    },
    {
      q: "Does Aura train its models on my private conversations?",
      a: "Absolutely not. We maintain a zero-data-retention policy for model training. All processing is scoped to zero-training API nodes (via our enterprise agreement with security-first LLM providers), meaning your private chats remain strictly yours."
    },
    {
      q: "Can I customize the frequency of summaries?",
      a: "Yes! Aura is highly customizable. You can configure daily digests (e.g., 'every morning at 8:00 AM in my Telegram'), instant real-time alerts for high-priority senders, or weekly executive summaries."
    },
    {
      q: "What counts as a 'high-priority' notification?",
      a: "Aura uses local vector embeddings to understand context. It automatically detects action-oriented statements (e.g., 'need this by tomorrow', 'where are you?', 'contract attached') or messages from VIP contacts you define in your dashboard settings."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-foreground selection:bg-purple-500/30 relative overflow-x-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent-cyan/80 opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[10%] w-[50%] h-[50%] rounded-full bg-accent-pink/10 blur-[130px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />

      {/* Header/Navbar */}
      <header className="sticky top-0 w-full z-50 glassmorphism border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center glow-violet">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary">Aura</span>
              <span className="text-xs block font-mono text-zinc-500 mt-[-2px]">PERSONAL AGENT</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-550 dark:text-zinc-400">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#demo" className="hover:text-text-primary transition-colors">Sandbox Demo</a>
            <a href="#bento" className="hover:text-text-primary transition-colors">Integrations</a>
            <a href="#security" className="hover:text-text-primary transition-colors">Security</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100/50 dark:bg-zinc-900/40 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer flex items-center justify-center animate-pulse"
              style={{ animationDuration: '3s' }}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-650" />}
            </button>

            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-zinc-650 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm font-medium text-zinc-650 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-655 dark:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-850 transition-all duration-300 shadow-md flex items-center gap-2"
                >
                  <span>Connect Accounts</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2 text-zinc-555 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 transition-all cursor-pointer animate-pulse"
              style={{ animationDuration: '3s' }}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-650" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-card-border bg-bg-dark/95 backdrop-blur-lg px-6 py-6 space-y-4 absolute top-20 left-0 w-full shadow-2xl animate-fadeIn">
            <nav className="flex flex-col gap-4 font-medium text-zinc-500 dark:text-zinc-400">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary transition-colors py-1">Features</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary transition-colors py-1">Sandbox Demo</a>
              <a href="#bento" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary transition-colors py-1">Integrations</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary transition-colors py-1">Security</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary transition-colors py-1">Pricing</a>
            </nav>
            <div className="pt-4 border-t border-card-border flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-center text-sm font-medium text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-center text-sm font-medium text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Connect Accounts</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 text-xs font-mono text-purple-650 dark:text-purple-300 shadow-inner">
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Next-Gen Autonomous Message Synthesis</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
              One Secure AI Agent. <br />
              <span className="text-gradient-violet-cyan">All Your Messages</span> <br />
              Synthesized.
            </h1>

            {/* Subhead */}
            <p className="text-zinc-550 dark:text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
              Stop drowning in tabs. Connect Gmail, WhatsApp, Telegram, and Outlook to your private assistant. Aura digests group clutter, extracts calendar invites, and draft replies instantly—all from one secure workspace.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href={user ? "/dashboard" : "/auth/signup"} 
                className="px-8 py-4 bg-gradient-to-r from-accent-violet to-accent-indigo hover:from-accent-indigo hover:to-accent-pink text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Trusted/Stats Footnote */}
            <div className="pt-6 md:pt-10 flex flex-wrap items-center gap-6 border-t border-card-border max-w-xl">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-bg-dark flex items-center justify-center text-[10px] font-bold text-purple-650 dark:text-purple-400">A</div>
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-bg-dark flex items-center justify-center text-[10px] font-bold text-cyan-650 dark:text-cyan-400">B</div>
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-600 border-2 border-bg-dark flex items-center justify-center text-[10px] font-bold text-pink-650 dark:text-pink-400">C</div>
              </div>
              <div>
                <p className="text-zinc-450 dark:text-zinc-500 text-xs font-mono">
                  ACTIVE AGENT CONTEXT SYNC
                </p>
                <p className="text-text-primary text-sm font-bold font-mono">
                  {syncedCount.toLocaleString("en-US")} events synced globally
                </p>
              </div>
            </div>
          </div>

          {/* Hero Graphic Right (Interactive Logo Node Connector) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] md:min-h-[450px]">
            {/* Pulsing Orbital Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-purple-500/10 animate-pulse-glow" />
            <div className="absolute w-[420px] h-[420px] rounded-full border border-cyan-500/5 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

            {/* Center Core: Aura AI */}
            <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-violet to-accent-indigo flex flex-col items-center justify-center border border-purple-400/30 shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-float">
              <Bot className="w-10 h-10 text-white animate-pulse" />
              <span className="text-[10px] font-bold font-mono text-purple-200 mt-1">AURA CORE</span>
            </div>

            {/* Satellite Node 1: Gmail */}
            <div 
              onClick={() => toggleConnection('gmail')}
              className={`absolute top-10 left-10 md:top-14 md:left-14 z-20 p-4 rounded-2xl glassmorphism cursor-pointer transition-all duration-300 hover:scale-110 flex flex-col items-center gap-1.5 border ${
                demoConnected.gmail ? "border-brand-gmail/60 bg-brand-gmail/10 shadow-[0_0_20px_rgba(234,67,53,0.2)]" : "border-card-border opacity-40"
              }`}
            >
              <GmailLogo />
              <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-400">Gmail</span>
              <span className={`w-1.5 h-1.5 rounded-full ${demoConnected.gmail ? "bg-green-400" : "bg-zinc-500"}`} />
            </div>

            {/* Satellite Node 2: WhatsApp */}
            <div 
              onClick={() => toggleConnection('whatsapp')}
              className={`absolute top-10 right-10 md:top-14 md:right-14 z-20 p-4 rounded-2xl glassmorphism cursor-pointer transition-all duration-300 hover:scale-110 flex flex-col items-center gap-1.5 border ${
                demoConnected.whatsapp ? "border-brand-whatsapp/60 bg-brand-whatsapp/10 shadow-[0_0_20px_rgba(37,211,102,0.2)]" : "border-card-border opacity-40"
              }`}
            >
              <WhatsAppLogo />
              <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-400">WhatsApp</span>
              <span className={`w-1.5 h-1.5 rounded-full ${demoConnected.whatsapp ? "bg-green-400" : "bg-zinc-500"}`} />
            </div>

            {/* Satellite Node 3: Telegram */}
            <div 
              onClick={() => toggleConnection('telegram')}
              className={`absolute bottom-10 left-10 md:bottom-14 md:left-14 z-20 p-4 rounded-2xl glassmorphism cursor-pointer transition-all duration-300 hover:scale-110 flex flex-col items-center gap-1.5 border ${
                demoConnected.telegram ? "border-brand-telegram/60 bg-brand-telegram/10 shadow-[0_0_20px_rgba(36,161,222,0.2)]" : "border-card-border opacity-40"
              }`}
            >
              <TelegramLogo />
              <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-400">Telegram</span>
              <span className={`w-1.5 h-1.5 rounded-full ${demoConnected.telegram ? "bg-green-400" : "bg-zinc-500"}`} />
            </div>

            {/* Satellite Node 4: Outlook */}
            <div 
              onClick={() => toggleConnection('outlook')}
              className={`absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 p-4 rounded-2xl glassmorphism cursor-pointer transition-all duration-300 hover:scale-110 flex flex-col items-center gap-1.5 border ${
                demoConnected.outlook ? "border-brand-outlook/60 bg-brand-outlook/10 shadow-[0_0_20px_rgba(0,120,212,0.2)]" : "border-card-border opacity-40"
              }`}
            >
              <OutlookLogo />
              <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-400">Outlook</span>
              <span className={`w-1.5 h-1.5 rounded-full ${demoConnected.outlook ? "bg-green-400" : "bg-zinc-500"}`} />
            </div>

            {/* Connecting SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 dark:opacity-60" viewBox="0 0 500 500">
              <path d="M 120 120 L 250 250" stroke={demoConnected.gmail ? "url(#line-grad-1)" : "rgba(100, 116, 139, 0.15)"} strokeWidth="1.5" strokeDasharray="4" />
              <path d="M 380 120 L 250 250" stroke={demoConnected.whatsapp ? "url(#line-grad-2)" : "rgba(100, 116, 139, 0.15)"} strokeWidth="1.5" strokeDasharray="4" />
              <path d="M 120 380 L 250 250" stroke={demoConnected.telegram ? "url(#line-grad-3)" : "rgba(100, 116, 139, 0.15)"} strokeWidth="1.5" strokeDasharray="4" />
              <path d="M 380 380 L 250 250" stroke={demoConnected.outlook ? "url(#line-grad-4)" : "rgba(100, 116, 139, 0.15)"} strokeWidth="1.5" strokeDasharray="4" />
              
              <defs>
                <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea4335" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="line-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#25d366" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="line-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#24a1de" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="line-grad-4" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#0078d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Click Tip */}
            <div className="absolute bottom-2 text-center text-xs text-zinc-500 font-mono">
              💡 Click nodes to toggle active simulator channels
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Performance Metrics Banner */}
      <section className="border-y border-card-border bg-zinc-100/50 dark:bg-zinc-950/40 py-10 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary font-mono">99.4%</h3>
            <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-widest mt-1">Context Synthesis Accuracy</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary font-mono">&lt; 1.2s</h3>
            <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-widest mt-1">Real-Time Sync Latency</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary font-mono">8+ Hrs</h3>
            <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-widest mt-1">Saved per User Weekly</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary font-mono">E2EE</h3>
            <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-widest mt-1">End-to-End Encrypted</p>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="demo" className="py-20 md:py-28 max-w-7xl mx-auto px-6 z-10 relative">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 text-xs font-mono text-cyan-700 dark:text-cyan-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Assistant Sandbox</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            See the Agent Work in Real Time
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 max-w-2xl mx-auto">
            Choose a channel below. Experience how Aura AI digests cluttered emails and chats, extract actions, and constructs immediate drafted replies.
          </p>
        </div>

        <InteractiveDemo />
      </section>

      {/* Bento Grid Feature List */}
      <section id="features" className="py-20 md:py-32 border-t border-card-border bg-zinc-50 dark:bg-zinc-950/20 z-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Head */}
          <div className="text-center space-y-4 mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-500/20 text-xs font-mono text-pink-700 dark:text-pink-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Features Directory</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
              Designed for High-Cognitive Productivity
            </h2>
            <p className="text-zinc-550 dark:text-zinc-400 max-w-2xl mx-auto">
              Our Bento Grid architectures layout the complete workflow engine powering Aura's automated summary pipeline.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: 2-Col Wide (AI Core Synthesis) */}
            <div className="md:col-span-2 glassmorphism rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-card-border hover:border-purple-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
              
              <div className="space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-purple-100/50 dark:bg-purple-950/50 border border-purple-300/30 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 glow-violet">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Context-Aware Neural Synthesis</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                  Aura goes beyond simple keyword filtering. Our agent understands conversational intent, distinguishing simple banter from critical client requests in multi-user WhatsApp and Telegram chats.
                </p>
              </div>

              {/* Graphic Element */}
              <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-950/60 border border-card-border rounded-2xl font-mono text-xs space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between text-zinc-500">
                  <span>INPUT FEED NOISE: 847 WORDS</span>
                  <span className="text-red-500 dark:text-red-400 font-bold">CHAOTIC</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[80%] animate-pulse" />
                </div>
                <div className="flex justify-between text-zinc-500 pt-2">
                  <span>SYNTHESIZED SUMMARY: 42 WORDS</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">DIGESTED</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[12%] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Bento Card 2: 1-Col Wide (Calendar & Reminder Extractor) */}
            <div className="glassmorphism rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-card-border hover:border-cyan-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-cyan-500/8 transition-colors" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100/50 dark:bg-cyan-950/50 border border-cyan-300/30 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 glow-cyan">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Automated Actions</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                  Extract dates, times, and priority items instantly from incoming texts and push them directly to Google Calendar or Outlook Tasks automatically.
                </p>
              </div>

              {/* Graphic element */}
              <div className="mt-8 space-y-2">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-card-border flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs text-text-primary truncate font-mono">Sync: Meeting tomorrow @ 3PM</span>
                </div>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-card-border flex items-center gap-3 opacity-50">
                  <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                  <span className="text-xs text-zinc-550 dark:text-zinc-550 truncate font-mono">Sync: Buy ticket by Friday</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: 1-Col Wide (Unified Accounts Portal) */}
            <div className="glassmorphism rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-card-border hover:border-pink-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-pink-500/5 rounded-full blur-[50px] pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-pink-100/50 dark:bg-pink-950/50 border border-pink-300/30 dark:border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Instant Smart Replies</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                  Draft emails or replies on the fly. Aura reads the tone and context of the incoming message and prepares ready-to-send draft options.
                </p>
              </div>

              {/* Graphic element */}
              <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900/40 rounded-xl border border-card-border space-y-1">
                <span className="text-[9px] font-mono text-pink-600 dark:text-pink-400 font-bold block">GENERATED DRAFT</span>
                <span className="text-xs text-text-primary leading-normal block">"Hi John, I will check the records and get back to you by 5..."</span>
              </div>
            </div>

            {/* Bento Card 4: 2-Col Wide (Enterprise Grade Security) */}
            <div className="md:col-span-2 glassmorphism rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-card-border hover:border-cyan-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

              <div className="space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-card-border flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Privacy Scoped Security Architecture</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                  We treat security as a first-class citizen. Aura does not store your conversation logs on our servers. All message analysis is executed in-memory and immediately destroyed post-synthesis.
                </p>
              </div>

              {/* Badges List */}
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900/60 border border-card-border text-zinc-550 dark:text-zinc-450 text-xs font-mono rounded-lg flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> AES-256 Encrypted
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900/60 border border-card-border text-zinc-550 dark:text-zinc-450 text-xs font-mono rounded-lg flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Read-Only Tokens
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900/60 border border-card-border text-zinc-555 dark:text-zinc-450 text-xs font-mono rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> SOC-2 Audited
                </span>
              </div>
            </div>

            {/* Bento Card 5: 3-Col Wide (Horizontal Architecture Map) */}
            <div className="md:col-span-3 glassmorphism rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group border border-card-border hover:border-purple-500/25 transition-all duration-300 gap-8">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none" />

              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 text-[10px] font-mono text-purple-600 dark:text-purple-400">
                  REAL-TIME SYNC ENGINE
                </div>
                <h3 className="text-2xl font-bold text-text-primary">Full-Throttle Integration Pipeline</h3>
                <p className="text-zinc-555 dark:text-zinc-400 text-sm leading-relaxed">
                  Aura establishes webhooks directly with your messaging channels. The moment you get a WhatsApp query, a complex email thread, or a group alert, the AI processes and compiles it.
                </p>
              </div>

              {/* Visual Logo Connections */}
              <div className="flex items-center justify-center gap-6 bg-zinc-100 dark:bg-zinc-950/80 border border-card-border p-6 rounded-2xl w-full md:w-auto min-w-[300px]">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-brand-gmail"><GmailLogo /></div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-brand-whatsapp"><WhatsAppLogo /></div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-brand-telegram"><TelegramLogo /></div>
                </div>
                <div className="flex items-center text-purple-450 animate-pulse">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center text-white glow-violet">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Step-by-Step Timeline Section */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-6 z-10 relative">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Setting Up Takes Less Than 2 Minutes
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 max-w-2xl mx-auto">
            Get your AI personal assistant running in three effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-zinc-200 dark:bg-zinc-900 z-0" />

          {/* Step 1 */}
          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
              01
            </div>
            <h3 className="text-lg font-bold text-text-primary pt-2">Connect Channels</h3>
            <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
              Authenticating with your accounts takes one-click secure OAuth logins. Choose which channels to connect.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              02
            </div>
            <h3 className="text-lg font-bold text-text-primary pt-2">Define Preferences</h3>
            <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
              Decide whether you want real-time notification alerts, daily morning digest briefs, or customized context keywords.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center text-xl font-bold font-mono text-white glow-violet">
              03
            </div>
            <h3 className="text-lg font-bold text-text-primary pt-2">Reclaim Your Focus</h3>
            <p className="text-zinc-555 dark:text-zinc-400 text-sm leading-relaxed">
              Enjoy custom AI action items directly inside your terminal, web app, or delivered directly to your messaging inbox.
            </p>
          </div>
        </div>
      </section>

      {/* Security Deep Dive Section */}
      <section id="security" className="py-20 md:py-28 border-t border-card-border bg-zinc-100/50 dark:bg-zinc-950/40 z-10 relative">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto glow-cyan">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Security & Zero-Retention Data Policy
          </h2>
          <p className="text-zinc-555 dark:text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto font-light">
            We understand that your emails and personal chats are private. Aura AI is built on private pipelines: your data is never cached on disk, never utilized for LLM training, and never visible to our engineers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-card-border">
              <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Read-Only Scopes</span>
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                We request strictly read-only tokens. Aura will never delete emails or write chats unless you hit a manual reply confirmation.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-card-border">
              <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Private Model Scopes</span>
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                All prompts are parsed using zero-data-retention APIs. No external LLM can save or index your conversation content.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 border border-card-border">
              <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Local Edge Options</span>
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Host summaries on your own machine. We support locally hosted LLM nodes for complete offline processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 z-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
              Flexible Pricing for Any Scale
            </h2>
            <p className="text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto">
              Start parsing your channels free today. Upgrade when you need advanced agent logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl glassmorphism border border-card-border flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider block">Starter Pack</span>
                <h3 className="text-2xl font-bold text-text-primary">Developer Sandbox</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-text-primary font-mono">$0</span>
                  <span className="text-zinc-500 text-xs ml-2">/ month</span>
                </div>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm">Great for test-driving our synthesis flow on minor channels.</p>
                <ul className="space-y-3 pt-4 text-sm text-zinc-550 dark:text-zinc-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 2 Connected Channels</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Real-time Summaries</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 150 Events Synced / Month</li>
                  <li className="flex items-center gap-2 opacity-30"><Check className="w-4 h-4 text-zinc-650" /> Smart Draft Replies</li>
                </ul>
              </div>
              <a href="#demo" className="w-full text-center py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold rounded-xl transition-all block">Get Started Free</a>
            </div>

            {/* Popular Tier */}
            <div className="p-8 rounded-3xl glassmorphism border-2 border-purple-500/40 flex flex-col justify-between space-y-8 relative shadow-[0_0_50px_rgba(139,92,246,0.15)]">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-purple-500 text-white text-[10px] font-bold font-mono rounded-full uppercase tracking-wider">Most Popular</div>
              
              <div className="space-y-4">
                <span className="text-purple-600 dark:text-purple-400 text-xs font-mono uppercase tracking-wider block">Daily Pro</span>
                <h3 className="text-2xl font-bold text-text-primary">Productivity Core</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-text-primary font-mono">$9</span>
                  <span className="text-zinc-500 text-xs ml-2">/ month</span>
                </div>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm">For professionals looking to fully conquer inbound digital noise.</p>
                <ul className="space-y-3 pt-4 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> All Channels Connected</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Unlimited Real-time Digests</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Smart Draft Replies (Gmail/WA)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Calendar Action Exports</li>
                </ul>
              </div>
              <a href="#demo" className="w-full text-center py-3 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold rounded-xl shadow-lg block">Unlock Pro Core</a>
            </div>

            {/* Enterprise Tier */}
            <div className="p-8 rounded-3xl glassmorphism border border-card-border flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider block">Security Plus</span>
                <h3 className="text-2xl font-bold text-text-primary">Self-Hosted / Local</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-text-primary font-mono">$29</span>
                  <span className="text-zinc-500 text-xs ml-2">/ month</span>
                </div>
                <p className="text-zinc-550 dark:text-zinc-400 text-sm">For companies and individuals demanding local data isolation.</p>
                <ul className="space-y-3 pt-4 text-sm text-zinc-550 dark:text-zinc-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Offline / Local Model Support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Direct Ollama / Llama.cpp Node</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Unlimited Local Sync events</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Priority Support Discord</li>
                </ul>
              </div>
              <a href="#demo" className="w-full text-center py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold rounded-xl transition-all block">Get Self-Hosted</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 border-t border-card-border bg-zinc-50 dark:bg-zinc-950/20 z-10 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight font-mono">Frequently Asked Questions</h2>
            <p className="text-zinc-555 dark:text-zinc-400">Everything you need to know about security, syncing, and privacy.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="border border-card-border rounded-2xl bg-zinc-100 dark:bg-zinc-900/30 overflow-hidden shadow-sm"
              >
                <button
                  suppressHydrationWarning
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left p-6 flex justify-between items-center text-text-primary hover:text-purple-650 dark:hover:text-purple-400 transition-colors font-semibold cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl font-mono text-zinc-500">{activeFaq === index ? "−" : "+"}</span>
                </button>
                {activeFaq === index && (
                  <div className="p-6 pt-0 border-t border-card-border text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 md:py-32 border-t border-card-border bg-zinc-100/50 dark:bg-zinc-950/40 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
            Stop Digging Through Tabs. <br />
            <span className="text-gradient-indigo-pink">Sync Your Life Today.</span>
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 text-lg max-w-xl mx-auto font-light">
            Connect your first channel in 30 seconds. Reclaim control of your calendar and mental bandwidth now.
          </p>
          <div className="pt-4">
            <Link 
              href={user ? "/dashboard" : "/auth/signup"}
              className="px-8 py-4 bg-gradient-to-r from-accent-violet to-accent-indigo hover:from-accent-indigo hover:to-accent-pink text-white font-bold rounded-2xl shadow-xl transition-all duration-300 inline-flex items-center gap-3 cursor-pointer"
            >
              <span>{user ? "Go to Control Center" : "Connect Channels Free"}</span>
              <Sparkles className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border bg-zinc-100 dark:bg-zinc-950/80 pt-16 pb-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-card-border/80">
          
          {/* Logo & Pitch */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-text-primary">Aura AI</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed font-light">
              We build secure, sandboxed, context-aware AI pipelines to help engineers and professionals synthesize digital noise.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-zinc-500 hover:text-text-primary transition-colors text-xs font-mono">Twitter/X</a>
              <a href="#" className="text-zinc-500 hover:text-text-primary transition-colors text-xs font-mono">Discord</a>
              <a href="#" className="text-zinc-500 hover:text-text-primary transition-colors text-xs font-mono">GitHub</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-550 dark:text-zinc-500">
              <li><a href="#features" className="hover:text-text-primary transition-colors">Features</a></li>
              <li><a href="#demo" className="hover:text-text-primary transition-colors">Sandbox Demo</a></li>
              <li><a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">Self-Hosted</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Security</h4>
            <ul className="space-y-2 text-sm text-zinc-555 dark:text-zinc-500">
              <li><a href="#security" className="hover:text-text-primary transition-colors">Zero Training</a></li>
              <li><a href="#security" className="hover:text-text-primary transition-colors">GDPR / SOC-2</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">E2E Cryptography</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">Open Source SDK</a></li>
            </ul>
          </div>

          {/* Subscription */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Stay Updated</h4>
            <p className="text-zinc-500 text-xs font-light">Get our weekly developer updates on local agent setup guides.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                suppressHydrationWarning
                type="email" 
                placeholder="Enter email"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-card-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
              <button 
                suppressHydrationWarning
                type="submit"
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-250 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-600 font-mono">
          <p>© 2026 Aura AI, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Security Hub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
