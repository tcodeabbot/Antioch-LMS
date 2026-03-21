import { Resend } from "resend";
import type { StudentDigest } from "@/sanity/lib/student/getWeeklyDigestData";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.DIGEST_FROM_EMAIL || "Antioch LMS <noreply@antioch-lms.com>";

function buildDigestHtml(data: StudentDigest): string {
  const coursesHtml = data.coursesInProgress.length > 0
    ? data.coursesInProgress.map((c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${c.courseTitle}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;">
          <div style="background:#f0f0f0;border-radius:99px;height:8px;width:120px;display:inline-block;vertical-align:middle;">
            <div style="background:#6d1a36;border-radius:99px;height:8px;width:${c.progress}%;"></div>
          </div>
          <span style="margin-left:8px;">${c.progress}%</span>
        </td>
      </tr>
    `).join("")
    : '<tr><td colspan="2" style="padding:12px;text-align:center;color:#999;font-size:14px;">No courses in progress</td></tr>';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:#6d1a36;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:24px;">Your Weekly Learning Summary</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Hi ${data.firstName}, here's what you accomplished this week</p>
    </div>

    <!-- Stats -->
    <div style="background:white;padding:24px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:0;">
        <tr>
          <td align="center" style="padding:12px;">
            <div style="font-size:32px;font-weight:bold;color:#6d1a36;">${data.lessonsCompletedThisWeek}</div>
            <div style="font-size:12px;color:#999;margin-top:4px;">Lessons Completed</div>
          </td>
          <td align="center" style="padding:12px;">
            <div style="font-size:32px;font-weight:bold;color:#333;">${formatStudyTime(data.studyMinutesThisWeek)}</div>
            <div style="font-size:12px;color:#999;margin-top:4px;">Study Time</div>
          </td>
          <td align="center" style="padding:12px;">
            <div style="font-size:32px;font-weight:bold;color:#f59e0b;">${data.currentStreak}</div>
            <div style="font-size:12px;color:#999;margin-top:4px;">Day Streak</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Courses -->
    <div style="background:white;padding:24px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#333;">Courses In Progress</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:0;">
        ${coursesHtml}
      </table>
    </div>

    <!-- CTA -->
    <div style="background:white;padding:24px 24px 32px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;text-align:center;">
      ${data.lessonsCompletedThisWeek > 0
        ? '<p style="color:#333;font-size:14px;margin:0 0 16px;">Great work this week! Keep the momentum going.</p>'
        : '<p style="color:#333;font-size:14px;margin:0 0 16px;">Jump back in and continue your learning journey!</p>'
      }
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://lms.antioch-of-africa.com"}/dashboard" style="display:inline-block;background:#6d1a36;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">Continue Learning</a>
    </div>

    <!-- Footer -->
    <div style="background:#f0f0f0;border-radius:0 0 12px 12px;padding:16px 24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;">Antioch Christian Resource Center</p>
      <p style="margin:4px 0 0;font-size:11px;color:#999;">You're receiving this because you're enrolled in courses on Antioch LMS.</p>
    </div>
  </div>
</body>
</html>`;
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}

export async function sendWeeklyDigest(data: StudentDigest): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your Weekly Learning Summary — ${data.lessonsCompletedThisWeek} lessons completed`,
      html: buildDigestHtml(data),
    });
    return true;
  } catch (error) {
    console.error(`Failed to send digest to ${data.email}:`, error);
    return false;
  }
}
