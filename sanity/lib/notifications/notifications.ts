import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(
  clerkId: string,
  limit = 20
): Promise<Notification[]> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return [];

  const result = await sanityFetch({
    query: groq`*[_type == "notification" && student._ref == $studentId] | order(createdAt desc) [0...$limit] {
      _id, type, title, message, link, read, createdAt
    }`,
    params: { studentId: student._id, limit },
  });

  return (result.data as Notification[]) || [];
}

export async function getUnreadCount(clerkId: string): Promise<number> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return 0;

  const result = await sanityFetch({
    query: groq`count(*[_type == "notification" && student._ref == $studentId && read != true])`,
    params: { studentId: student._id },
  });

  return (result.data as number) || 0;
}

export async function markNotificationRead(notificationId: string) {
  return client.patch(notificationId).set({ read: true }).commit();
}

export async function markAllNotificationsRead(clerkId: string) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return;

  const unread = await sanityFetch({
    query: groq`*[_type == "notification" && student._ref == $studentId && read != true]._id`,
    params: { studentId: student._id },
  });

  const ids = (unread.data as string[]) || [];
  if (ids.length === 0) return;

  const transaction = client.transaction();
  for (const id of ids) {
    transaction.patch(id, (p) => p.set({ read: true }));
  }
  return transaction.commit();
}

export async function createNotification({
  studentId,
  type,
  title,
  message,
  link,
}: {
  studentId: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
}) {
  return client.create({
    _type: "notification",
    student: { _type: "reference", _ref: studentId },
    type,
    title,
    message: message || null,
    link: link || null,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function notifyDiscussionReply({
  lessonId,
  lessonTitle,
  courseId,
  commenterClerkId,
  commenterName,
}: {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  commenterClerkId: string;
  commenterName: string;
}) {
  const commenter = await getStudentByClerkId(commenterClerkId);
  if (!commenter?._id) return;

  const result = await sanityFetch({
    query: groq`*[_type == "lessonComment" && lesson._ref == $lessonId && student._ref != $commenterId]{
      "studentId": student._ref
    }`,
    params: { lessonId, commenterId: commenter._id },
  });

  const participants = (result.data as Array<{ studentId: string }>) || [];
  const uniqueIds = [...new Set(participants.map((p) => p.studentId))];

  for (const studentId of uniqueIds) {
    await createNotification({
      studentId,
      type: "discussion_reply",
      title: "New reply in discussion",
      message: `${commenterName} replied in "${lessonTitle}"`,
      link: `/dashboard/courses/${courseId}/lessons/${lessonId}`,
    });
  }
}

export async function notifyStreakMilestone(
  studentId: string,
  streak: number
) {
  const milestones = [3, 7, 14, 30, 60, 100];
  if (!milestones.includes(streak)) return;

  await createNotification({
    studentId,
    type: "streak_milestone",
    title: `${streak}-day streak!`,
    message: `Amazing! You've maintained a ${streak}-day learning streak. Keep it up!`,
    link: "/my-courses",
  });
}

export async function notifyCourseCompleted(
  studentId: string,
  courseTitle: string,
  courseId: string
) {
  await createNotification({
    studentId,
    type: "course_completed",
    title: "Course completed!",
    message: `Congratulations! You've completed "${courseTitle}". Download your certificate now.`,
    link: `/dashboard/courses/${courseId}`,
  });
}
