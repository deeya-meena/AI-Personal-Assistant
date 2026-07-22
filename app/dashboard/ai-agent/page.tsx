"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Brain01Icon,
  SentIcon,
  SparklesIcon,
  UserIcon,
  Add01Icon,
  Tick02Icon,
  Copy01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { Loader2, Sparkles, Zap } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: "user" | "aura";
  text: string;
  timestamp: string;
  suggestions?: string[];
  isStreaming?: boolean;
}

interface RecentUpdate {
  platform: string;
  text: string;
  time: string;
  priority: "high" | "normal";
}

// ─── Token helper ─────────────────────────────────────────────────────────────

const getValidToken = async (): Promise<string> => {
  let token =
    (
      insforge as unknown as {
        tokenManager?: { getAccessToken: () => string };
      }
    ).tokenManager?.getAccessToken() || "";
  if (!token) return "";
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp * 1000 < Date.now() + 10000) {
        const { data, error } = await insforge.auth.refreshSession();
        if (!error && data?.accessToken) token = data.accessToken;
      }
    }
  } catch {}
  return token;
};

// ─── Platform SVG logos ────────────────────────────────────────────────────────

const PlatformLogo = ({
  platform,
  size = 16,
}: {
  platform: string;
  size?: number;
}) => {
  const s = `w-[${size}px] h-[${size}px]`;
  const p = platform.toLowerCase();

  if (p === "gmail")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
          fill="#EA4335"
        />
      </svg>
    );

  if (p === "whatsapp")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.18 15.65C16.96 16.27 16.08 16.76 15.42 16.9C14.97 17 14.39 17.09 12.42 16.27C9.9 15.22 8.27 12.66 8.15 12.5C8.03 12.34 7.15 11.17 7.15 9.96C7.15 8.75 7.77 8.16 8.02 7.9C8.21 7.71 8.52 7.63 8.82 7.63C8.92 7.63 9.02 7.64 9.11 7.64C9.38 7.65 9.52 7.67 9.7 8.1C9.93 8.65 10.49 10.01 10.56 10.15C10.63 10.29 10.7 10.48 10.61 10.67C10.52 10.86 10.45 10.95 10.31 11.11C10.17 11.27 10.04 11.4 9.9 11.57C9.77 11.72 9.62 11.89 9.79 12.18C9.96 12.47 10.55 13.43 11.42 14.21C12.55 15.22 13.48 15.54 13.8 15.67C14.04 15.77 14.32 15.75 14.5 15.56C14.73 15.31 15.02 14.91 15.31 14.5C15.52 14.21 15.77 14.17 16.03 14.27C16.3 14.37 17.7 15.06 17.99 15.21C18.28 15.36 18.47 15.44 18.54 15.57C18.61 15.7 18.61 16.34 17.18 15.65Z"
          fill="#25D366"
        />
      </svg>
    );

  if (p === "slack")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
          fill="#E01E5A"
        />
      </svg>
    );

  if (p === "outlook")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.07.04.12.1.07.04.1.1.06.07.1.14.02.06.04.14zm-12.7 0H8.19q.02.25.04.5.04.24.08.48h3.02l-.03-.98zm.01-2.05H8.57q-.07.24-.11.49-.04.25-.04.51h3.84v-1zm5.29 5.49q-.36 0-.72-.07-.36-.06-.68-.2-.3-.13-.52-.34-.22-.2-.27-.49h-.01v.01h-1.3v-2.34h1.27q.04-.3.27-.51.22-.2.52-.33.3-.14.66-.2.37-.08.72-.08.46 0 .84.11.37.12.65.34.28.2.44.5.17.28.17.65 0 .35-.15.62-.15.28-.42.48-.27.2-.63.3-.35.11-.74.11-.4 0-.76-.1-.37-.11-.65-.31-.27-.21-.43-.5-.15-.31-.15-.66v-.01q.01-.02.01-.04v-.02q0-.03 0-.05l-.01.05v.02q0 .02 0 .04 0 .36.15.67.16.3.43.5.27.2.65.31.37.1.76.1zm1.91-10.47H8.5v3.5h1V6.5h9.04v2.5H19V4zm0 11v2.5H8.5v-2.5H8v4.97h11V15z"
          fill="#0078D4"
        />
      </svg>
    );

  if (p === "discord")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"
          fill="#5865F2"
        />
      </svg>
    );

  if (p === "linkedin")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          fill="#0A66C2"
        />
      </svg>
    );

  if (p === "telegram")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
          fill="#24A1DE"
        />
      </svg>
    );

  if (p === "github")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
          fill="#9CA3AF"
        />
      </svg>
    );

  // Generic
  return (
    <div
      className="rounded flex items-center justify-center text-[9px] font-bold text-fuchsia-400"
      style={{ width: size, height: size }}
    >
      {platform[0]?.toUpperCase()}
    </div>
  );
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text;

  // Code blocks (```lang\n...\n```)
  html = html.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre class="md-code-block"><code class="${lang ? `language-${lang}` : ""}">${escapeHtml(code.trim())}</code></pre>`
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="md-inline-code">$1</code>'
  );

  // Tables
  html = html.replace(/(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g, (table) => {
    const lines = table.trim().split("\n");
    const headerRow = lines[0];
    const bodyRows = lines.slice(2);
    const headers = headerRow.split("|").filter(Boolean).map(h => `<th class="md-th">${h.trim()}</th>`).join("");
    const rows = bodyRows.map(row => {
      const cells = row.split("|").filter(Boolean).map(c => `<td class="md-td">${c.trim()}</td>`).join("");
      return `<tr class="md-tr">${cells}</tr>`;
    }).join("");
    return `<div class="md-table-wrap"><table class="md-table"><thead><tr class="md-tr-head">${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Headings
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^#{3}\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^#{2}\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^#{1}\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em class="md-italic">$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^(\s*)[-*+]\s+(.+)$/gm, '$1<li class="md-li">$2</li>');
  html = html.replace(/(<li class="md-li">.*<\/li>\n?)+/g, (match) =>
    `<ul class="md-ul">${match}</ul>`
  );

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-li-ol">$1</li>');
  html = html.replace(/(<li class="md-li-ol">.*<\/li>\n?)+/g, (match) =>
    `<ol class="md-ol">${match}</ol>`
  );

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // Paragraphs (wrap lines that aren't already wrapped in tags)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="md-p">$1</p>');

  // Newlines to <br> inside paragraphs handled by CSS
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Inline platform badge ─────────────────────────────────────────────────────

const PLATFORM_KEYWORDS: Record<string, string> = {
  gmail: "gmail",
  email: "gmail",
  mail: "gmail",
  whatsapp: "whatsapp",
  whats: "whatsapp",
  slack: "slack",
  outlook: "outlook",
  discord: "discord",
  linkedin: "linkedin",
  telegram: "telegram",
  github: "github",
};

const detectPlatforms = (text: string): string[] => {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, platform] of Object.entries(PLATFORM_KEYWORDS)) {
    if (lower.includes(keyword)) found.add(platform);
  }
  return Array.from(found);
};

// ─── Quick suggestion cards (initial state) ───────────────────────────────────

const QUICK_SUGGESTIONS = [
  {
    icon: "✉️",
    label: "Summarize my inbox",
    prompt: "Summarize my most important emails and messages from today.",
  },
  {
    icon: "📋",
    label: "Today's priorities",
    prompt: "What are my top priority tasks and action items for today?",
  },
  {
    icon: "💬",
    label: "WhatsApp updates",
    prompt: "Are there any urgent WhatsApp or messaging updates I should know about?",
  },
  {
    icon: "✍️",
    label: "Draft a reply",
    prompt: "Help me draft a professional reply to my latest email.",
  },
  {
    icon: "📊",
    label: "Weekly report",
    prompt: "Give me a brief overview of my week based on my connected apps.",
  },
  {
    icon: "🔔",
    label: "Missed notifications",
    prompt: "What important notifications or updates might I have missed?",
  },
];

// ─── Chat storage helpers (1-day TTL) ────────────────────────────────────────

const CHAT_STORAGE_KEY = "aura_chat_history_v2";
const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

const loadChatHistory = (): Message[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const { messages, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > CHAT_TTL_MS) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return [];
    }
    return messages || [];
  } catch {
    return [];
  }
};

const saveChatHistory = (messages: Message[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({ messages, savedAt: Date.now() })
    );
  } catch {}
};

const clearChatHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_STORAGE_KEY);
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function AIAgentPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Mount & load history ──────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const history = loadChatHistory();
    setMessages(history);
    fetchRecentUpdates();
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Persist history ───────────────────────────────────────────────────────
  useEffect(() => {
    if (mounted && messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages, mounted]);

  // ── Fetch recent updates from cache ──────────────────────────────────────
  const fetchRecentUpdates = async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const { data: cacheRow } = await insforge.database
        .from("dashboard_cache")
        .select("brief_content, priority_content")
        .maybeSingle();

      const updates: RecentUpdate[] = [];

      if (cacheRow?.priority_content) {
        const pc = cacheRow.priority_content as any;
        if (Array.isArray(pc)) {
          pc.slice(0, 3).forEach((item: any) => {
            updates.push({
              platform: item.source || "general",
              text: item.subject || item.message || item.text || "Priority update",
              time: item.time || "Now",
              priority: item.priority === "high" ? "high" : "normal",
            });
          });
        }
      }

      if (cacheRow?.brief_content) {
        const bc = cacheRow.brief_content as any;
        if (bc?.highlight) {
          updates.unshift({
            platform: "aura",
            text: bc.highlight,
            time: "Today",
            priority: "high",
          });
        }
      }

      if (updates.length === 0) {
        setRecentUpdates([
          { platform: "gmail", text: "2 unread high-priority emails", time: "Now", priority: "high" },
          { platform: "whatsapp", text: "3 new messages waiting", time: "5m ago", priority: "normal" },
          { platform: "aura", text: "Daily briefing ready to review", time: "Today", priority: "normal" },
        ]);
      } else {
        setRecentUpdates(updates.slice(0, 4));
      }
    } catch {
      setRecentUpdates([
        { platform: "gmail", text: "Connect Gmail to see email updates", time: "—", priority: "normal" },
        { platform: "whatsapp", text: "Connect WhatsApp to see messages", time: "—", priority: "normal" },
      ]);
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text?: string) => {
      const prompt = (text || inputText).trim();
      if (!prompt || isStreaming) return;

      setInputText("");

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: prompt,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      const streamId = `aura-${Date.now() + 1}`;
      const streamingMsg: Message = {
        id: streamId,
        sender: "aura",
        text: "",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, streamingMsg]);
      setIsStreaming(true);

      try {
        const token = await getValidToken();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Build history (exclude the current streaming placeholder)
        const historyForApi = messages.filter(
          (m) => !m.isStreaming && m.text
        );

        const res = await fetch("/api/dashboard/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: prompt, history: historyForApi }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to connect to AI");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let suggestions: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                accumulated += `\n\n⚠️ Error: ${parsed.error}`;
              } else if (parsed.token) {
                accumulated += parsed.token;
              } else if (parsed.done) {
                suggestions = parsed.suggestions || [];
              }

              // Update message in real-time
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamId
                    ? { ...m, text: accumulated, isStreaming: !parsed.done }
                    : m
                )
              );
            } catch {}
          }
        }

        // Final update with suggestions
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamId
              ? { ...m, text: accumulated, isStreaming: false, suggestions }
              : m
          )
        );
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamId
              ? {
                  ...m,
                  text: "⚠️ Sorry, I couldn't reach the AI. Please check your connection and try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
        inputRef.current?.focus();
      }
    },
    [inputText, isStreaming, messages]
  );

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── New conversation ──────────────────────────────────────────────────────
  const handleNewConversation = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setMessages([]);
    clearChatHistory();
    setInputText("");
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Inline styles for markdown rendering */}
      <style>{`
        .md-h1 { font-size: 1.25rem; font-weight: 800; margin: 0.75rem 0 0.5rem; color: inherit; }
        .md-h2 { font-size: 1.1rem; font-weight: 700; margin: 0.65rem 0 0.4rem; color: inherit; }
        .md-h3 { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0.3rem; color: inherit; }
        .md-h4 { font-size: 0.9rem; font-weight: 600; margin: 0.4rem 0 0.25rem; color: inherit; }
        .md-p { margin: 0.35rem 0; line-height: 1.65; }
        .md-bold { font-weight: 700; }
        .md-italic { font-style: italic; }
        .md-ul, .md-ol { margin: 0.5rem 0 0.5rem 1.25rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .md-ul { list-style-type: disc; }
        .md-ol { list-style-type: decimal; }
        .md-li, .md-li-ol { line-height: 1.6; }
        .md-code-block { background: var(--muted); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem 1rem; margin: 0.6rem 0; overflow-x: auto; font-family: monospace; font-size: 0.8rem; line-height: 1.6; white-space: pre; color: var(--foreground); }
        .md-inline-code { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25); border-radius: 0.25rem; padding: 0.1rem 0.35rem; font-family: monospace; font-size: 0.82em; color: inherit; }
        .md-link { color: #8b5cf6; text-decoration: underline; text-underline-offset: 2px; }
        .md-link:hover { color: #a78bfa; }
        .md-blockquote { border-left: 3px solid #8b5cf6; padding-left: 0.85rem; margin: 0.5rem 0; opacity: 0.8; font-style: italic; }
        .md-hr { border: none; border-top: 1px solid var(--border); margin: 0.75rem 0; }
        .md-table-wrap { overflow-x: auto; margin: 0.6rem 0; }
        .md-table { border-collapse: collapse; width: 100%; font-size: 0.82rem; }
        .md-th { background: rgba(139,92,246,0.15); padding: 0.4rem 0.75rem; text-align: left; font-weight: 700; border: 1px solid var(--border); }
        .md-td { padding: 0.35rem 0.75rem; border: 1px solid var(--border); }
        .md-tr:nth-child(even) { background: var(--muted); }
        .md-tr-head { background: rgba(139,92,246,0.1); }

        .cursor-blink::after { content: "▋"; animation: blink 0.8s step-end infinite; margin-left: 1px; opacity: 0.7; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        .chat-bubble-aura { background: var(--card); border: 1px solid var(--card-border); }
        .chat-bubble-user { background: var(--primary); color: var(--primary-foreground); border: 1px solid var(--primary); }

        .scrollbar-thin-chat::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin-chat::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin-chat::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }
      `}</style>

      <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-105px)] w-full max-w-4xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-700 flex items-center justify-center text-white shadow-lg">
                <HugeiconsIcon icon={Brain01Icon} size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card-bg animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary leading-none">
                Aura AI Agent
              </h1>
              <p className="text-[10px] font-mono text-text-secondary mt-0.5">
                GEMINI · STREAMING · CONNECTED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-mono text-fuchsia-600 dark:text-fuchsia-400">
              <Zap className="w-3 h-3 animate-pulse" />
              <span>Live</span>
            </div>
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-card-border text-text-secondary hover:text-text-primary hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="New conversation"
            >
              <HugeiconsIcon icon={Add01Icon} size={13} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* ── Empty state: Recent Summary + Quick Suggestions ──────────────── */}
        {isEmpty && (
          <div className="flex-1 overflow-y-auto scrollbar-thin-chat space-y-6">
            {/* Recent Summary */}
            <div className="glassmorphism rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-fuchsia-500 animate-pulse" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-widest">
                  Recent Summary
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentUpdates.map((update, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-default shadow-sm ${
                      update.priority === "high"
                        ? "border-fuchsia-500/25 bg-fuchsia-500/10"
                        : "border-card-border bg-card"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <PlatformLogo platform={update.platform} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {update.text}
                      </p>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {update.time}
                      </span>
                    </div>
                    {update.priority === "high" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Suggestion Cards */}
            <div>
              <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-3 px-1">
                Quick Suggestions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-card-border bg-card hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 text-left transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-text-primary group-hover:text-fuchsia-500 transition-colors leading-snug">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Chat messages ─────────────────────────────────────────────────── */}
        {!isEmpty && (
          <div className="flex-1 overflow-y-auto scrollbar-thin-chat space-y-4 pr-1 pb-2">
            {messages.map((msg) => {
              const platforms = msg.sender === "aura" ? detectPlatforms(msg.text) : [];
              const isCurrentlyStreaming = msg.isStreaming;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "flex-row-reverse ml-8 sm:ml-20" : "mr-8 sm:mr-20"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                      msg.sender === "user"
                        ? "bg-muted border border-card-border"
                        : "bg-gradient-to-br from-fuchsia-600 to-violet-700"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={msg.sender === "user" ? UserIcon : Brain01Icon}
                      size={15}
                      color="white"
                    />
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    {/* Platform badges for aura messages */}
                    {platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {platforms.map((p) => (
                          <div
                            key={p}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-card-border text-[10px] font-mono text-text-secondary"
                          >
                            <PlatformLogo platform={p} size={11} />
                            <span className="capitalize">{p}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "chat-bubble-user rounded-tr-none"
                          : "chat-bubble-aura text-text-primary rounded-tl-none"
                      }`}
                    >
                      {msg.sender === "aura" ? (
                        isCurrentlyStreaming && !msg.text ? (
                          /* Thinking indicator */
                          <div className="flex items-center gap-2 py-1">
                            <Loader2 className="w-4 h-4 text-fuchsia-500 animate-spin" />
                            <span className="text-xs text-text-secondary font-mono">
                              Aura is thinking…
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`prose-aura ${isCurrentlyStreaming ? "cursor-blink" : ""}`}
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(msg.text),
                            }}
                          />
                        )
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>

                    {/* Footer: timestamp + copy */}
                    <div
                      className={`flex items-center gap-2 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-text-secondary">
                        {msg.timestamp}
                      </span>
                      {msg.sender === "aura" && !isCurrentlyStreaming && msg.text && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <HugeiconsIcon icon={Tick02Icon} size={12} />
                          ) : (
                            <HugeiconsIcon icon={Copy01Icon} size={12} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Quick reply suggestions */}
                    {msg.sender === "aura" &&
                      !isCurrentlyStreaming &&
                      msg.suggestions &&
                      msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(s)}
                              disabled={isStreaming}
                              className="px-3 py-1.5 text-[11px] rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Suggestion chips (when chatting) ─────────────────────────────── */}
        {!isEmpty && !isStreaming && (
          <div className="flex gap-2 overflow-x-auto pb-1 pt-3 scrollbar-none flex-shrink-0">
            {["Summarize key points", "What's next?", "More details"].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                disabled={isStreaming}
                className="px-3.5 py-1.5 rounded-full text-[11px] bg-card border border-card-border text-text-secondary hover:text-text-primary hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── Input area ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 pt-3 border-t border-card-border mt-3">
          <div className="relative flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura anything about your workspace, emails, messages…"
              disabled={isStreaming}
              rows={1}
              className="flex-1 resize-none bg-card hover:bg-muted/50 focus:bg-card border border-card-border focus:border-accent-violet rounded-2xl pl-5 pr-14 py-3.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all shadow-sm overflow-hidden"
              style={{ minHeight: "52px", maxHeight: "120px" }}
            />

            {/* Send / Stop button */}
            {isStreaming ? (
              <button
                onClick={() => {
                  abortControllerRef.current?.abort();
                  setIsStreaming(false);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.isStreaming ? { ...m, isStreaming: false } : m
                    )
                  );
                }}
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-muted border border-card-border text-text-secondary hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-500 transition-all cursor-pointer"
                title="Stop generating"
              >
                <div className="w-4 h-4 rounded-sm bg-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg hover:from-fuchsia-500 hover:to-violet-500 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Send message (Enter)"
              >
                <HugeiconsIcon icon={SentIcon} size={15} />
              </button>
            )}
          </div>
          <p className="text-[10px] font-mono text-text-secondary mt-2 text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-muted border border-card-border text-text-primary">Enter</kbd> to send &bull; <kbd className="px-1 py-0.5 rounded bg-muted border border-card-border text-text-primary">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </>
  );
}
