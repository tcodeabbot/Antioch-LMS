import { NextRequest, NextResponse } from "next/server";
import groq from "groq";
import { sanityFetch } from "@/sanity/lib/live";
import { createNotification } from "@/sanity/lib/notifications/notifications";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayISO = yesterday.toISOString();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);
    const twoDaysAgoISO = twoDaysAgo.toISOString();

    const result = await sanityFetch({
      query: groq`*[_type == "student"]{
        _id,
        firstName,
        "hadActivityYesterday": count(*[_type == "lessonCompletion" && student._ref == ^._id && completedAt >= $yesterday && completedAt < $today]) > 0,
        "hadActivityDayBefore": count(*[_type == "lessonCompletion" && student._ref == ^._id && completedAt >= $twoDaysAgo && completedAt < $yesterday]) > 0,
        "hasActivityToday": count(*[_type == "lessonCompletion" && student._ref == ^._id && completedAt >= $today]) > 0,
        "alreadyRemindedToday": count(*[_type == "notification" && student._ref == ^._id && type == "streak_reminder" && createdAt >= $today]) > 0
      }`,
      params: {
        yesterday: yesterdayISO,
        today: todayISO,
        twoDaysAgo: twoDaysAgoISO,
      },
    });

    const students = (result.data || []) as Array<{
      _id: string;
      firstName: string;
      hadActivityYesterday: boolean;
      hadActivityDayBefore: boolean;
      hasActivityToday: boolean;
      alreadyRemindedToday: boolean;
    }>;

    let sent = 0;
    for (const s of students) {
      if (
        s.hadActivityYesterday &&
        s.hadActivityDayBefore &&
        !s.hasActivityToday &&
        !s.alreadyRemindedToday
      ) {
        await createNotification({
          studentId: s._id,
          type: "streak_reminder",
          title: "Don't break your streak!",
          message: `Hey ${s.firstName || "there"}, complete a lesson today to keep your learning streak alive!`,
          link: "/dashboard",
        });
        sent++;
      }
    }

    return NextResponse.json({ ok: true, reminders_sent: sent });
  } catch (error) {
    console.error("Streak reminder cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
