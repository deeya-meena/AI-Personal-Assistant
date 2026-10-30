import { NextRequest } from "next/server";
import { POST as handleGoogleCallback } from "../../google/callback/route";

export async function POST(req: NextRequest) {
  return handleGoogleCallback(req);
}
