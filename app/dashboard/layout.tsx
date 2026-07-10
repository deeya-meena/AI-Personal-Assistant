"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Loader2, X, Sun, Moon } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Brain01Icon,
  BookOpen01Icon,
  Layers01Icon,
  Notification01Icon,
  Settings01Icon,
  CreditCardIcon,
  Logout01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Menu01Icon
} from "@hugeicons/core-free-icons";
import Link from "next/link";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  bgColor: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Sync state to localStorage
  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

  // Auth protection check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-violet animate-spin" />
      </div>
    );
  }

  const mainNavigation: SidebarItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: DashboardSquare01Icon,
      bgColor: "bg-violet-600",
    },
    {
      name: "AI Agent",
      href: "/dashboard/ai-agent",
      icon: Brain01Icon,
      bgColor: "bg-fuchsia-600",
    },
    {
      name: "Briefing",
      href: "/dashboard/briefing",
      icon: BookOpen01Icon,
      bgColor: "bg-cyan-600",
    },
    {
      name: "Integrations",
      href: "/dashboard/integrations",
      icon: Layers01Icon,
      bgColor: "bg-blue-600",
    },
    {
      name: "Alerts",
      href: "/dashboard/alerts",
      icon: Notification01Icon,
      bgColor: "bg-rose-600",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings01Icon,
      bgColor: "bg-zinc-700",
    },
  ];

  const pricingItem: SidebarItem = {
    name: "Pricing Settings",
    href: "/dashboard/pricing",
    icon: CreditCardIcon,
    bgColor: "bg-emerald-600",
  };

  return (
    <div className="min-h-screen bg-bg-dark text-foreground flex flex-col md:flex-row relative">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-violet/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent-cyan/5 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glassmorphism border-b border-card-border/80 sticky top-0 z-40 w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center shadow-lg">
            <HugeiconsIcon icon={Brain01Icon} size={16} color="white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-text-primary">Aura</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white rounded-lg border border-zinc-200 hover:border-zinc-300 dark:border-zinc-850 dark:hover:border-zinc-700 bg-zinc-100/40 dark:bg-zinc-900/40 transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
          </button>
          
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-405 dark:hover:text-white rounded-lg border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-750 bg-zinc-100/40 dark:bg-zinc-950/40 transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-card-bg border-r border-card-border flex flex-col p-6 space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center shadow-md">
                  <HugeiconsIcon icon={Brain01Icon} size={20} color="white" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-text-primary">Aura</span>
                  <span className="text-[10px] block font-mono text-zinc-500 mt-[-2px]">CONTROL CENTER</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-zinc-200/65 dark:bg-zinc-900/60 border-zinc-300/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white font-medium shadow-inner"
                        : "border-transparent text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/20"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${item.bgColor} shadow-sm flex-shrink-0`}>
                      <HugeiconsIcon icon={item.icon} size={18} />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section */}
            <div className="pt-4 border-t border-card-border space-y-2">
              <Link
                href={pricingItem.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  pathname === pricingItem.href
                    ? "bg-zinc-200/65 dark:bg-zinc-900/60 border-zinc-300/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white font-medium shadow-inner"
                    : "border-transparent text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/20"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${pricingItem.bgColor} shadow-sm flex-shrink-0`}>
                  <HugeiconsIcon icon={pricingItem.icon} size={18} />
                </div>
                <span>{pricingItem.name}</span>
              </Link>

              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent text-zinc-500 hover:text-red-450 hover:bg-red-500/5 transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-sm flex-shrink-0">
                  <HugeiconsIcon icon={Logout01Icon} size={18} />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 z-30 bg-card-bg/90 backdrop-blur-md border-r border-card-border transition-all duration-300 relative ${
          mounted && isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center justify-between border-b border-card-border ${mounted && isCollapsed ? "justify-center" : ""}`}>
          {!(mounted && isCollapsed) ? (
            <Link href="/" className="flex items-center gap-3 overflow-hidden select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center shadow-lg glow-violet flex-shrink-0 animate-pulse">
                <HugeiconsIcon icon={Brain01Icon} size={20} color="white" />
              </div>
              <div className="flex flex-col transition-all duration-300">
                <span className="font-extrabold text-xl tracking-tight text-text-primary leading-none">Aura</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">CONTROL CENTER</span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center shadow-lg glow-violet animate-pulse flex-shrink-0">
              <HugeiconsIcon icon={Brain01Icon} size={20} color="white" />
            </Link>
          )}

          {/* Toggle Sidebar Button */}
          {!(mounted && isCollapsed) && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-white bg-zinc-100/40 hover:bg-zinc-200/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer hidden md:block"
              title="Collapse Sidebar"
            >
              <HugeiconsIcon icon={ChevronLeftIcon} size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {mounted && isCollapsed && (
          <div className="flex justify-center py-4 border-b border-card-border/20">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-455 hover:text-zinc-900 dark:hover:text-white bg-zinc-100/40 hover:bg-zinc-200/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              title="Expand Sidebar"
            >
              <HugeiconsIcon icon={ChevronRightIcon} size={16} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            const collapsedMode = mounted && isCollapsed;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-xl border transition-all ${
                  isActive
                    ? "bg-zinc-200/60 dark:bg-zinc-900/60 border-zinc-300/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white font-medium shadow-inner"
                    : "border-transparent text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/20"
                } ${collapsedMode ? "justify-center p-2" : "gap-4 p-3"}`}
                title={collapsedMode ? item.name : undefined}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${item.bgColor} shadow-md flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
                >
                  <HugeiconsIcon icon={item.icon} size={20} />
                </div>
                {!collapsedMode && (
                  <span className="text-sm font-medium tracking-wide transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-card-border space-y-2">
          {/* Pricing Settings */}
          <Link
            href={pricingItem.href}
            className={`group flex items-center rounded-xl border transition-all ${
              pathname === pricingItem.href
                ? "bg-zinc-200/60 dark:bg-zinc-900/60 border-zinc-300/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white font-medium shadow-inner"
                : "border-transparent text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/20"
            } ${mounted && isCollapsed ? "justify-center p-2" : "gap-4 p-3"}`}
            title={mounted && isCollapsed ? pricingItem.name : undefined}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${pricingItem.bgColor} shadow-md flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
            >
              <HugeiconsIcon icon={pricingItem.icon} size={20} />
            </div>
            {!(mounted && isCollapsed) && (
              <span className="text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                {pricingItem.name}
              </span>
            )}
          </Link>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className={`group w-full flex items-center rounded-xl border border-transparent text-zinc-500 hover:text-red-455 hover:bg-red-500/5 transition-all text-left cursor-pointer ${
              mounted && isCollapsed ? "justify-center p-2" : "gap-4 p-3"
            }`}
            title={mounted && isCollapsed ? "Sign Out" : undefined}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-250 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-white group-hover:border-red-500/20 group-hover:text-red-455 shadow-md flex-shrink-0 transition-transform duration-200">
              <HugeiconsIcon icon={Logout01Icon} size={20} />
            </div>
            {!(mounted && isCollapsed) && (
              <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto relative z-10">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 border-b border-card-border bg-card-bg/25 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Workspace</h2>
            <h1 className="text-xl font-extrabold text-text-primary capitalize tracking-tight mt-0.5">
              {pathname === "/dashboard" 
                ? "Control Center" 
                : pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "10s" }} />
                    <span>Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-violet-650" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile indicator */}
            {profile && (
              <div className="flex items-center gap-3 pl-4 border-l border-card-border/80">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || "User Avatar"}
                    className="w-8 h-8 rounded-lg object-cover border border-card-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center font-bold text-xs text-text-primary">
                    {profile.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">{profile.name || "Aura User"}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">
                    {profile.auth_provider === 'phone' ? "Phone Connected" : "Email Sync Active"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
