import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAllLessonCommentsAdmin } from "@/sanity/lib/admin/getAllLessonCommentsAdmin";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { client } from "@/sanity/lib/client";
import { AdminDiscussionsModeration } from "@/components/admin/AdminDiscussionsModeration";
import { MessageSquare } from "lucide-react";

type ModuleRow = {
  lessons?: { _id: string; title?: string }[];
};

type CourseRow = {
  _id: string;
  title: string;
  modules?: ModuleRow[];
};

function buildLessonsByCourse(courses: CourseRow[]) {
  const lessonsByCourse: Record<string, { _id: string; title: string }[]> = {};
  for (const c of courses) {
    const list: { _id: string; title: string }[] = [];
    for (const m of c.modules || []) {
      for (const les of m.lessons || []) {
        if (les._id) {
          list.push({ _id: les._id, title: les.title || "Lesson" });
        }
      }
    }
    lessonsByCourse[c._id] = list;
  }
  return lessonsByCourse;
}

function findCourseForLesson(
  lessonsByCourse: Record<string, { _id: string; title: string }[]>,
  lessonId: string
) {
  for (const [cid, lessons] of Object.entries(lessonsByCourse)) {
    if (lessons.some((l) => l._id === lessonId)) return cid;
  }
  return null;
}

export default async function AdminDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string;
    lessonId?: string;
    studentId?: string;
  }>;
}) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const sp = await searchParams;
  const courseId = sp.courseId;
  const lessonId = sp.lessonId;
  const studentId = sp.studentId;

  const stats = await getCourseStats();
  const courses = (stats.courses || []) as CourseRow[];
  const lessonsByCourse = buildLessonsByCourse(courses);

  if (lessonId && !courseId) {
    const inferred = findCourseForLesson(lessonsByCourse, lessonId);
    if (inferred) {
      const params = new URLSearchParams();
      params.set("courseId", inferred);
      params.set("lessonId", lessonId);
      if (studentId) params.set("studentId", studentId);
      redirect(`/admin/discussions?${params.toString()}`);
    }
  }

  const comments = await getAllLessonCommentsAdmin({
    courseId,
    lessonId,
    studentId,
    limit: 120,
  });

  const studentRows = await client.fetch<
    { _id: string; firstName?: string; lastName?: string; email?: string }[]
  >(
    `*[_type == "student"] | order(firstName asc) [0...500]{ _id, firstName, lastName, email }`
  );

  const students = studentRows.map((s) => ({
    _id: s._id,
    label: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email || s._id,
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Discussion moderation
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Review every lesson comment, filter by course or learner, pin highlights, and reply as
          staff.
        </p>
      </div>

      <AdminDiscussionsModeration
        initialComments={comments}
        courses={courses.map((c) => ({ _id: c._id, title: c.title }))}
        lessonsByCourse={lessonsByCourse}
        students={students}
      />
    </div>
  );
}
