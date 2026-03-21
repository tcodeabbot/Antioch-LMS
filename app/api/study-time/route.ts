import { NextRequest, NextResponse } from "next/server";
import { recordStudySession } from "@/sanity/lib/student/studyTime";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clerkId, lessonId, courseId, durationSeconds, startedAt } = body;

    if (!clerkId || !lessonId || !courseId || !durationSeconds) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await recordStudySession(
      clerkId,
      lessonId,
      courseId,
      durationSeconds,
      startedAt
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to record" },
      { status: 500 }
    );
  }
}
