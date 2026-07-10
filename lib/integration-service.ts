import { EventEmitter } from 'events';
import { createClient } from "@insforge/sdk";

export interface IntegrationStatus {
  status: 'connected' | 'disconnected' | 'connecting';
  phone?: string;
  email?: string;
  lastConnected?: string;
  mode?: 'production' | 'sandbox';
  [key: string]: any;
}

export abstract class BaseIntegrationService extends EventEmitter {
  abstract platformId: string;

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Triggers connection setup for the platform.
   */
  abstract connect(userId: string, accessToken: string, params: any): Promise<any>;

  /**
   * Logs out/disconnects from the platform.
   */
  abstract disconnect(userId: string, accessToken: string): Promise<void>;

  /**
   * Retrieves the current integration status.
   */
  abstract getStatus(userId: string, accessToken: string): Promise<IntegrationStatus>;

  /**
   * Returns lists of supported tools dynamically.
   */
  abstract getTools(userId: string, accessToken: string): Promise<any[]>;

  /**
   * Executes a tool with the provided arguments.
   */
  abstract executeTool(userId: string, toolName: string, params: any, accessToken: string): Promise<any>;

  /**
   * Utility to update the integration state in the InsForge database.
   */
  protected async updateDbStatus(
    userId: string,
    status: 'connected' | 'disconnected' | 'connecting',
    accessToken: string,
    extraSettings: Record<string, any> = {}
  ) {
    if (!accessToken) {
      console.error(`[${this.platformId}] Cannot update database: Missing access token`);
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
        .eq("platform_id", this.platformId)
        .maybeSingle();

      if (selectError) {
        console.error(`[${this.platformId}] Failed to query integration:`, selectError);
        return;
      }

      const currentSettings = existing?.settings as Record<string, any> || {};
      const newSettings = {
        ...currentSettings,
        ...extraSettings,
      };

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
          console.error(`[${this.platformId}] Failed to update integration:`, updateError);
        }
      } else {
        const { error: insertError } = await insforgeClient.database
          .from("user_integrations")
          .insert([{
            user_id: userId,
            platform_id: this.platformId,
            status,
            synced_count: syncedCount,
            settings: newSettings
          }]);

        if (insertError) {
          console.error(`[${this.platformId}] Failed to insert integration:`, insertError);
        }
      }
      console.log(`[${this.platformId}] Database status set to '${status}' for user ${userId}`);
    } catch (err) {
      console.error(`[${this.platformId}] Exception in updateDbStatus:`, err);
    }
  }
}
