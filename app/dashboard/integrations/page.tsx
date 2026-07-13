"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Layers01Icon, 
  ArrowUpDownIcon, 
  Settings01Icon, 
  CircleCheckIcon, 
  AlertCircleIcon, 
  CodeIcon, 
  FolderIcon 
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";
import { insforge } from "../../../lib/insforge";
import { 
  Loader2, 
  Check, 
  Copy, 
  RefreshCw, 
  Lock,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

// Official brand vector SVGs
const GmailIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#3B82F6" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M12.004 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12.004 22C17.528 22 22 17.52 22 12C22 6.48 17.52 2 12.004 2ZM17.184 15.65C16.964 16.27 16.084 16.76 15.424 16.9C14.974 17 14.394 17.09 12.424 16.27C9.904 15.22 8.274 12.66 8.154 12.5C8.034 12.34 7.154 11.17 7.154 9.96C7.154 8.75 7.774 8.16 8.024 7.9C8.214 7.71 8.524 7.63 8.824 7.63C8.924 7.63 9.024 7.64 9.114 7.64C9.384 7.65 9.524 7.67 9.704 8.1C9.934 8.65 10.494 10.01 10.564 10.15C10.634 10.29 10.704 10.48 10.614 10.67C10.524 10.86 10.454 10.95 10.314 11.11C10.174 11.27 10.044 11.4 9.904 11.57C9.774 11.72 9.624 11.89 9.794 12.18C9.964 12.47 10.554 13.43 11.424 14.21C12.554 15.22 13.484 15.54 13.804 15.67C14.044 15.77 14.324 15.75 14.504 15.56C14.734 15.31 15.024 14.91 15.314 14.5C15.524 14.21 15.774 14.17 16.034 14.27C16.304 14.37 17.704 15.06 17.994 15.21C18.284 15.36 18.474 15.44 18.544 15.57C18.614 15.7 18.614 16.34 16.394 16.97C16.394 16.97 17.184 15.65 17.184 15.65Z" fill="#3B82F6" />
  </svg>
);

const SlackIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.043zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zm0 1.262a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.825a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.78a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522h-5.043a2.528 2.528 0 0 1-2.522-2.522V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.134a2.528 2.528 0 0 1 2.52 2.522a2.528 2.528 0 0 1-2.52 2.521a2.528 2.528 0 0 1-2.522-2.521v-2.522h2.522zm0-1.261a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H20.22a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" fill="#3B82F6" />
  </svg>
);

const OutlookIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M12 2H4C2.9 2 2.01 2.9 2.01 4L2 20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8L12 2ZM20 20H4V8H12V4H20V20ZM10 12H6V10H10V12ZM16 16H6V14H16V16ZM18 10H14V12H18V10Z" fill="#3B82F6" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.172-.393-.412-.882-.63-1.25a.074.074 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" fill="#3B82F6" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#3B82F6" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8L14.99 16.6C14.87 17.15 14.53 17.28 14.07 17.02L11.56 15.17L10.35 16.33C10.22 16.46 10.11 16.57 9.85 16.57L10.03 14.01L14.69 9.8C14.89 9.62 14.65 9.52 14.38 9.7L8.62 13.33L6.14 12.56C5.6 12.39 5.59 12.02 6.25 11.76L15.93 8.02C16.38 7.86 16.77 8.13 16.64 8.8Z" fill="#3B82F6" />
  </svg>
);

const NotionIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v12h1.5v-2.5l3.5 2.5h2.5V6H12v6l-3.5-3V6H6zm10 0v1.5h1.5V18h1.5V7.5H20V6h-4z" fill="#3B82F6" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" fill="#3B82F6" />
  </svg>
);

const JiraIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
    <path d="M11.53 2C11.53 2 11.53 3.5 10 5C8.5 6.5 2 13 2 13L7.5 18.5C7.5 18.5 14 12 15.5 10.5C17 9 18.5 9 18.5 9L11.53 2Z" fill="#3B82F6" />
    <path d="M22 12.47C22 12.47 22 13.97 20.47 15.47C18.97 16.97 12.47 23.47 12.47 23.47L17.97 18C17.97 18 24.47 11.5 25.97 10C27.47 8.5 28.97 8.5 28.97 8.5L22 12.47Z" fill="#3B82F6" />
  </svg>
);

interface Platform {
  id: string;
  name: string;
  category: "email" | "chat" | "workspace" | "social";
  description: string;
  logo: React.ReactNode;
  mcpServerName: string;
  mcpTools: {
    name: string;
    description: string;
    params: string;
  }[];
}

const platforms: Platform[] = [
  {
    id: "gmail",
    name: "Gmail Integration",
    category: "email",
    description: "Autonomously parse transactional and priority messages, structure threads, and draft direct email replies.",
    logo: <GmailIcon />,
    mcpServerName: "gmail-mcp-server",
    mcpTools: [
      { name: "gmail_list_messages", description: "Fetch list of messages from inbox matching query filters", params: '{"q": "string", "limit": "number"}' },
      { name: "gmail_get_message", description: "Retrieve content and headers of a specific email by message ID", params: '{"id": "string"}' },
      { name: "gmail_create_draft", description: "Create an email reply draft in user's inbox", params: '{"threadId": "string", "replyBody": "string"}' },
      { name: "gmail_send_message", description: "Send an email message instantly", params: '{"to": "string", "subject": "string", "body": "string"}' }
    ]
  },
  {
    id: "whatsapp",
    name: "WhatsApp Personal",
    category: "chat",
    description: "Sync personal chat logs and media links safely. Synthesize chaotic group chat notifications.",
    logo: <WhatsAppIcon />,
    mcpServerName: "whatsapp-mcp-server",
    mcpTools: [
      { name: "whatsapp_get_recent_messages", description: "Fetch list of active chats/messages", params: '{"limit": "number"}' },
      { name: "whatsapp_read_chat_history", description: "Read message logs for a specific contact", params: '{"chatId": "string", "limit": "number"}' },
      { name: "whatsapp_send_message", description: "Send a direct message to a phone number", params: '{"chatId": "string", "message": "string"}' },
      { name: "whatsapp_search_chats", description: "Search chats matching a query term", params: '{"query": "string"}' },
      { name: "whatsapp_summarize_conversations", description: "Generate an AI summary of a chat", params: '{"chatId": "string"}' },
      { name: "whatsapp_get_contact_details", description: "Retrieve profile info, status and pfp for a phone number", params: '{"phone": "string"}' },
      { name: "whatsapp_list_groups", description: "List all WhatsApp groups", params: "{}" },
      { name: "whatsapp_fetch_group_messages", description: "Fetch recent messages for a group", params: '{"groupId": "string", "limit": "number"}' },
      { name: "whatsapp_send_group_messages", description: "Send a message to a WhatsApp group", params: '{"groupId": "string", "message": "string"}' }
    ]
  },
  {
    id: "slack",
    name: "Slack Enterprise",
    category: "chat",
    description: "Monitor channel noise. Automatically identify tasks, calendar changes, and direct @mentions.",
    logo: <SlackIcon />,
    mcpServerName: "slack-mcp-server",
    mcpTools: [
      { name: "slack_get_channels", description: "List all public workspace channels", params: "{}" },
      { name: "slack_get_history", description: "Fetch recent channel message history", params: '{"channelId": "string", "limit": "number"}' },
      { name: "slack_post_message", description: "Post rich block notification messages", params: '{"channel": "string", "text": "string"}' }
    ]
  },
  {
    id: "outlook",
    name: "Outlook Exchange",
    category: "email",
    description: "Access corporate mail, coordinate tasks, and sync enterprise contacts with calendar invite parser.",
    logo: <OutlookIcon />,
    mcpServerName: "outlook-mcp-server",
    mcpTools: [
      { name: "outlook_list_emails", description: "Retrieve corporate inbox emails", params: '{"limit": "number"}' },
      { name: "outlook_get_email", description: "Retrieve content of Outlook message ID", params: '{"id": "string"}' },
      { name: "outlook_create_draft", description: "Prepare drafted emails in enterprise mailbox", params: '{"to": "string", "subject": "string", "body": "string"}' }
    ]
  },
  {
    id: "discord",
    name: "Discord Communities",
    category: "chat",
    description: "Monitor server announcements, ping threads, and organize developer alerts across channels.",
    logo: <DiscordIcon />,
    mcpServerName: "discord-mcp-server",
    mcpTools: [
      { name: "discord_get_guilds", description: "List accessible servers/guilds", params: "{}" },
      { name: "discord_get_channels", description: "List text and voice channels of guild ID", params: '{"guildId": "string"}' },
      { name: "discord_post_message", description: "Send a message to a text channel", params: '{"channelId": "string", "content": "string"}' }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn Network",
    category: "social",
    description: "Track connection inbox messages, network alerts, and automate direct business messages.",
    logo: <LinkedInIcon />,
    mcpServerName: "linkedin-mcp-server",
    mcpTools: [
      { name: "linkedin_get_profile", description: "Retrieve public profile details", params: "{}" },
      { name: "linkedin_share_post", description: "Create and publish a post updates", params: '{"text": "string"}' }
    ]
  },
  {
    id: "telegram",
    name: "Telegram Channels",
    category: "chat",
    description: "Aggregate announcements, bot updates, and track group messages for action item synthesis.",
    logo: <TelegramIcon />,
    mcpServerName: "telegram-mcp-server",
    mcpTools: [
      { name: "telegram_get_updates", description: "Fetch incoming channel updates", params: "{}" },
      { name: "telegram_send_message", description: "Send chat text message to chat ID", params: '{"chatId": "string", "text": "string"}' }
    ]
  },
  {
    id: "notion",
    name: "Notion Workspaces",
    category: "workspace",
    description: "Search databases, append synthesized summaries, and update personal task templates.",
    logo: <NotionIcon />,
    mcpServerName: "notion-mcp-server",
    mcpTools: [
      { name: "notion_list_databases", description: "List all shared databases in workspace", params: "{}" },
      { name: "notion_get_database", description: "Query database structure and items", params: '{"databaseId": "string"}' },
      { name: "notion_create_page", description: "Create a page inside a Notion database", params: '{"parentDatabaseId": "string", "properties": "object"}' }
    ]
  },
  {
    id: "github",
    name: "GitHub Developer",
    category: "workspace",
    description: "Sync PR reviews, assignees, issue lists, and track repo notifications in real-time.",
    logo: <GitHubIcon />,
    mcpServerName: "github-mcp-server",
    mcpTools: [
      { name: "github_list_repos", description: "List user repositories", params: "{}" },
      { name: "github_get_issue", description: "Get issue details for a repository", params: '{"owner": "string", "repo": "string", "issueNumber": "number"}' },
      { name: "github_create_issue", description: "Create an issue in a repository", params: '{"owner": "string", "repo": "string", "title": "string", "body": "string"}' }
    ]
  },
  {
    id: "jira",
    name: "Jira Product Manager",
    category: "workspace",
    description: "Track project sprints, update issue ticket statuses, and map actions to developers.",
    logo: <JiraIcon />,
    mcpServerName: "jira-mcp-server",
    mcpTools: [
      { name: "jira_list_projects", description: "List accessible enterprise board projects", params: "{}" },
      { name: "jira_get_issue", description: "Fetch specific ticket status details", params: '{"key": "string"}' },
      { name: "jira_create_issue", description: "Create a sprint issue ticket", params: '{"projectKey": "string", "summary": "string", "description": "string"}' }
    ]
  }
];

interface MockEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
}

// Keep track of OAuth codes that have already been sent for exchange to prevent duplicate execution in React StrictMode
const exchangedCodes = new Set<string>();

export default function IntegrationsPage() {
  const { user } = useAuth();
  
  // Helper to ensure we always use a valid, unexpired access token for custom backend API routes
  const getValidToken = async (): Promise<string> => {
    let token = (insforge as any).tokenManager?.getAccessToken() || "";
    if (!token) return "";
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp * 1000 < Date.now() + 10000; // 10s buffer
        if (isExpired) {
          console.log("[Integrations] Access token expired, refreshing session...");
          const { data, error } = await insforge.auth.refreshSession();
          if (!error && data?.accessToken) {
            token = data.accessToken;
          } else {
            console.error("[Integrations] Failed to refresh session:", error);
          }
        }
      }
    } catch (err) {
      console.error("[Integrations] Error parsing/refreshing token:", err);
    }
    return token;
  };

  const [dbData, setDbData] = useState<Record<string, { status: string; synced_count: number; mode?: string; phone?: string; lastConnected?: string }>>({});
  const [loadingDb, setLoadingDb] = useState(true);
  const [activeDialogPlatform, setActiveDialogPlatform] = useState<Platform | null>(null);
  
  // Gmail Oauth loading states
  const [exchangingCode, setExchangingCode] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [runningToolName, setRunningToolName] = useState<string | null>(null);

  // Gmail API simulator/real data states
  const [gmailMessages, setGmailMessages] = useState<MockEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<MockEmail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [draftSuccessMessage, setDraftSuccessMessage] = useState("");

  // WhatsApp Connection & Pairing Flow States
  const [waConnectOpen, setWaConnectOpen] = useState(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState("");
  const [waPairingCode, setWaPairingCode] = useState("");
  const [waConnecting, setWaConnecting] = useState(false);
  const [waError, setWaError] = useState("");
  const [waMode, setWaMode] = useState<"production" | "sandbox">("production");
  const [isPollingWa, setIsPollingWa] = useState(false);
  const [waTimer, setWaTimer] = useState(120);

  // Toast Notification States
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(null);
  const isInitialSse = React.useRef(true);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
  };

  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // WhatsApp Settings Dialog Interactive Tools
  const [waTools, setWaTools] = useState<any[]>([]);
  const [loadingWaTools, setLoadingWaTools] = useState(false);
  const [activeWaCategory, setActiveWaCategory] = useState("Messaging");
  const [expandedWaTool, setExpandedWaTool] = useState<string | null>(null);
  const [waExecutingTool, setWaExecutingTool] = useState<string | null>(null);
  const [waExecutionOutputs, setWaExecutionOutputs] = useState<Record<string, any>>({});
  const [toolInputs, setToolInputs] = useState<Record<string, Record<string, any>>>({});

  // Load connection statuses from InsForge Database
  useEffect(() => {
    async function loadStatuses() {
      if (!user) return;
      setLoadingDb(true);
      try {
        const { data, error } = await insforge.database
          .from("user_integrations")
          .select("platform_id, status, synced_count, settings")
          .eq("user_id", user.id);

        if (error) {
          console.error("Failed to load integrations from DB:", error);
        } else if (data) {
          const map: Record<string, { status: string; synced_count: number; mode?: string }> = {};
          data.forEach((row: any) => {
            map[row.platform_id] = {
              status: row.status,
              synced_count: row.synced_count || 0,
              mode: row.settings?.mode || "production"
            };
          });
          setDbData(map);
        }
      } catch (err) {
        console.error("DB Load exception:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    loadStatuses();
  }, [user]);

  // Real-time EventSource listener
  useEffect(() => {
    if (!user) return;
    
    let eventSource: EventSource | null = null;
    let active = true;

    const initSse = async () => {
      const insforgeToken = await getValidToken();
      if (!insforgeToken || !active) return;

      eventSource = new EventSource(`/api/integrations/whatsapp/sse?token=${encodeURIComponent(insforgeToken)}`);

      eventSource.addEventListener("status", (e: any) => {
        try {
          const data = JSON.parse(e.data);
          console.log("[SSE Status Update]:", data);
          
          let wasConnected = false;
          setDbData(prev => {
            wasConnected = prev.whatsapp?.status === "connected";
            return {
              ...prev,
              whatsapp: {
                status: data.status,
                synced_count: data.status === 'connected' ? 85 : 0,
                mode: data.mode || 'production',
                phone: data.phone || '',
                lastConnected: data.lastConnected || ''
              }
            };
          });

          if (data.status === 'connected') {
            setWaConnectOpen(false);
            setActiveDialogPlatform(prev => prev?.id === 'whatsapp' ? null : prev);
            setIsPollingWa(false);
            
            if (isInitialSse.current) {
              isInitialSse.current = false;
            } else if (!wasConnected) {
              triggerToast("WhatsApp Connected");
            }
          } else {
            isInitialSse.current = false;
          }
        } catch (err) {
          console.error("Failed to parse SSE status:", err);
        }
      });

      eventSource.addEventListener("pairingCode", (e: any) => {
        try {
          const data = JSON.parse(e.data);
          console.log("[SSE Pairing Code Update]:", data);
          setWaPairingCode(data.pairingCode);
          setWaConnecting(false);
        } catch (err) {
          console.error("Failed to parse SSE pairingCode:", err);
        }
      });
    };

    initSse();

    return () => {
      active = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  // Pairing code countdown timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (waPairingCode && waConnectOpen && waTimer > 0) {
      timerId = setInterval(() => {
        setWaTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [waPairingCode, waConnectOpen, waTimer]);

  // Poll WhatsApp connection status while pairing code is shown.
  // This is the most reliable path — it catches the "connected" state
  // even if the SSE event is missed or the socket close code is undefined.
  useEffect(() => {
    if (!waPairingCode || !waConnectOpen || !user) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 72; // 72 × 5s = 6 minutes max

    const pollId = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollId);
        return;
      }
      try {
        const insforgeToken = await getValidToken();
        const res = await fetch("/api/integrations/whatsapp/status", {
          headers: { "Authorization": `Bearer ${insforgeToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        console.log("[WhatsApp Poll]:", data.status);

        if (data.status === "connected") {
          clearInterval(pollId);
          setDbData(prev => ({
            ...prev,
            whatsapp: {
              status: "connected",
              synced_count: 85,
              mode: data.mode || "production",
              phone: data.phone || waPhoneNumber,
              lastConnected: data.lastConnected || new Date().toISOString()
            }
          }));
          setWaConnectOpen(false);
          setWaPairingCode("");
        }
      } catch (_) {}
    }, 5000);

    return () => clearInterval(pollId);
  }, [waPairingCode, waConnectOpen, user]);

  const handleWaGeneratePairingCode = async () => {
    const phone = waPhoneNumber.trim();
    if (!phone) {
      setWaError("Phone number is required.");
      return;
    }
    if (!phone.startsWith("+")) {
      setWaError("Phone number must start with '+' and include a country code (e.g. +15550199).");
      return;
    }

    setWaConnecting(true);
    setWaError("");
    setWaPairingCode("");
    setWaTimer(120);

    const insforgeToken = await getValidToken();

    try {
      // ── 1. Check if already connected ──────────────────────────────────
      const statusRes = await fetch("/api/integrations/whatsapp/status", {
        headers: { "Authorization": `Bearer ${insforgeToken}` }
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status === "connected") {
          setDbData(prev => ({
            ...prev,
            whatsapp: {
              status: "connected",
              synced_count: 85,
              mode: statusData.mode || "production",
              phone: statusData.phone || phone,
              lastConnected: statusData.lastConnected || new Date().toISOString()
            }
          }));
          setWaConnectOpen(false);
          return;
        }
      }

      // ── 2. Single atomic call: init socket + get pairing code ──────────
      // The backend creates a fresh socket, waits for WS transport open,
      // then calls requestPairingCode() in the correct pre-auth window.
      const pairRes = await fetch("/api/integrations/whatsapp/pair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({ phoneNumber: phone })
      });

      const pairData = await pairRes.json();
      if (!pairRes.ok || pairData.error) {
        throw new Error(pairData.error || "Failed to generate pairing code.");
      }

      // Show the pairing code — SSE will also push status updates in background
      setWaPairingCode(pairData.pairingCode);

    } catch (err: any) {
      console.error("[WhatsApp Pairing Error]:", err);
      setWaError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setWaConnecting(false);
    }
  };

  const handleWaRefreshCode = async () => {
    setWaTimer(120);
    await handleWaGeneratePairingCode();
  };

  const handleConnectSandbox = async () => {
    setWaConnecting(true);
    setWaError("");
    const insforgeToken = await getValidToken();

    try {
      const response = await fetch("/api/integrations/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({
          mode: "sandbox",
          phoneNumber: waPhoneNumber || "+15550199"
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to connect in simulated mode");
      }

      setDbData(prev => ({
        ...prev,
        whatsapp: {
          status: "connected",
          synced_count: 85,
          mode: "sandbox",
          phone: waPhoneNumber || "+15550199",
          lastConnected: new Date().toISOString()
        }
      }));
      setWaConnectOpen(false);
      setActiveDialogPlatform(null);
      triggerToast("WhatsApp Connected");

    } catch (err: any) {
      console.error("[WhatsApp Sandbox Connect Error]:", err);
      setWaError(err.message || "An error occurred");
    } finally {
      setWaConnecting(false);
    }
  };

  const handleDisconnectWa = async () => {
    const insforgeToken = await getValidToken();
    try {
      const response = await fetch("/api/integrations/whatsapp/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        }
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to disconnect WhatsApp");
      }
      
      setDbData(prev => ({
        ...prev,
        whatsapp: {
          status: "disconnected",
          synced_count: 0
        }
      }));
    } catch (err: any) {
      console.error("[Disconnect Error]:", err);
      alert("Failed to disconnect WhatsApp: " + err.message);
    }
  };

  const handleReconnectWa = async () => {
    const currentPhone = dbData.whatsapp?.phone || waPhoneNumber;
    if (!currentPhone) {
      setWaConnectOpen(true);
      return;
    }
    const insforgeToken = await getValidToken();
    try {
      const response = await fetch("/api/integrations/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({
          mode: dbData.whatsapp?.mode || "production",
          phoneNumber: currentPhone
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to reconnect WhatsApp");
      }
      
      alert("Reconnection request sent successfully.");
    } catch (err: any) {
      console.error("[Reconnect Error]:", err);
      alert("Failed to reconnect WhatsApp: " + err.message);
    }
  };

  const fetchWaTools = async () => {
    setLoadingWaTools(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/integrations/whatsapp/tools", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWaTools(data);
      }
    } catch (e) {
      console.error("Failed to fetch WhatsApp tools:", e);
    } finally {
      setLoadingWaTools(false);
    }
  };

  const toggleWaTool = async (toolName: string, currentEnabled: boolean) => {
    if (!user) return;
    setWaTools(prev => prev.map(t => t.name === toolName ? { ...t, enabled: !currentEnabled } : t));
    
    try {
      const token = (insforge as any).tokenManager?.getAccessToken() || "";
      const { data: existing } = await insforge.database
        .from("user_integrations")
        .select("id, settings")
        .eq("user_id", user.id)
        .eq("platform_id", "whatsapp")
        .maybeSingle();

      const currentSettings = existing?.settings as Record<string, any> || {};
      const enabledTools = currentSettings.enabledTools || {};
      
      const newSettings = {
        ...currentSettings,
        enabledTools: {
          ...enabledTools,
          [toolName]: !currentEnabled
        }
      };

      if (existing) {
        await insforge.database
          .from("user_integrations")
          .update({ settings: newSettings })
          .eq("id", existing.id);
      } else {
        await insforge.database
          .from("user_integrations")
          .insert([{
            user_id: user.id,
            platform_id: "whatsapp",
            status: "disconnected",
            synced_count: 0,
            settings: newSettings
          }]);
      }
        
    } catch (e) {
      console.error("Failed to toggle tool:", e);
      setWaTools(prev => prev.map(t => t.name === toolName ? { ...t, enabled: currentEnabled } : t));
    }
  };

  const handleInputChange = (toolName: string, paramName: string, value: any) => {
    setToolInputs(prev => ({
      ...prev,
      [toolName]: {
        ...(prev[toolName] || {}),
        [paramName]: value
      }
    }));
  };

  const runDynamicWhatsAppTool = async (toolName: string, paramsList: any[]) => {
    setWaExecutingTool(toolName);
    const insforgeToken = await getValidToken();
    const inputs = toolInputs[toolName] || {};

    for (const p of paramsList) {
      if (p.required && (inputs[p.name] === undefined || inputs[p.name] === '')) {
        alert(`${p.label} is required.`);
        setWaExecutingTool(null);
        return;
      }
    }

    try {
      const response = await fetch("/api/integrations/whatsapp/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({
          toolName,
          params: inputs
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to execute tool");
      }

      setWaExecutionOutputs(prev => ({
        ...prev,
        [toolName]: data
      }));

      await fetchWaTools();

    } catch (err: any) {
      console.error("[Run Tool Error]:", err);
      alert("Execution failed: " + err.message);
    } finally {
      setWaExecutingTool(null);
    }
  };

  // Handle Google OAuth Callback code parsing
  useEffect(() => {
    if (!user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !exchangedCodes.has(code)) {
      exchangedCodes.add(code);
      handleExchangeOAuthCode(code);
    }
  }, [user]);

  const handleExchangeOAuthCode = async (code: string) => {
    setExchangingCode(true);
    const insforgeToken = await getValidToken();
    const redirectUri = window.location.origin + "/dashboard/integrations";

    try {
      const response = await fetch("/api/integrations/gmail/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({ code, redirectUri })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to exchange Google authorization code");
      }

      setDbData(prev => ({
        ...prev,
        gmail: {
          status: "connected",
          synced_count: data.mode === "sandbox" ? 1204 : 12,
          mode: data.mode
        }
      }));

      // Clean query parameters from URL
      window.history.replaceState(null, "", window.location.pathname);
    } catch (err: any) {
      console.error("[OAuth Exchange Error]:", err);
      alert("Google OAuth connection failed: " + err.message);
    } finally {
      setExchangingCode(false);
    }
  };

  // Connect platform action
  const handleConnect = async (platformId: string) => {
    if (!user) return;

    if (platformId === "gmail") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      const isPlaceholder = !clientId || clientId.startsWith("your-");

      if (isPlaceholder) {
        console.log("[Gmail OAuth] Google Client ID is placeholder. Falling back to Sandbox Mode.");
        // Call backend in sandbox connect mode
        handleExchangeOAuthCode("sandbox-code");
      } else {
        // Redirect to real Google OAuth screen
        const redirectUri = window.location.origin + "/dashboard/integrations";
        const scope = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose";
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent(scope)}&` +
          `access_type=offline&` +
          `prompt=consent`;

        window.location.href = oauthUrl;
      }
    } else if (platformId === "whatsapp") {
      // Find the platform object for whatsapp to get its details
      const whatsappPlatform = platforms.find(p => p.id === "whatsapp");
      if (whatsappPlatform) {
        setWaConnectOpen(true);
        setWaPhoneNumber("");
        setWaPairingCode("");
        setWaConnecting(false);
        setWaError("");
        setWaMode("production");
        setIsPollingWa(false);
      }
    } else {
      await toggleConnection(platformId);
    }
  };

  // Connect/Disconnect platform in Database (Non-Gmail platforms)
  const toggleConnection = async (platformId: string) => {
    if (!user) return;

    const isCurrentlyConnected = dbData[platformId]?.status === "connected";

    if (platformId === "whatsapp" && isCurrentlyConnected) {
      const insforgeToken = (insforge as any).tokenManager?.getAccessToken() || "";
      try {
        const response = await fetch("/api/integrations/whatsapp/disconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${insforgeToken}`
          }
        });
        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to disconnect WhatsApp");
        }

        setDbData(prev => ({
          ...prev,
          whatsapp: {
            status: "disconnected",
            synced_count: 0
          }
        }));
        setIsPollingWa(false);
      } catch (err: any) {
        console.error("Disconnect error:", err);
        alert("Failed to disconnect WhatsApp: " + err.message);
      }
      return;
    }

    const nextStatus = isCurrentlyConnected ? "disconnected" : "connected";
    const nextSyncedCount = isCurrentlyConnected ? 0 : Math.floor(Math.random() * 500) + 100;

    // Optimistic update
    setDbData(prev => ({
      ...prev,
      [platformId]: {
        status: nextStatus,
        synced_count: nextSyncedCount
      }
    }));

    try {
      // Find existing
      const { data: existing, error: selectError } = await insforge.database
        .from("user_integrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("platform_id", platformId)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        const { error: updateError } = await insforge.database
          .from("user_integrations")
          .update({
            status: nextStatus,
            synced_count: nextSyncedCount,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await insforge.database
          .from("user_integrations")
          .insert([{
            user_id: user.id,
            platform_id: platformId,
            status: nextStatus,
            synced_count: nextSyncedCount
          }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error("Failed to sync integration status to InsForge DB:", err);
      // Revert state
      setDbData(prev => ({
        ...prev,
        [platformId]: {
          status: isCurrentlyConnected ? "connected" : "disconnected",
          synced_count: isCurrentlyConnected ? dbData[platformId]?.synced_count : 0
        }
      }));
    }
  };

  // Dialog actions
  const openSettings = (platform: Platform) => {
    setActiveDialogPlatform(platform);
    setGmailMessages([]);
    setSelectedEmail(null);
    setReplyText("");
    setDraftSuccessMessage("");
    setRunningToolName(null);
    if (platform.id === "whatsapp") {
      fetchWaTools();
      setExpandedWaTool(null);
      setWaExecutionOutputs({});
      setToolInputs({});
    }
  };

  const closeSettings = () => {
    setActiveDialogPlatform(null);
  };

  // Run Gmail MCP tool list call
  const fetchRealGmailMessages = async () => {
    setRunningToolName("gmail_list_messages");
    const insforgeToken = await getValidToken();

    try {
      const response = await fetch("/api/integrations/gmail/messages", {
        headers: {
          "Authorization": `Bearer ${insforgeToken}`
        }
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to fetch Gmail messages");
      }

      setGmailMessages(data.messages);
      setConsoleLogs([`Fetched ${data.messages.length} messages from Gmail account in ${data.mode} mode.`]);
    } catch (err: any) {
      console.error("[Fetch Gmail Messages Error]:", err);
      alert("Failed to fetch Gmail messages: " + err.message);
    } finally {
      setRunningToolName(null);
    }
  };

  // Run Gmail MCP draft create call
  const createRealGmailDraft = async (to: string, subject: string, bodyText: string, threadId: string) => {
    setRunningToolName("gmail_create_draft");
    const insforgeToken = await getValidToken();

    try {
      const response = await fetch("/api/integrations/gmail/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${insforgeToken}`
        },
        body: JSON.stringify({ to, subject, body: bodyText, threadId })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create draft");
      }

      setDraftSuccessMessage(`Draft created successfully in Gmail inbox (Mode: ${data.mode.toUpperCase()})!`);
      setReplyText("");
      
      // Auto clear success alert after 5s
      setTimeout(() => setDraftSuccessMessage(""), 5000);
      
      // Refresh inbox list if not in sandbox to reflect synced count changes
      if (data.mode !== "sandbox") {
        fetchRealGmailMessages();
      }
    } catch (err: any) {
      console.error("[Create Gmail Draft Error]:", err);
      alert("Failed to create Gmail reply draft: " + err.message);
    } finally {
      setRunningToolName(null);
    }
  };

  if (loadingDb || exchangingCode) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
          {exchangingCode ? "CONNECTING TO GOOGLE MAIL..." : "LOADING INSFORGE CHANNELS..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-md">
            <HugeiconsIcon icon={Layers01Icon} size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary">Integrations Portal</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">SECURE AGENT PIPELINES MANAGER</p>
          </div>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const isConnected = dbData[platform.id]?.status === "connected";
          const syncedCount = dbData[platform.id]?.synced_count || 0;
          const isRealGmail = platform.id === "gmail" && dbData[platform.id]?.mode === "production";

          return (
            <div
              key={platform.id}
              className={`glassmorphism rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between min-h-[300px] hover:scale-[1.02] ${
                isConnected 
                  ? "border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.08)] bg-zinc-50 dark:bg-zinc-950/20" 
                  : "border-card-border hover:border-zinc-300 dark:hover:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/5"
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-card-border flex items-center justify-center shadow-lg">
                    {platform.logo}
                  </div>
                  
                  {/* Connected Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      isConnected
                        ? "bg-green-100/50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/40 text-zinc-500 border border-card-border"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-zinc-650"}`} />
                    {isConnected ? (isRealGmail ? "CONNECTED (REAL)" : "CONNECTED") : "DISCONNECTED"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-text-primary mb-2">{platform.name}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {platform.description}
                </p>
              </div>

              {/* Sync status / Security info */}
              <div className="my-4 bg-zinc-100/40 dark:bg-zinc-950/40 border border-card-border rounded-xl p-3.5 flex items-center justify-between text-xs font-mono">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <HugeiconsIcon icon={ArrowUpDownIcon} size={12} className="text-blue-500" />
                      <span>Synced Events:</span>
                    </div>
                    <span className="text-text-primary font-bold">{syncedCount.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Database link:</span>
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-500">Encrypted</span>
                  </>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isConnected) {
                      toggleConnection(platform.id);
                    } else {
                      handleConnect(platform.id);
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    isConnected
                      ? "bg-zinc-200/60 dark:bg-zinc-900/60 hover:bg-zinc-300/60 dark:hover:bg-zinc-900 border border-card-border text-zinc-700 dark:text-zinc-400 hover:text-text-primary"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-650 text-white shadow-lg shadow-blue-950/10"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>

                {isConnected && (
                  <button
                    onClick={() => openSettings(platform)}
                    className="p-3 rounded-xl border border-card-border hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-150 dark:hover:bg-zinc-900 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-550 dark:text-zinc-400 hover:text-text-primary transition-all cursor-pointer flex items-center justify-center"
                    title="Platform MCP Settings"
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings Dialog Overlay */}
      {activeDialogPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-xl max-h-[80vh] bg-card-bg border border-card-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="border-b border-card-border p-6 flex justify-between items-center bg-zinc-100/10 dark:bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-card-border flex items-center justify-center shadow-sm">
                  {activeDialogPlatform.logo}
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <span>{activeDialogPlatform.name} MCP Settings</span>
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    mcp-server: <span className="text-blue-500 font-bold">{activeDialogPlatform.mcpServerName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeSettings}
                className="p-2 text-zinc-500 hover:text-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-card-border rounded-xl transition-all cursor-pointer text-xs font-bold font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Dialog Content: SHOW ONLY MCP TOOLS (simplified list) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Sandbox info disclaimer for Gmail */}
              {activeDialogPlatform.id === "gmail" && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/25 rounded-2xl text-blue-800 dark:text-blue-400 text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Aura Sandbox Connection Active</span>
                    Gmail Google Client IDs are not yet configured in <code className="font-mono bg-blue-100 dark:bg-blue-950 px-1 py-0.5 rounded text-[10px]">.env.local</code>. Running securely inside the Next-Gen sandboxed simulator.
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <HugeiconsIcon icon={CodeIcon} size={14} className="text-blue-500" />
                  <span>Available MCP Tools ({activeDialogPlatform.mcpTools.length})</span>
                </h4>
              </div>

              {activeDialogPlatform.id === "whatsapp" ? (
                <div className="space-y-6">
                  {/* Categories Horizontal Scroll Bar */}
                  <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-thin border-b border-card-border/60">
                    {["Messaging", "Contacts", "Groups", "Analytics", "Media", "Status", "Profile", "System"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveWaCategory(cat);
                          setExpandedWaTool(null);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all flex-shrink-0 cursor-pointer ${
                          activeWaCategory === cat
                            ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                            : "bg-zinc-150 dark:bg-zinc-900 border border-card-border text-zinc-500 hover:text-text-primary"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {loadingWaTools ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-[10px] text-zinc-550 font-mono">LOADING CAPABILITIES REGISTRY...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {waTools.filter(t => t.category === activeWaCategory).map((tool) => {
                        const isExpanded = expandedWaTool === tool.name;
                        const hasOutput = waExecutionOutputs[tool.name] !== undefined;

                        return (
                          <div 
                            key={tool.name}
                            className="p-5 bg-zinc-100/50 dark:bg-zinc-900/30 border border-card-border rounded-3xl space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors animate-fadeIn"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-blue-500 dark:text-blue-400 font-mono">{tool.name}</span>
                                </div>
                                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed pr-6">{tool.description}</p>
                              </div>

                              {/* Toggle Switch */}
                              <div className="flex items-center gap-3.5 flex-shrink-0">
                                <label className="relative inline-flex items-center cursor-pointer" title={tool.enabled ? "Disable tool" : "Enable tool"}>
                                  <input 
                                    type="checkbox" 
                                    checked={tool.enabled} 
                                    onChange={() => toggleWaTool(tool.name, tool.enabled)}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </div>

                            {/* Metadata & Execution logs */}
                            <div className="flex items-center justify-between text-[9px] font-mono border-t border-card-border/60 pt-2.5">
                              <span className="text-zinc-550">
                                Last Run: <span className="font-bold text-text-primary">
                                  {tool.lastExecuted 
                                    ? new Date(tool.lastExecuted).toLocaleString() 
                                    : "Never"}
                                </span>
                              </span>
                              
                              <button
                                onClick={() => setExpandedWaTool(isExpanded ? null : tool.name)}
                                className={`py-1 px-3 border rounded-xl text-[9px] font-extrabold transition-all cursor-pointer ${
                                  isExpanded 
                                    ? "bg-zinc-200 dark:bg-zinc-900 border-zinc-400 text-text-primary" 
                                    : "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {isExpanded ? "Hide Test Panel" : "Test Run"}
                              </button>
                            </div>

                            {/* Expanded Test Form */}
                            {isExpanded && (
                              <div className="p-4 bg-zinc-50 dark:bg-black/40 border border-card-border rounded-2xl space-y-3.5 animate-fadeIn">
                                <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-mono">
                                  Run Parameters
                                </div>
                                {tool.params.length === 0 ? (
                                  <div className="text-xs text-zinc-500 italic font-mono">No input parameters required for this tool.</div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3">
                                    {tool.params.map((p: any) => {
                                      const val = toolInputs[tool.name]?.[p.name] || '';
                                      return (
                                        <div key={p.name} className="space-y-1">
                                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                                            {p.label} {p.required && <span className="text-red-500">*</span>}
                                          </label>
                                          {p.type === 'textarea' ? (
                                            <textarea
                                              value={val}
                                              onChange={(e) => handleInputChange(tool.name, p.name, e.target.value)}
                                              placeholder={p.placeholder || `Enter ${p.label.toLowerCase()}...`}
                                              className="w-full h-16 p-2.5 bg-zinc-100 dark:bg-black border border-card-border rounded-xl text-xs text-text-primary focus:border-blue-500 outline-none resize-none font-mono"
                                            />
                                          ) : p.type === 'boolean' ? (
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={!!val}
                                                onChange={(e) => handleInputChange(tool.name, p.name, e.target.checked)}
                                                className="w-4 h-4 bg-zinc-150 border border-card-border rounded"
                                              />
                                              <span className="text-xs text-zinc-500">Toggle True/False</span>
                                            </div>
                                          ) : (
                                            <input
                                              type={p.type === 'number' ? 'number' : 'text'}
                                              value={val}
                                              onChange={(e) => handleInputChange(tool.name, p.name, p.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                              placeholder={p.placeholder || `Enter ${p.label.toLowerCase()}...`}
                                              className="w-full p-2.5 bg-zinc-100 dark:bg-black border border-card-border rounded-xl text-xs text-text-primary focus:border-blue-500 outline-none font-mono"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="flex justify-end gap-1.5 pt-2 border-t border-card-border/60">
                                  <button
                                    onClick={() => setExpandedWaTool(null)}
                                    className="px-3 py-1.5 border border-card-border hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-650 dark:text-zinc-400 hover:text-text-primary rounded-xl text-[9px] font-extrabold transition-all cursor-pointer font-mono"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => runDynamicWhatsAppTool(tool.name, tool.params)}
                                    disabled={waExecutingTool !== null}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-[9px] font-extrabold transition-all cursor-pointer font-mono"
                                  >
                                    {waExecutingTool === tool.name ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Send className="w-3.5 h-3.5" />
                                    )}
                                    <span>Run Execution</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Tool Execution Dynamic Output Panel */}
                            {hasOutput && (
                              <div className="mt-4 pt-3.5 border-t border-card-border/60 space-y-3.5 animate-fadeIn">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider">
                                    Execution Result Output log
                                  </span>
                                  <button
                                    onClick={() => setWaExecutionOutputs(prev => {
                                      const next = { ...prev };
                                      delete next[tool.name];
                                      return next;
                                    })}
                                    className="text-[9px] text-zinc-500 hover:text-text-primary font-mono cursor-pointer"
                                  >
                                    Clear Log
                                  </button>
                                </div>
                                <div className="bg-zinc-50 dark:bg-black/40 border border-card-border rounded-2xl p-4 overflow-x-auto max-h-[300px] text-xs font-mono select-text leading-relaxed">
                                  <pre className="text-zinc-650 dark:text-zinc-400 whitespace-pre-wrap">{JSON.stringify(waExecutionOutputs[tool.name], null, 2)}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDialogPlatform.mcpTools.map((tool) => {
                    const isListTool = tool.name === "gmail_list_messages";
                    const isDraftTool = tool.name === "gmail_create_draft";
                    const isRunAvailable = activeDialogPlatform.id === "gmail";

                    return (
                      <div 
                        key={tool.name} 
                        className="p-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-card-border rounded-2xl space-y-2 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-blue-500 dark:text-blue-400 font-mono">{tool.name}</span>
                          {isRunAvailable && isListTool && gmailMessages.length === 0 && (
                            <button
                              onClick={fetchRealGmailMessages}
                              disabled={runningToolName !== null}
                              className="text-[10px] font-bold font-mono px-3 py-1 rounded-lg border border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {runningToolName === tool.name ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              <span>Run Tool</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">{tool.description}</p>
                        
                        {/* JSON Schema */}
                        <div className="pt-2 border-t border-card-border/60">
                          <span className="text-[10px] text-zinc-500 font-mono block">SCHEMA: {tool.params}</span>
                        </div>

                        {/* Tool run outputs rendered inline under the tool! */}
                        {isListTool && gmailMessages.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-card-border space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Tool Output (Inbox messages)</span>
                            <button
                              onClick={() => setGmailMessages([])}
                              className="text-[10px] text-zinc-500 hover:text-text-primary font-mono cursor-pointer"
                            >
                              Hide
                            </button>
                          </div>

                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {gmailMessages.map((email) => (
                              <div 
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
                                className={`p-3 border rounded-xl transition-all cursor-pointer flex justify-between items-start gap-4 ${
                                  selectedEmail?.id === email.id 
                                    ? "bg-blue-500/5 border-blue-500/40" 
                                    : "bg-zinc-100 dark:bg-black/40 border-card-border hover:border-zinc-400 dark:hover:border-zinc-700"
                                }`}
                              >
                                <div className="space-y-0.5 truncate flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-text-primary truncate">{email.senderName}</span>
                                    <span className="text-[9px] text-zinc-500 font-mono truncate">{email.senderEmail}</span>
                                  </div>
                                  <div className="text-xs font-semibold text-blue-500 dark:text-blue-400 truncate">{email.subject}</div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">{email.snippet}</div>
                                </div>
                                <span className="text-[9px] text-zinc-500 font-mono flex-shrink-0 whitespace-nowrap">{email.date.split(" ")[2]}</span>
                              </div>
                            ))}
                          </div>

                          {/* Render selected message inline next to it */}
                          {selectedEmail && (
                            <div className="p-4 bg-zinc-50 dark:bg-black/60 border border-card-border rounded-xl space-y-3 animate-fadeIn">
                              <div className="flex justify-between items-center pb-1.5 border-b border-card-border/60">
                                <span className="text-[10px] text-zinc-500 font-mono">{selectedEmail.date}</span>
                                <button 
                                  onClick={() => {
                                    setSelectedEmail(null);
                                    setReplyText("");
                                  }}
                                  className="text-[10px] text-zinc-500 hover:text-text-primary cursor-pointer font-mono"
                                >
                                  ✕ Close Email
                                </button>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-text-primary font-bold">{selectedEmail.subject}</div>
                                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 font-mono whitespace-pre-line leading-relaxed">
                                  {selectedEmail.body}
                                </p>
                              </div>

                              {/* Compose reply under the email details */}
                              <div className="space-y-2 pt-2 border-t border-card-border/60">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type reply draft content..."
                                  className="w-full h-16 p-2 bg-zinc-100 dark:bg-black border border-card-border rounded-lg text-xs text-text-primary placeholder-zinc-500 focus:border-blue-500/50 outline-none resize-none font-mono"
                                />
                                {draftSuccessMessage && (
                                  <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/25 rounded-lg text-green-700 dark:text-green-400 text-[10px] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    <span>{draftSuccessMessage}</span>
                                  </div>
                                )}
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedEmail(null);
                                      setReplyText("");
                                    }}
                                    className="px-3 py-1.5 border border-card-border hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-text-primary rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => createRealGmailDraft(selectedEmail.senderEmail, `Re: ${selectedEmail.subject}`, replyText, selectedEmail.id)}
                                    disabled={!replyText.trim() || runningToolName !== null}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    {runningToolName === "gmail_create_draft" ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    <span>Run gmail_create_draft</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Connection Dialog Overlay */}
      {waConnectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-card-border p-6 flex justify-between items-center bg-zinc-100/10 dark:bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-card-border flex items-center justify-center shadow-sm">
                  <WhatsAppIcon />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Connect WhatsApp Account</h2>
                  <p className="text-[10px] text-zinc-500 font-mono">LINK DEVICE VIA PAIRING CODE</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setWaConnectOpen(false);
                  setIsPollingWa(false);
                }}
                className="p-2 text-zinc-500 hover:text-text-primary font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Form / Linking Code display */}
            <div className="p-6 space-y-4">
              {waError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/25 rounded-2xl text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{waError}</span>
                </div>
              )}

              {!waPairingCode ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleWaGeneratePairingCode();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-sans">
                      To connect your personal WhatsApp account, enter your phone number starting with your country code (e.g., <span className="font-mono font-bold text-blue-500">+15550199</span>).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="wa-phone" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">Phone Number</label>
                    <input
                      id="wa-phone"
                      type="text"
                      placeholder="e.g. +15550199"
                      value={waPhoneNumber}
                      onChange={(e) => setWaPhoneNumber(e.target.value)}
                      className="w-full p-3 bg-zinc-100 dark:bg-black border border-card-border rounded-xl text-xs text-text-primary focus:border-blue-500 outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={waConnecting}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-650 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {waConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Linking Code...</span>
                      </>
                    ) : (
                      <span>Generate Linking Code</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleConnectSandbox}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border border-card-border text-zinc-500 hover:bg-zinc-200/50 hover:text-text-primary flex items-center justify-center gap-2"
                  >
                    Connect in Simulated Mode
                  </button>
                </form>
              ) : (
                <div className="space-y-5 text-center animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono block">Linking Code</span>
                    <div className="flex justify-center gap-1.5 font-mono font-extrabold text-2xl text-blue-500 tracking-widest bg-zinc-100/50 dark:bg-zinc-900/30 p-4 border border-card-border rounded-2xl select-all">
                      {waPairingCode.split("").map((char, index) => (
                        <span key={index} className={index === 4 ? "mx-2 text-zinc-400" : ""}>{char}</span>
                      ))}
                    </div>

                    {/* Expiry countdown */}
                    <div className="text-[10px] text-zinc-500 font-mono mt-2">
                      {waTimer > 0 ? (
                        <>
                          Expires in: <span className="font-bold text-blue-500">{Math.floor(waTimer / 60)}:{(waTimer % 60).toString().padStart(2, '0')}</span>
                        </>
                      ) : (
                        <span className="text-red-500 font-bold">Pairing code expired</span>
                      )}
                    </div>
                  </div>

                  <div className="text-left bg-zinc-100/40 dark:bg-zinc-950/40 border border-card-border p-4 rounded-2xl space-y-2.5 text-xs text-zinc-500 font-sans">
                    <div className="font-bold text-text-primary">How to link:</div>
                    <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] leading-relaxed">
                      <li>Open <span className="font-bold">WhatsApp</span> on your phone.</li>
                      <li>Tap <span className="font-bold">Settings</span> → <span className="font-bold">Linked Devices</span>.</li>
                      <li>Tap <span className="font-bold">Link a Device</span>.</li>
                      <li>Select <span className="font-bold">Link with phone number instead</span>.</li>
                      <li>Enter the 8-character code shown above.</li>
                    </ol>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleWaRefreshCode}
                      className="py-2 px-3 border border-card-border rounded-xl text-xs font-bold font-mono text-zinc-550 hover:bg-zinc-200/50 hover:text-text-primary flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Code</span>
                    </button>
                    <button
                      onClick={() => {
                        setWaPairingCode("");
                        setIsPollingWa(false);
                      }}
                      className="py-2 px-3 border border-card-border rounded-xl text-xs font-bold font-mono text-zinc-550 hover:bg-zinc-200/50 hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-550">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>Waiting for device connection...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none">
          <div className="pointer-events-auto bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/20 border border-emerald-400/20 flex items-center justify-between gap-3 animate-toast-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-extrabold text-emerald-100/90 font-mono tracking-widest leading-none mb-1">Success</span>
                <span className="text-xs text-white font-bold leading-normal">{toast.message}</span>
              </div>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-xs font-mono font-bold leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
