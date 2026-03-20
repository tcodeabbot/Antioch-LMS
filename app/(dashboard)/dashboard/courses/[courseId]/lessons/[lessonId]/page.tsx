import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getLessonById } from "@/sanity/lib/lessons/getLessonById";
import getCourseById from "@/sanity/lib/courses/getCourseById";
import { PortableText } from "@portabletext/react";
import { LoomEmbed } from "@/components/LoomEmbed";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonCompleteButton } from "@/components/LessonCompleteButton";
import {
  LessonTopBar,
  LessonBottomNav,
  AutoAdvanceHandler,
} from "@/components/LessonNavigation";
import { getLessonNavData } from "@/lib/lessonNavigation";

interface LessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const user = await currentUser();
  const { courseId, lessonId } = await params;

  const [lesson, course] = await Promise.all([
    getLessonById(lessonId),
    getCourseById(courseId),
  ]);

  if (!lesson) {
    return redirect(`/dashboard/courses/${courseId}`);
  }

  const nav = getLessonNavData(course?.modules as any, lessonId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-8 pb-28 px-4">
          <LessonTopBar
            currentIndex={nav.currentIndex}
            totalLessons={nav.totalLessons}
            durationMinutes={nav.durationMinutes}
          />

          <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>

          {lesson.description && (
            <p className="text-muted-foreground mb-8">{lesson.description}</p>
          )}

          <div className="space-y-8">
            {lesson.videoUrl && (
              <>
                <AutoAdvanceHandler
                  courseId={courseId}
                  nextLessonId={nav.nextLesson?._id || null}
                />
                <VideoPlayer url={lesson.videoUrl} />
              </>
            )}

            {lesson.loomUrl && <LoomEmbed shareUrl={lesson.loomUrl} />}

            {lesson.content && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Lesson Notes</h2>
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <PortableText value={lesson.content} />
                </div>
              </div>
            )}
          </div>

          <LessonBottomNav
            courseId={courseId}
            prevLesson={nav.prevLesson}
            nextLesson={nav.nextLesson}
          />
        </div>
      </div>

      <LessonCompleteButton lessonId={lesson._id} clerkId={user!.id} />
    </div>
  );
}
