import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { WhatsAppService } from "@/lib/whatsapp-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing auth token" }, { status: 401 });
    }

    const insforgeClient = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
      accessToken: token,
    });

    const { data: userData, error: authError } = await insforgeClient.auth.getCurrentUser();
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    const userId = userData.user.id;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "getChats";
    const chatId = searchParams.get("chatId") || "";
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "30");

    const waService = WhatsAppService.getInstance();

    switch (action) {
      case "getChats": {
        const chats = waService.getChats(userId, limit);
        return NextResponse.json({
          success: true,
          hasData: waService.hasData(userId),
          count: chats.length,
          chats,
        });
      }

      case "getMessages": {
        if (!chatId) {
          return NextResponse.json({ error: "chatId is required for getMessages" }, { status: 400 });
        }
        const messages = waService.getMessages(userId, chatId, limit);
        return NextResponse.json({
          success: true,
          chatId,
          count: messages.length,
          messages,
        });
      }

      case "getAllMessages": {
        const messages = waService.getAllMessages(userId, limit);
        return NextResponse.json({
          success: true,
          count: messages.length,
          messages,
        });
      }

      case "getUnreadMessages": {
        const unread = waService.getUnreadMessages(userId);
        return NextResponse.json({
          success: true,
          totalUnreadChats: unread.length,
          unread,
        });
      }

      case "searchMessages": {
        if (!query) {
          return NextResponse.json({ error: "query is required for searchMessages" }, { status: 400 });
        }
        const results = waService.searchMessages(userId, query, limit);
        return NextResponse.json({
          success: true,
          query,
          count: results.length,
          messages: results,
        });
      }

      case "getStats": {
        const chats = waService.getChats(userId, 100);
        const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
        const allMsgs = waService.getAllMessages(userId, 1000);
        return NextResponse.json({
          success: true,
          hasData: waService.hasData(userId),
          totalChats: chats.length,
          totalUnreadChats: chats.filter(c => c.unreadCount > 0).length,
          totalUnreadMessages: totalUnread,
          totalMessagesStored: allMsgs.length,
          oldestMessage: allMsgs.length > 0 ? new Date(allMsgs[allMsgs.length - 1].timestamp * 1000).toISOString() : null,
          newestMessage: allMsgs.length > 0 ? new Date(allMsgs[0].timestamp * 1000).toISOString() : null,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[WhatsApp Messages API]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
