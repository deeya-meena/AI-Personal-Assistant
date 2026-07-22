"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  BookOpen01Icon, 
  ArrowLeft01Icon, 
  StarIcon, 
  Mail01Icon, 
  Message01Icon, 
  Calendar03Icon
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../../context/AuthContext";
import { insforge } from "../../../../lib/insforge";
import { 
  Loader2, 
  Sparkles, 
  Send, 
  ArrowLeft,
  X,
  MessageSquare,
  AlertCircle,
  FileText,
  User,
  CheckCircle2
} from "lucide-react";

const getValidToken = async (): Promise<string> => {
  let token = (insforge as unknown as { tokenManager?: { getAccessToken: () => string } }).tokenManager?.getAccessToken() || "";
  if (!token) return "";
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp * 1000 < Date.now() + 10000; // 10s buffer
      if (isExpired) {
        console.log("[Details] Access token expired, refreshing session...");
        const { data, error } = await insforge.auth.refreshSession();
        if (!error && data?.accessToken) {
          token = data.accessToken;
        } else {
          console.error("[Details] Failed to refresh session:", error);
        }
      }
    }
  } catch (err) {
    console.error("[Details] Error parsing/refreshing token:", err);
  }
  return token;
};

// Platform vector SVGs
const GmailIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#F87171" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12.004 2C6.48 2 2 6.48 2 12C2 13.91 2.54 15.7 3.48 17.22L2 22L6.92 20.6C8.38 21.5 10.14 22 12.004 22C17.528 22 22 17.52 22 12C22 6.48 17.52 2 12.004 2ZM17.184 15.65C16.964 16.27 16.084 16.76 15.424 16.9C14.974 17 14.394 17.09 12.424 16.27C9.904 15.22 8.274 12.66 8.154 12.5C8.034 12.34 7.154 11.17 7.154 9.96C7.154 8.75 7.774 8.16 8.024 7.9C8.214 7.71 8.524 7.63 8.824 7.63C8.924 7.63 9.024 7.64 9.114 7.64C9.384 7.65 9.524 7.67 9.704 8.1C9.934 8.65 10.494 10.01 10.564 10.15C10.634 10.29 10.704 10.48 10.614 10.67C10.524 10.86 10.454 10.95 10.314 11.11C10.174 11.27 10.044 11.4 9.904 11.57C9.774 11.72 9.624 11.89 9.794 12.18C9.964 12.47 10.554 13.43 11.424 14.21C12.554 15.22 13.484 15.54 13.804 15.67C14.044 15.77 14.324 15.75 14.504 15.56C14.734 15.31 15.024 14.91 15.314 14.5C15.524 14.21 15.774 14.17 16.034 14.27C16.304 14.37 17.704 15.06 17.994 15.21C18.284 15.36 18.474 15.44 18.544 15.57C18.614 15.7 18.614 16.34 16.394 16.97C16.394 16.97 17.184 15.65 17.184 15.65Z" fill="#34D399" />
  </svg>
);

const PlatformIcon = ({ source }: { source: string }) => {
  if (source === "gmail") return <GmailIcon />;
  if (source === "whatsapp") return <WhatsAppIcon />;
  return (
    <div className="w-6 h-6 rounded-lg bg-muted border border-card-border flex items-center justify-center text-[10px] font-bold text-cyan-600 dark:text-cyan-400 capitalize shadow-sm">
      {source[0]}
    </div>
  );
};

interface BriefItem {
  id: string;
  source: string;
  title: string;
  sender: string;
  summary: string;
  content: string;
  time: string;
  priority: "high" | "medium" | "low";
  recipientJid?: string;
  chatId?: string;
  phoneNumber?: string;
}

export default function BriefingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Params
  const category = searchParams.get("category");
  const briefingId = searchParams.get("briefingId");

  // States
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Briefing Details");
  const [subtitle, setSubtitle] = useState("AI DIGEST FEED");
  const [items, setItems] = useState<BriefItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BriefItem | null>(null);

  // Form Composer States
  const [replyMessage, setReplyMessage] = useState("");
  const [customDraftPrompt, setCustomDraftPrompt] = useState("");
  const [draftingAI, setDraftingAI] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        if (!user) return;
        
        const token = await getValidToken();
        if (!token) return;

        if (category) {
          // Fetch default daily briefing
          const res = await fetch("/api/dashboard/brief", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const catInfo = data.categories?.[category] || { count: 0, items: [] };
            setItems(catInfo.items || []);
            setSelectedItem(catInfo.items?.[0] || null);

            // Set titles
            const labelMap: Record<string, string> = {
              email: "Email Updates",
              messages: "Message Digest",
              mentions: "Mentions & Activities",
              tasks: "Workspace Tasks",
              follow_ups: "Pending Follow-ups"
            };
            setTitle(labelMap[category] || "Briefing Details");
            setSubtitle(`DAILY SYNTHESIS FEED • ${catInfo.count} ITEMS`);
          }
        } else if (briefingId) {
          // Fetch custom briefing run
          const res = await fetch(`/api/dashboard/briefing/runs?id=${briefingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const run = await res.json();
            setTitle(run.name);
            setSubtitle(`CUSTOM RUN GENERATED ON ${new Date(run.created_at).toLocaleDateString()}`);

            // Flatten all items across all categories for the custom briefing
            const allItems: BriefItem[] = [];
            if (run.content && run.content.categories) {
              Object.keys(run.content.categories).forEach((catKey) => {
                const catData = run.content.categories[catKey];
                if (catData.items) {
                  allItems.push(...catData.items);
                }
              });
            }
            setItems(allItems);
            setSelectedItem(allItems[0] || null);
          }
        }
      } catch (err) {
        console.error("Failed to load briefing details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [user, category, briefingId]);

  // Handle AI Response Draft
  const handleAutoDraft = async () => {
    if (!selectedItem) return;
    setDraftingAI(true);
    setSuccessStatus(null);
    setErrorStatus(null);

    try {
      const token = await getValidToken();
      if (!token) return;

      const res = await fetch("/api/dashboard/briefing/compose", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemContext: selectedItem,
          prompt: customDraftPrompt
        })
      });

      const data = await res.json();
      if (res.ok && data.draft) {
        setReplyMessage(data.draft);
        setSuccessStatus("AI draft generated successfully!");
      } else {
        setErrorStatus(data.error || "Failed to generate AI draft.");
      }
    } catch (err) {
      console.error("AI Draft Error:", err);
      setErrorStatus("A network error occurred. Please try again.");
    } finally {
      setDraftingAI(false);
    }
  };

  // Dispatch reply response
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !replyMessage) return;
    setSendingReply(true);
    setSuccessStatus(null);
    setErrorStatus(null);

    try {
      const token = await getValidToken();
      if (!token) return;

      // Extract raw email address if gmail to avoid sending names
      let toRecipient = selectedItem.recipientJid || selectedItem.sender;
      if (selectedItem.source === "gmail") {
        const match = selectedItem.sender.match(/<(.+?)>/);
        if (match && match[1]) {
          toRecipient = match[1];
        }
      }

      const res = await fetch("/api/integrations/send-reply", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platformId: selectedItem.source,
          to: toRecipient,
          subject: selectedItem.source === "gmail" ? `Re: ${selectedItem.title}` : undefined,
          message: replyMessage,
          threadId: selectedItem.id,
          recipientJid: selectedItem.recipientJid,
          chatId: selectedItem.chatId,
          phoneNumber: selectedItem.phoneNumber
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessStatus(`Reply successfully sent via ${selectedItem.source}!`);
        setReplyMessage("");
        setCustomDraftPrompt("");
      } else {
        setErrorStatus(data.error || "Failed to dispatch reply.");
      }
    } catch (err) {
      console.error("Send Reply Error:", err);
      setErrorStatus("A network error occurred while sending.");
    } finally {
      setSendingReply(false);
    }
  };

  // Helper labels for action inputs
  const getActionLabel = (source: string) => {
    if (source === "gmail" || source === "outlook") return "Compose Email Response";
    if (source === "whatsapp" || source === "slack" || source === "discord" || source === "telegram") return "Send Chat Message";
    return "Post Update Comment";
  };

  const getButtonLabel = (source: string) => {
    if (source === "gmail" || source === "outlook") return "Send Email";
    if (source === "whatsapp" || source === "slack" || source === "discord" || source === "telegram") return "Send Message";
    return "Submit Comment";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-secondary">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
        <p className="text-sm font-mono tracking-widest">LOADING BRIEFING UPDATES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      {/* Navigation & Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-card-border">
        <button
          onClick={() => router.push("/dashboard/briefing")}
          className="p-2 text-text-secondary hover:text-text-primary rounded-xl border border-card-border hover:bg-muted transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">{title}</h1>
          <p className="text-xs text-text-secondary font-mono uppercase">{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card/50 border border-card-border border-dashed rounded-3xl p-12 text-center text-text-secondary flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <HugeiconsIcon icon={BookOpen01Icon} className="text-text-secondary w-12 h-12 mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">No Items Found</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1 leading-normal">
            There are no briefing events listed under this category or custom report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Master List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {items.map((item) => {
              const isActive = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setReplyMessage("");
                    setCustomDraftPrompt("");
                    setSuccessStatus(null);
                    setErrorStatus(null);
                  }}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer text-left shadow-sm ${
                    isActive
                      ? "bg-muted border-cyan-500/50"
                      : "bg-card border-card-border hover:bg-muted/50 hover:border-card-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon source={item.source} />
                      <span className="text-[11px] font-semibold text-text-secondary capitalize">{item.source}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                        item.priority === "high"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : item.priority === "medium"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-muted text-text-secondary border border-card-border"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-text-primary mt-3 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary mt-3 pt-2 border-t border-card-border">
                    <span>{item.sender.split("<")[0].trim()}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Composer Pane (Right 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {selectedItem ? (
              <div className="glassmorphism rounded-2xl p-6 border border-card-border space-y-6 shadow-sm">
                
                {/* Meta details */}
                <div className="flex items-center justify-between pb-4 border-b border-card-border">
                  <div className="flex items-center gap-2">
                    <PlatformIcon source={selectedItem.source} />
                    <div>
                      <span className="text-xs font-semibold text-text-primary capitalize">{selectedItem.source} Feed</span>
                      <span className="text-[10px] text-text-secondary block font-mono mt-[-2px]">{selectedItem.time}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                      selectedItem.priority === "high"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : selectedItem.priority === "medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-muted text-text-secondary border border-card-border"
                    }`}
                  >
                    {selectedItem.priority} priority
                  </span>
                </div>

                {/* Sender & Title */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">Sender</h4>
                    <p className="text-xs font-medium text-text-primary break-all bg-muted p-2.5 rounded-xl border border-card-border mt-1">
                      {selectedItem.sender}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">Topic</h4>
                    <p className="text-sm font-bold text-text-primary mt-1 leading-snug">{selectedItem.title}</p>
                  </div>
                </div>

                {/* Full Context */}
                <div className="pt-2">
                  <h4 className="text-[10px] font-mono text-text-secondary uppercase tracking-wider mb-1.5">Aura Smart Digest Content</h4>
                  <div className="text-xs text-text-primary leading-relaxed bg-muted/60 border border-card-border rounded-xl p-4 whitespace-pre-line max-h-[18vh] overflow-y-auto">
                    {selectedItem.content || selectedItem.summary}
                  </div>
                </div>

                {/* Composer Form */}
                <div className="pt-4 border-t border-card-border space-y-4">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{getActionLabel(selectedItem.source)}</span>
                  </h4>

                  {/* AI Drafting Prompt Assist */}
                  <div className="bg-muted/40 border border-card-border rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
                      <span>Add instructions for the AI composer (optional):</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Be extremely polite, schedule meeting for Friday afternoon"
                        value={customDraftPrompt}
                        onChange={(e) => setCustomDraftPrompt(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-card-border text-xs text-text-primary outline-none focus:border-cyan-500/50 placeholder-text-secondary shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAutoDraft}
                        disabled={draftingAI}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        {draftingAI ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Draft</span>
                      </button>
                    </div>
                  </div>

                  {/* Reply text entry */}
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <textarea
                      required
                      placeholder="Write your response message here..."
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-card-border focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none text-xs text-text-primary placeholder-text-secondary resize-none leading-relaxed shadow-sm"
                    />

                    {/* Notifications */}
                    {successStatus && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{successStatus}</span>
                      </div>
                    )}
                    {errorStatus && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorStatus}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={sendingReply || !replyMessage.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {sendingReply ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{getButtonLabel(selectedItem.source)}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-card/50 border border-card-border border-dashed rounded-2xl p-8 text-center text-text-secondary flex flex-col items-center justify-center h-64 shadow-sm">
                <HugeiconsIcon icon={BookOpen01Icon} size={28} className="text-text-secondary mb-2" />
                <p className="text-xs">Select an item on the left to read full details and send responses.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
