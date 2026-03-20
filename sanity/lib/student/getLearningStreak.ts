import groq from "groq";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "./getStudentByClerkId";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: number;
  last30Days: Record<string, number>;
}

export async function getLearningStreak(clerkId: string): Promise<StreakData> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) {
    return { currentStreak: 0, longestStreak: 0, todayCompleted: 0, last30Days: {} };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await sanityFetch({
    query: groq`*[_type == "lessonCompletion" && student._ref == $studentId && completedAt >= $since]{
      completedAt
    } | order(completedAt desc)`,
    params: {
      studentId: student._id,
      since: thirtyDaysAgo.toISOString(),
    },
  });

  const completions = (result.data || []) as Array<{ completedAt: string }>;

  const dayMap: Record<string, number> = {};
  for (const c of completions) {
    const day = c.completedAt.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayCompleted = dayMap[today] || 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const d = new Date();

  for (let i = 0; i < 30; i++) {
    const key = d.toISOString().slice(0, 10);
    if (dayMap[key]) {
      tempStreak++;
      if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
    } else {
      if (i === 0) {
        // today has no completions — check if yesterday started a streak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak > 0 && i <= 1) {
          // Allow "today not yet done" — keep looking
        } else if (currentStreak === 0) {
          // still looking for first day
        } else {
          break;
        }
      }
    }
    d.setDate(d.getDate() - 1);
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Recalculate current streak more precisely
  currentStreak = 0;
  const check = new Date();
  // If nothing done today, start from yesterday
  const todayKey = check.toISOString().slice(0, 10);
  if (!dayMap[todayKey]) {
    check.setDate(check.getDate() - 1);
  }
  for (let i = 0; i < 30; i++) {
    const key = check.toISOString().slice(0, 10);
    if (dayMap[key]) {
      currentStreak++;
    } else {
      break;
    }
    check.setDate(check.getDate() - 1);
  }

  return { currentStreak, longestStreak, todayCompleted, last30Days: dayMap };
}
