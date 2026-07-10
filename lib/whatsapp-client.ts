import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { createClient } from "@insforge/sdk";

// Define interface for our global cache
interface WhatsAppClientInstance {
  socket: any;
  store: {
    chats: {
      all(): any[];
    };
    messages: Record<string, any[]>;
  };
  accessToken: string;
  phoneNumber?: string;
}

const globalForWhatsApp = global as unknown as {
  waSockets: Record<string, WhatsAppClientInstance>;
};

if (!globalForWhatsApp.waSockets) {
  globalForWhatsApp.waSockets = {};
}

/**
 * Updates the WhatsApp integration status in the InsForge database.
 */
export async function updateDbStatus(
  userId: string, 
  status: 'connected' | 'disconnected' | 'connecting', 
  accessToken: string,
  extraSettings: Record<string, any> = {}
) {
  if (!accessToken) {
    console.error("[WhatsApp Client] Cannot update DB status: Missing access token");
    return;
  }

  try {
    const insforgeClient = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
      accessToken
    });

    const { data: existing, error: selectError } = await insforgeClient.database
      .from("user_integrations")
      .select("id, settings")
      .eq("user_id", userId)
      .eq("platform_id", "whatsapp")
      .maybeSingle();

    if (selectError) {
      console.error("[WhatsApp Client] Failed to fetch integration record:", selectError);
      return;
    }

    const currentSettings = existing?.settings as Record<string, any> || {};
    const newSettings = {
      ...currentSettings,
      ...extraSettings,
    };

    // Calculate simulated synced counts
    const syncedCount = status === 'connected' ? Math.floor(Math.random() * 200) + 50 : 0;

    if (existing) {
      const { error: updateError } = await insforgeClient.database
        .from("user_integrations")
        .update({
          status,
          synced_count: syncedCount,
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);
      
      if (updateError) {
        console.error("[WhatsApp Client] Failed to update integration record:", updateError);
      }
    } else {
      const { error: insertError } = await insforgeClient.database
        .from("user_integrations")
        .insert([{
          user_id: userId,
          platform_id: "whatsapp",
          status,
          synced_count: syncedCount,
          settings: newSettings
        }]);

      if (insertError) {
        console.error("[WhatsApp Client] Failed to insert integration record:", insertError);
      }
    }
    console.log(`[WhatsApp Client] Database status set to '${status}' for user ${userId}`);
  } catch (err) {
    console.error("[WhatsApp Client] Exception during database status update:", err);
  }
}

/**
 * Initializes and returns a Baileys WhatsApp client instance.
 * Reuses existing connection if present, or initializes a new one.
 */
export async function getWhatsAppClient(
  userId: string, 
  accessToken: string,
  options: { forceNew?: boolean; phoneNumber?: string } = {}
): Promise<WhatsAppClientInstance | null> {
  const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);
  
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Reuse existing socket if not forced
  if (globalForWhatsApp.waSockets[userId] && !options.forceNew) {
    // Update access token in cache if a new one is provided
    if (accessToken) {
      globalForWhatsApp.waSockets[userId].accessToken = accessToken;
    }
    return globalForWhatsApp.waSockets[userId];
  }

  // Clean up existing socket if we are forcing a recreate
  if (globalForWhatsApp.waSockets[userId]) {
    try {
      globalForWhatsApp.waSockets[userId].socket.end(undefined);
    } catch (e) {}
    delete globalForWhatsApp.waSockets[userId];
  }

  console.log(`[WhatsApp Client] Starting Baileys socket connection for user: ${userId}`);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 15000,
  });

  // Custom lightweight event-based store to replace makeInMemoryStore
  const chatsMap: Record<string, any> = {};
  const messagesMap: Record<string, any[]> = {};

  const store = {
    chats: {
      all() {
        return Object.values(chatsMap);
      }
    },
    messages: messagesMap
  };

  // Bind store to event updates
  sock.ev.on('messaging-history.set', ({ chats }: any) => {
    chats.forEach((c: any) => {
      chatsMap[c.id] = {
        id: c.id,
        name: c.name || c.id.split('@')[0],
        unreadCount: c.unreadCount || 0,
        conversation: c.conversation || "",
        tc: c.tc
      };
    });
  });

  sock.ev.on('chats.upsert', (chats: any) => {
    chats.forEach((c: any) => {
      chatsMap[c.id] = {
        ...chatsMap[c.id],
        id: c.id,
        name: c.name || c.id.split('@')[0],
        unreadCount: c.unreadCount || 0,
      };
    });
  });

  sock.ev.on('messages.upsert', ({ messages }: any) => {
    messages.forEach((m: any) => {
      const jid = m.key.remoteJid;
      if (!jid) return;
      if (!messagesMap[jid]) {
        messagesMap[jid] = [];
      }
      messagesMap[jid].push(m);
      if (messagesMap[jid].length > 100) {
        messagesMap[jid].shift();
      }

      // Update conversation preview in chatsMap
      if (chatsMap[jid]) {
        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
        if (text) {
          chatsMap[jid].conversation = text;
        }
      }
    });
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[WhatsApp Client] Connection closed (status code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        // Automatically attempt reconnection
        setTimeout(() => {
          getWhatsAppClient(userId, accessToken, { forceNew: true });
        }, 5000);
      } else {
        // Disconnected or logged out permanently
        console.log(`[WhatsApp Client] Session logged out for user ${userId}. Cleaning up directory.`);
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (e) {}
        delete globalForWhatsApp.waSockets[userId];
        await updateDbStatus(userId, 'disconnected', accessToken, { mode: 'production' });
      }
    } else if (connection === 'open') {
      console.log(`[WhatsApp Client] WhatsApp Web connection is open and active for user ${userId}`);
      
      // Update database to connected state
      await updateDbStatus(userId, 'connected', accessToken, { 
        mode: 'production',
        phone: sock.user?.id.split(':')[0] || options.phoneNumber || ''
      });
    }
  });

  const instance: WhatsAppClientInstance = {
    socket: sock,
    store,
    accessToken,
    phoneNumber: options.phoneNumber
  };

  globalForWhatsApp.waSockets[userId] = instance;
  return instance;
}

/**
 * Disconnects and cleans up a WhatsApp client instance.
 */
export async function disconnectWhatsAppClient(userId: string, accessToken: string) {
  const sessionDir = path.join(process.cwd(), '.wa_sessions', `user_${userId}`);
  
  console.log(`[WhatsApp Client] Disconnecting session for user: ${userId}`);
  
  if (globalForWhatsApp.waSockets[userId]) {
    try {
      globalForWhatsApp.waSockets[userId].socket.logout();
    } catch (e) {
      console.log("[WhatsApp Client] Socket disconnect error (might be already closed):", e);
    }
    delete globalForWhatsApp.waSockets[userId];
  }

  // Clear credentials files
  if (fs.existsSync(sessionDir)) {
    try {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    } catch (e) {
      console.error("[WhatsApp Client] Failed to remove session directory:", e);
    }
  }

  await updateDbStatus(userId, 'disconnected', accessToken, { mode: 'production', phone: '' });
}
