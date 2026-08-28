import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Used only to verify Sentry error capture is working after deploy.
// Sign in as admin, then call GET /api/admin/sentry-test to trigger a test event.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  throw new Error(
    "SriLaYa Green Sentry test — this error was triggered intentionally to verify Sentry capture is working."
  );
}
