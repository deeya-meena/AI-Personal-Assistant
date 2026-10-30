import { NextRequest, NextResponse } from "next/server";
import {
  findUserById,
  findUserByEmail,
  updateUser,
  getUserIntegrations,
  upsertUserIntegration,
} from "@/lib/auth-store";

// Helper to parse PostgREST eq query parameters like ?user_id=eq.abc
function parseFilter(url: URL, param: string): string | null {
  const val = url.searchParams.get(param);
  if (!val) return null;
  if (val.startsWith("eq.")) {
    return val.substring(3);
  }
  return val;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string[] }> }
) {
  try {
    const { table: tableSegments } = await params;
    const tableName = tableSegments?.[0];
    const url = new URL(req.url);

    if (tableName === "users") {
      const idFilter = parseFilter(url, "id");
      const emailFilter = parseFilter(url, "email");

      if (idFilter) {
        const user = findUserById(idFilter);
        return NextResponse.json(user ? [user] : []);
      }
      if (emailFilter) {
        const user = findUserByEmail(emailFilter);
        return NextResponse.json(user ? [user] : []);
      }
      return NextResponse.json([]);
    }

    if (tableName === "user_integrations") {
      const userIdFilter = parseFilter(url, "user_id");
      const platformFilter = parseFilter(url, "platform_id");

      let items = userIdFilter ? getUserIntegrations(userIdFilter) : [];
      if (platformFilter) {
        items = items.filter((item) => item.platform_id === platformFilter);
      }
      return NextResponse.json(items);
    }

    // Default empty array for any other table
    return NextResponse.json([]);
  } catch (err: any) {
    console.error("[Database Records GET Exception]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string[] }> }
) {
  try {
    const { table: tableSegments } = await params;
    const tableName = tableSegments?.[0];
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    if (tableName === "users") {
      // Handled primarily via auth, but support profile sync
      for (const rec of records) {
        if (rec.id) {
          const existing = findUserById(rec.id);
          if (existing) {
            updateUser(rec.id, rec);
          }
        }
      }
      return NextResponse.json(records);
    }

    if (tableName === "user_integrations") {
      const results = [];
      for (const rec of records) {
        if (rec.user_id && rec.platform_id) {
          const item = upsertUserIntegration(rec.user_id, rec.platform_id, rec);
          results.push(item);
        }
      }
      return NextResponse.json(results);
    }

    return NextResponse.json(records);
  } catch (err: any) {
    console.error("[Database Records POST Exception]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ table: string[] }> }
) {
  try {
    const { table: tableSegments } = await params;
    const tableName = tableSegments?.[0];
    const url = new URL(req.url);
    const idFilter = parseFilter(url, "id");
    const body = await req.json();

    if (tableName === "users" && idFilter) {
      const updated = updateUser(idFilter, body);
      return NextResponse.json([updated]);
    }

    if (tableName === "user_integrations") {
      const userIdFilter = parseFilter(url, "user_id");
      const platformFilter = parseFilter(url, "platform_id");

      if (userIdFilter && platformFilter) {
        const updated = upsertUserIntegration(userIdFilter, platformFilter, body);
        return NextResponse.json([updated]);
      }
    }

    return NextResponse.json([body]);
  } catch (err: any) {
    console.error("[Database Records PATCH Exception]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
