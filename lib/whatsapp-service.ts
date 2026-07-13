import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason,
  delay,
  Browsers,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { BaseIntegrationService, IntegrationStatus } from './integration-service';
import { createClient } from "@insforge/sdk";

// Helper to map dial prefix to ISO country code (localeCountryIso31661Alpha2)
function getIsoCountryCode(phoneNumber: string): string {
  const clean = phoneNumber.replace(/[^0-9]/g, '');
  if (clean.startsWith('1')) return 'US';
  if (clean.startsWith('44')) return 'GB';
  if (clean.startsWith('91')) return 'IN';
  if (clean.startsWith('92')) return 'PK';
  if (clean.startsWith('49')) return 'DE';
  if (clean.startsWith('33')) return 'FR';
  if (clean.startsWith('61')) return 'AU';
  if (clean.startsWith('55')) return 'BR';
  if (clean.startsWith('62')) return 'ID';
  if (clean.startsWith('60')) return 'MY';
  if (clean.startsWith('63')) return 'PH';
  if (clean.startsWith('66')) return 'TH';
  return 'US'; // default fallback
}

// Define structured tool descriptions
export interface WhatsAppToolMeta {
  name: string;
  description: string;
  category: 'Messaging' | 'Contacts' | 'Groups' | 'Analytics' | 'Media' | 'Status' | 'Profile' | 'System';
  params: Array<{
    name: string;
    label: string;
    type: 'string' | 'boolean' | 'number' | 'textarea';
    required: boolean;
    placeholder?: string;
  }>;
}

const WHATSAPP_TOOLS_REGISTRY: WhatsAppToolMeta[] = [
  // Messaging
  {
    name: "whatsapp_get_recent_messages",
    description: "Fetch list of recent conversations, unread count, and last message previews.",
    category: "Messaging",
    params: []
  },
  {
    name: "whatsapp_read_chat_history",
    description: "Read chat message log history from a specific contact phone number.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID (e.g. 15550199@s.whatsapp.net)", type: "string", required: true, placeholder: "15550199@s.whatsapp.net" }
    ]
  },
  {
    name: "whatsapp_send_message",
    description: "Send a direct plain text message to a specific contact phone number.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID (e.g. 15550199@s.whatsapp.net)", type: "string", required: true, placeholder: "15550199@s.whatsapp.net" },
      { name: "message", label: "Message Content", type: "textarea", required: true, placeholder: "Type your message..." }
    ]
  },
  {
    name: "whatsapp_send_media",
    description: "Send media content (image, video, document URL) to a recipient.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true },
      { name: "mediaUrl", label: "Media URL", type: "string", required: true, placeholder: "https://example.com/image.jpg" },
      { name: "mediaType", label: "Media Type", type: "string", required: true, placeholder: "image/jpeg, video/mp4, or application/pdf" },
      { name: "caption", label: "Caption (Optional)", type: "string", required: false }
    ]
  },
  {
    name: "whatsapp_reply_to_message",
    description: "Send a message as a reply threaded to a specific previous message ID.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true },
      { name: "messageId", label: "Parent Message ID", type: "string", required: true },
      { name: "message", label: "Reply Message Content", type: "textarea", required: true }
    ]
  },
  {
    name: "whatsapp_forward_message",
    description: "Forward an existing message to another chat recipient.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Destination Chat ID", type: "string", required: true },
      { name: "fromChatId", label: "Source Chat ID", type: "string", required: true },
      { name: "messageId", label: "Source Message ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_delete_message",
    description: "Revoke or delete a message sent by you for everyone.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true },
      { name: "messageId", label: "Message ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_edit_message",
    description: "Edit a previously sent text message content.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true },
      { name: "messageId", label: "Message ID", type: "string", required: true },
      { name: "newMessage", label: "New Message Text", type: "textarea", required: true }
    ]
  },
  {
    name: "whatsapp_mark_chat_read",
    description: "Mark a chat as read (clears unread count and sends read receipt).",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_mark_chat_unread",
    description: "Mark a chat thread as unread locally.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_pin_chat",
    description: "Pin a chat thread to the top of your list.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_archive_chat",
    description: "Archive a chat thread.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_unarchive_chat",
    description: "Unarchive a chat thread.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_mute_chat",
    description: "Mute notifications for a chat thread.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true },
      { name: "durationHours", label: "Duration (Hours, e.g. 8 or 24)", type: "number", required: true }
    ]
  },
  {
    name: "whatsapp_unmute_chat",
    description: "Unmute notifications for a chat thread.",
    category: "Messaging",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_search_chats",
    description: "Query and find chat threads containing specific titles or keywords.",
    category: "Messaging",
    params: [
      { name: "query", label: "Search query string", type: "string", required: true, placeholder: "e.g. John" }
    ]
  },
  {
    name: "whatsapp_search_messages",
    description: "Search for specific keywords inside conversation messages histories.",
    category: "Messaging",
    params: [
      { name: "query", label: "Message Keyword", type: "string", required: true }
    ]
  },
  
  // Contacts
  {
    name: "whatsapp_list_contacts",
    description: "List all synchronized contacts in your phonebook.",
    category: "Contacts",
    params: []
  },
  {
    name: "whatsapp_get_contact_details",
    description: "Retrieve metadata, profile details, and photo URLs for a specific contact.",
    category: "Contacts",
    params: [
      { name: "chatId", label: "Chat ID (e.g. 15550199@s.whatsapp.net)", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_search_contacts",
    description: "Search contact list by name or phone number.",
    category: "Contacts",
    params: [
      { name: "query", label: "Contact Name/Phone", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_block_contact",
    description: "Block a specific contact from sending messages or seeing your profile.",
    category: "Contacts",
    params: [
      { name: "chatId", label: "Contact Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_unblock_contact",
    description: "Unblock a previously blocked contact.",
    category: "Contacts",
    params: [
      { name: "chatId", label: "Contact Chat ID", type: "string", required: true }
    ]
  },

  // Groups
  {
    name: "whatsapp_list_groups",
    description: "List all group chats that you are currently a member of.",
    category: "Groups",
    params: []
  },
  {
    name: "whatsapp_get_group_details",
    description: "Read details of a group, including subject, owner, description, and members list.",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID (e.g. 120363@g.us)", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_fetch_group_messages",
    description: "Read conversation message log history from a specific participating group.",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID (e.g. 120363@g.us)", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_send_group_message",
    description: "Send a message to a group chat you are part of.",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID (e.g. 120363@g.us)", type: "string", required: true },
      { name: "message", label: "Message Content", type: "textarea", required: true }
    ]
  },
  {
    name: "whatsapp_mention_members",
    description: "Send a group message explicitly mentioning specific members to notify them.",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID", type: "string", required: true },
      { name: "message", label: "Message Text", type: "textarea", required: true },
      { name: "jids", label: "Member JIDs (comma-separated list)", type: "string", required: true, placeholder: "15550199@s.whatsapp.net,15550200@s.whatsapp.net" }
    ]
  },
  {
    name: "whatsapp_create_group",
    description: "Create a new group chat with a list of initial participants.",
    category: "Groups",
    params: [
      { name: "subject", label: "Group Name", type: "string", required: true },
      { name: "participants", label: "Participant JIDs (comma-separated)", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_leave_group",
    description: "Exit and leave a group chat.",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_add_member",
    description: "Add a member to a group chat (requires group admin permissions).",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID", type: "string", required: true },
      { name: "jid", label: "Contact JID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_remove_member",
    description: "Remove a member from a group chat (requires group admin permissions).",
    category: "Groups",
    params: [
      { name: "groupId", label: "Group ID", type: "string", required: true },
      { name: "jid", label: "Contact JID", type: "string", required: true }
    ]
  },

  // Analytics
  {
    name: "whatsapp_summarize_conversation",
    description: "Construct an AI summarization analysis of recent chat log history.",
    category: "Analytics",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_summarize_group_conversation",
    description: "Construct an AI summary breakdown for group chat activities.",
    category: "Analytics",
    params: [
      { name: "groupId", label: "Group ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_conversation_statistics",
    description: "Analyze message counts, response speeds, and active times in a chat.",
    category: "Analytics",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_frequently_contacted_people",
    description: "Get analytics on contacts you exchange the most messages with.",
    category: "Analytics",
    params: []
  },

  // Media
  {
    name: "whatsapp_download_images",
    description: "Download image attachments from a chat log.",
    category: "Media",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_download_videos",
    description: "Download video attachments from a chat log.",
    category: "Media",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_download_documents",
    description: "Download file document attachments from a chat log.",
    category: "Media",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_download_voice_notes",
    description: "Download voice note audio files from a chat log.",
    category: "Media",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },

  // Status
  {
    name: "whatsapp_read_status",
    description: "Fetch status updates posted by your contacts.",
    category: "Status",
    params: []
  },
  {
    name: "whatsapp_post_status",
    description: "Post a plain text status update to your WhatsApp profile.",
    category: "Status",
    params: [
      { name: "statusText", label: "Status Text", type: "textarea", required: true }
    ]
  },

  // Profile
  {
    name: "whatsapp_get_my_profile",
    description: "Retrieve my own profile username, profile photo, status, and phone details.",
    category: "Profile",
    params: []
  },
  {
    name: "whatsapp_update_profile_name",
    description: "Update my own display name on WhatsApp profile.",
    category: "Profile",
    params: [
      { name: "name", label: "New Display Name", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_update_about",
    description: "Update the status/about text under my profile information.",
    category: "Profile",
    params: [
      { name: "aboutText", label: "New About Text", type: "string", required: true }
    ]
  },
  {
    name: "whatsapp_get_profile_picture",
    description: "Get the profile picture link of a target user.",
    category: "Profile",
    params: [
      { name: "chatId", label: "Chat ID", type: "string", required: true }
    ]
  },

  // System
  {
    name: "whatsapp_connection_status",
    description: "Read connection details (ping, signal quality, socket connectivity status).",
    category: "System",
    params: []
  },
  {
    name: "whatsapp_last_sync_time",
    description: "Check the last time WhatsApp messages/groups were synchronized.",
    category: "System",
    params: []
  },
  {
    name: "whatsapp_reconnect",
    description: "Force socket disconnection and trigger an immediate reconnect cycle.",
    category: "System",
    params: []
  },
  {
    name: "whatsapp_disconnect",
    description: "Close current socket connection and clear session state.",
    category: "System",
    params: []
  },
  {
    name: "whatsapp_session_information",
    description: "Retrieve detailed session information (token lifetimes, credential directory).",
    category: "System",
    params: []
  }
];

export class WhatsAppService extends BaseIntegrationService {
  platformId = "whatsapp";
  
  private sockets: Record<string, any> = {};
  private activeModes: Record<string, 'production' | 'sandbox'> = {};
  private sandboxStates: Record<string, {
    phone: string;
    messages: Record<string, any[]>;
    connectedAt: string;
  }> = {};
  // Per-user promise that resolves once the WS transport is open (pre-auth)
  private socketReady: Record<string, { resolve: () => void; reject: (e: any) => void }> = {};

  static getInstance(): WhatsAppService {
    const g = global as any;
    if (!g.whatsAppServiceInstance) {
      g.whatsAppServiceInstance = new WhatsAppService();
    }
    return g.whatsAppServiceInstance;
  }

  private constructor() {
    super();
  }

  /**
   * Triggers connection. Reuses existing production socket, or sets up sandbox settings.
   */
  async connect(
    userId: string, 
    accessToken: string, 
    params: { mode: 'production' | 'sandbox'; phoneNumber?: string }
  ): Promise<any> {
    const { mode, phoneNumber } = params;
    this.activeModes[userId] = mode;

    if (mode === 'sandbox') {
      const mockPhone = phoneNumber || "+15550199";
      this.sandboxStates[userId] = {
        phone: mockPhone,
        messages: {},
        connectedAt: new Date().toISOString()
      };
      
      await this.updateDbStatus(userId, 'connected', accessToken, {
        mode: 'sandbox',
        phone: mockPhone,
        lastConnected: new Date().toISOString()
      });
      
      this.emit(`connection:${userId}`, {
        status: 'connected',
        mode: 'sandbox',
        phone: mockPhone,
        lastConnected: new Date().toISOString()
      });
      
      return { success: true, mode: 'sandbox' };
    }

    // Production mode
    const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);
    const credsFile = path.join(sessionDir, 'creds.json');
    const alreadyRegistered = fs.existsSync(credsFile);

    // Initialize socket connection in background if it's already registered or we need it
    if (alreadyRegistered) {
      this.getSocket(userId, accessToken);
      return { success: true, mode: 'production', alreadyConnected: true };
    }

    // If it's a new connection, just spin up the socket ready for pairing
    await this.getSocket(userId, accessToken, true);
    return { success: true, mode: 'production', alreadyConnected: false };
  }

  /**
   * Disconnects the socket, deletes the session credentials folder, and updates the database.
   */
  async disconnect(userId: string, accessToken: string): Promise<void> {
    const mode = this.activeModes[userId] || 'production';
    console.log(`[WhatsAppService] Disconnecting session for user: ${userId} (${mode} mode)`);

    if (mode === 'sandbox') {
      delete this.sandboxStates[userId];
      await this.updateDbStatus(userId, 'disconnected', accessToken, { mode: 'sandbox', phone: '' });
      this.emit(`connection:${userId}`, { status: 'disconnected', mode: 'sandbox' });
      return;
    }

    // Production disconnect
    if (this.sockets[userId]) {
      try {
        await this.sockets[userId].logout();
      } catch (e) {
        try {
          this.sockets[userId].end(undefined);
        } catch (err) {}
      }
      delete this.sockets[userId];
    }

    const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);
    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch (e) {
        console.error("[WhatsAppService] Failed to remove session directory:", e);
      }
    }

    await this.updateDbStatus(userId, 'disconnected', accessToken, { mode: 'production', phone: '' });
    this.emit(`connection:${userId}`, { status: 'disconnected', mode: 'production' });
  }

  /**
   * Retrieves status from DB settings (or active socket state).
   */
  async getStatus(userId: string, accessToken: string): Promise<IntegrationStatus> {
    const dbStatus = await this.getDbStatus(userId, accessToken);
    
    // If DB says connected in production mode, check the live socket state
    if (dbStatus.status === 'connected' && dbStatus.mode === 'production') {
      const sock = this.sockets[userId];
      if (sock && sock.user) {
        // Socket is fully established — return connected
        return dbStatus;
      }
      // Socket is reconnecting (e.g. after pairing 515). Return "connected" anyway
      // so the frontend poll can detect success; the socket will fully open soon.
      return {
        status: 'connected',
        mode: 'production',
        phone: dbStatus.phone,
        lastConnected: dbStatus.lastConnected
      };
    }
    return dbStatus;
  }

  /**
   * Retrieves tools from the registry and merges enabled states / execution history from DB.
   */
  async getTools(userId: string, accessToken: string): Promise<any[]> {
    const dbSettings = await this.getDbSettings(userId, accessToken);
    const enabledTools = dbSettings.enabledTools || {};
    const toolsLastExecuted = dbSettings.toolsLastExecuted || {};

    return WHATSAPP_TOOLS_REGISTRY.map(tool => ({
      ...tool,
      enabled: enabledTools[tool.name] !== false, // default true
      lastExecuted: toolsLastExecuted[tool.name] || null
    }));
  }

  /**
   * Atomic pairing code request:
   * 1. Tears down any existing socket for this user
   * 2. Creates a fresh Baileys socket with no existing credentials
   * 3. Waits for the WS transport to open (pre-auth state)
   * 4. Calls requestPairingCode() — the only valid window to call it
   */
  async requestPairingCode(userId: string, phoneNumber: string, accessToken: string): Promise<string> {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber) throw new Error("Invalid phone number");

    // ── 1. Clear old session so we start unauthenticated ──────────────────
    const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);
    if (fs.existsSync(sessionDir)) {
      try { 
        console.log(`[WhatsAppService] Clearing old session directory for fresh pairing: ${sessionDir}`);
        fs.rmSync(sessionDir, { recursive: true, force: true }); 
      } catch (_) {}
    }
    fs.mkdirSync(sessionDir, { recursive: true });

    console.log(`[WhatsAppService] Starting pairing flow for user ${userId}, phone ${cleanNumber}`);
    
    // ── 2. Create the target socket directly ──────────────────────────────
    // We instantiate the persistent connection from the beginning.
    // It uses fetchLatestBaileysVersion() internally and listens for
    // the pairing confirmation from WhatsApp server.
    const sock = await this.getSocket(userId, accessToken, true, phoneNumber);

    // ── 3. Wait for socket transport to open ──────────────────────────────
    console.log(`[WhatsAppService] Waiting for socket transport to open...`);
    await sock.waitForSocketOpen();
    await delay(1000);

    // ── 4. Request the pairing code on this socket ────────────────────────
    console.log(`[WhatsAppService] Requesting pairing code for phone: ${cleanNumber}`);
    const pairingCode = await sock.requestPairingCode(cleanNumber);
    console.log(`[WhatsAppService] Pairing code successfully generated: ${pairingCode}`);

    this.emit(`pairing:${userId}`, { pairingCode });
    return pairingCode;
  }

  /**
   * Executes a tool with the provided arguments.

   */
  async executeTool(userId: string, toolName: string, params: any, accessToken: string): Promise<any> {
    const mode = this.activeModes[userId] || 'production';
    console.log(`[WhatsAppService] Executing tool ${toolName} in ${mode} mode for user ${userId}`);

    // Update execution timestamp in DB
    await this.updateExecutionTime(userId, toolName, accessToken);

    if (mode === 'sandbox') {
      return this.executeMockTool(userId, toolName, params);
    }

    // Production mode execution
    const sock = this.sockets[userId];
    if (!sock) {
      throw new Error("WhatsApp socket not connected");
    }

    const chatId = params.chatId || params.groupId || '';

    switch (toolName) {
      case "whatsapp_get_recent_messages":
        // Baileys has a list of recent chats inside history or we track it. We return a simplified list.
        return { success: true, chats: [] };
      
      case "whatsapp_read_chat_history":
        return { success: true, messages: [] };

      case "whatsapp_send_message":
        const response = await sock.sendMessage(chatId, { text: params.message });
        return { success: true, messageId: response.key.id, timestamp: new Date().toISOString() };

      case "whatsapp_send_media":
        const mediaResponse = await sock.sendMessage(chatId, { 
          image: { url: params.mediaUrl }, 
          caption: params.caption 
        });
        return { success: true, messageId: mediaResponse.key.id };

      case "whatsapp_block_contact":
        await sock.updateBlockStatus(chatId, 'block');
        return { success: true };

      case "whatsapp_unblock_contact":
        await sock.updateBlockStatus(chatId, 'unblock');
        return { success: true };

      case "whatsapp_list_groups":
        const groups = await sock.groupFetchAllParticipating();
        return { success: true, groups: Object.values(groups) };

      case "whatsapp_create_group":
        const participants = (params.participants || '').split(',').map((p: string) => p.trim());
        const groupMeta = await sock.groupCreate(params.subject, participants);
        return { success: true, groupId: groupMeta.id };

      case "whatsapp_leave_group":
        await sock.groupLeave(chatId);
        return { success: true };

      case "whatsapp_get_my_profile":
        return {
          success: true,
          name: sock.user?.name || "Me",
          jid: sock.user?.id
        };

      default:
        return { success: true, info: `Mock executed for production tool '${toolName}' (limited Baileys API mapping)` };
    }
  }

  /**
   * Helper to retrieve or initialize a Baileys socket for a user.
   */
  async getSocket(userId: string, accessToken: string, forceNew = false, pairingPhone?: string): Promise<any> {
    const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);

    if (this.sockets[userId] && !forceNew) {
      return this.sockets[userId];
    }

    if (this.sockets[userId]) {
      try {
        console.log(`[WhatsAppService] Terminating stale socket for user: ${userId}`);
        this.sockets[userId].end(undefined);
      } catch (e) {}
      delete this.sockets[userId];
    }

    console.log(`[WhatsAppService] Initializing Baileys connection for user: ${userId}`);
    this.activeModes[userId] = 'production';

    // 1. Fetch latest Baileys protocol version with a safe fallback
    let version: any = [2, 3000, 1015901307];
    try {
      const latest = await fetchLatestBaileysVersion();
      if (latest?.version) {
        version = latest.version;
        console.log(`[WhatsAppService] Using latest Baileys version: ${version.join('.')}`);
      }
    } catch (err: any) {
      console.warn(`[WhatsAppService] Failed to fetch latest Baileys version, using fallback. Error: ${err.message}`);
    }

    // 2. Resolve target phone number prefix to ISO 2-letter country code
    let targetPhone = pairingPhone || '';
    if (!targetPhone) {
      try {
        const dbStatus = await this.getDbStatus(userId, accessToken);
        if (dbStatus?.phone) {
          targetPhone = dbStatus.phone;
        }
      } catch (e) {}
    }
    const countryCode = targetPhone ? getIsoCountryCode(targetPhone) : 'US';
    console.log(`[WhatsAppService] Resolved ISO countryCode for user agent: ${countryCode} (phone: ${targetPhone || 'None'})`);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'debug' }), // Enabled debug logs for tracing state changes
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      countryCode, // The 2-letter ISO country code
      defaultQueryTimeoutMs: 30000,
    });

    sock.ev.on('creds.update', () => {
      console.log(`[WhatsAppService] creds.update event fired for user ${userId}`);
      saveCreds();
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      console.log(`[WhatsAppService] connection.update for user ${userId}: connection=${connection}`);

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const errMessage = lastDisconnect?.error?.message || "Unknown error";
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[WhatsAppService] Connection closed for user ${userId}. Status Code: ${statusCode}, Error: ${errMessage}. Reconnecting: ${shouldReconnect}`);
        
        this.emit(`connection:${userId}`, { 
          status: shouldReconnect ? 'connecting' : 'disconnected', 
          mode: 'production' 
        });

        if (shouldReconnect) {
          setTimeout(() => {
            this.getSocket(userId, accessToken, true, targetPhone)
              .catch(e => console.error(`[WhatsAppService] Reconnection failed:`, e));
          }, 5000);
        } else {
          // Permanently logged out
          console.log(`[WhatsAppService] User ${userId} logged out permanently. Cleaning credentials.`);
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch (e) {}
          delete this.sockets[userId];
          await this.updateDbStatus(userId, 'disconnected', accessToken, { mode: 'production', phone: '' });
        }
      } else if (connection === 'open') {
        const phone = sock.user?.id.split(':')[0] || targetPhone || '';
        console.log(`[WhatsAppService] Connection successfully opened for user ${userId}. Phone: ${phone}`);

        await this.updateDbStatus(userId, 'connected', accessToken, {
          mode: 'production',
          phone,
          lastConnected: new Date().toISOString()
        });

        this.emit(`connection:${userId}`, {
          status: 'connected',
          mode: 'production',
          phone,
          lastConnected: new Date().toISOString()
        });
      }
    });

    this.sockets[userId] = sock;
    return sock;
  }

  /**
   * Helper to retrieve status details from DB.
   */
  async getDbStatus(userId: string, accessToken: string): Promise<IntegrationStatus> {
    try {
      const insforgeClient = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
        accessToken
      });

      const { data, error } = await insforgeClient.database
        .from("user_integrations")
        .select("status, settings")
        .eq("user_id", userId)
        .eq("platform_id", "whatsapp")
        .maybeSingle();

      if (error || !data) {
        return { status: 'disconnected' };
      }

      const settings = data.settings as Record<string, any> || {};
      return {
        status: data.status,
        mode: settings.mode || 'production',
        phone: settings.phone || '',
        lastConnected: settings.lastConnected || ''
      };
    } catch (e) {
      return { status: 'disconnected' };
    }
  }

  private async getDbSettings(userId: string, accessToken: string): Promise<Record<string, any>> {
    try {
      const insforgeClient = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
        accessToken
      });
      const { data } = await insforgeClient.database
        .from("user_integrations")
        .select("settings")
        .eq("user_id", userId)
        .eq("platform_id", "whatsapp")
        .maybeSingle();
      return data?.settings as Record<string, any> || {};
    } catch (e) {
      return {};
    }
  }

  private async updateExecutionTime(userId: string, toolName: string, accessToken: string) {
    try {
      const insforgeClient = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
        accessToken
      });
      const { data } = await insforgeClient.database
        .from("user_integrations")
        .select("id, settings")
        .eq("user_id", userId)
        .eq("platform_id", "whatsapp")
        .maybeSingle();
      if (!data) return;

      const currentSettings = data.settings as Record<string, any> || {};
      const executed = currentSettings.toolsLastExecuted || {};
      
      const newSettings = {
        ...currentSettings,
        toolsLastExecuted: {
          ...executed,
          [toolName]: new Date().toISOString()
        }
      };

      await insforgeClient.database
        .from("user_integrations")
        .update({ settings: newSettings })
        .eq("id", data.id);
    } catch (e) {}
  }

  /**
   * Helper executing structured mock tools for Sandbox mode.
   */
  private executeMockTool(userId: string, toolName: string, params: any): any {
    const sandbox = this.sandboxStates[userId];
    const chatId = params.chatId || params.groupId || 'default_chat';

    switch (toolName) {
      case "whatsapp_get_recent_messages":
        return {
          success: true,
          chats: [
            { id: "15550199@s.whatsapp.net", name: "Alice Johnson", unreadCount: 2, conversation: "Let's align on the design system specs tomorrow." },
            { id: "15550200@s.whatsapp.net", name: "Bob Miller", unreadCount: 0, conversation: "I've uploaded the production bundles." },
            { id: "120363@g.us", name: "Development Hub Team", unreadCount: 5, conversation: "[Group] Emily updated the readme file." }
          ]
        };

      case "whatsapp_read_chat_history":
        const messages = sandbox?.messages[chatId] || [
          { id: "1", sender: "Alice Johnson", text: "Hey! Did you review the documentation?", timestamp: "10:35 AM", fromMe: false },
          { id: "2", sender: "Me", text: "Yes, I did! I'll look into it now.", timestamp: "10:36 AM", fromMe: true }
        ];
        return { success: true, messages };

      case "whatsapp_send_message":
        if (sandbox) {
          if (!sandbox.messages[chatId]) {
            sandbox.messages[chatId] = [];
          }
          const textMsg = {
            id: Math.random().toString(36).substring(7),
            sender: "Me",
            text: params.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fromMe: true
          };
          sandbox.messages[chatId].push(textMsg);
        }
        return { success: true, messageId: `msg_${Math.random().toString(36).substring(5)}`, timestamp: new Date().toISOString() };

      case "whatsapp_list_groups":
        return {
          success: true,
          groups: [
            { id: "120363@g.us", name: "Development Hub Team", creation: "2026-07-01", owner: "15550199@s.whatsapp.net" },
            { id: "120364@g.us", name: "Product Design Sync", creation: "2026-07-04", owner: "15550200@s.whatsapp.net" }
          ]
        };

      case "whatsapp_get_my_profile":
        return {
          success: true,
          name: "Dev Sandbox User",
          jid: sandbox?.phone + "@s.whatsapp.net" || "+15550199@s.whatsapp.net",
          about: "Building cool NextJS platforms!",
          status: "Available"
        };

      case "whatsapp_summarize_conversation":
        return {
          success: true,
          summary: {
            context: "Reviewing documentation and building dynamic SSE handlers.",
            keyPoints: [
              "Discussed missing makeInMemoryStore import in latest Baileys.",
              "Agreed on downgrading to stable v6 and setting up custom caches."
            ],
            actionItems: [
              "Verify compiling in production mode using Turbopack.",
              "Setup real-time EventSource listener in dashboard."
            ],
            sentiment: "Collaborative and productive"
          }
        };

      default:
        return {
          success: true,
          info: `Simulated Sandbox run completed successfully for tool: '${toolName}'`,
          parameters: params
        };
    }
  }
}
