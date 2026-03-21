import { NextRequest, NextResponse } from "next/server";
import { getAllStudentDigests } from "@/sanity/lib/student/getWeeklyDigestData";
import { sendWeeklyDigest } from "@/lib/email/weeklyDigest";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const digests = await getAllStudentDigests();
    let sent = 0;
    let failed = 0;

    for (const digest of digests) {
      const ok = await sendWeeklyDigest(digest);
      if (ok) sent++;
      else failed++;
    }

    return NextResponse.json({
      ok: true,
      total: digests.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Weekly digest cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
