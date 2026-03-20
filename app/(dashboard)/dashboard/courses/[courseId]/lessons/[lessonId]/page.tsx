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
  KeyboardShortcuts,
} from "@/components/LessonNavigation";
import { getLessonNavData } from "@/lib/lessonNavigation";
import { Download, FileText } from "lucide-react";
import { dataset, projectId } from "@/sanity/env";
import { LessonNotes } from "@/components/LessonNotes";
import { LessonDiscussion } from "@/components/LessonDiscussion";
import { LessonQuiz } from "@/components/LessonQuiz";
import { LessonBookmarkButton } from "@/components/LessonBookmarkButton";

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
        <div className="max-w-4xl mx-auto pt-4 sm:pt-8 pb-32 sm:pb-28 px-3 sm:px-4">
          <LessonTopBar
            currentIndex={nav.currentIndex}
            totalLessons={nav.totalLessons}
            durationMinutes={nav.durationMinutes}
          />

          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">{lesson.title}</h1>
            <LessonBookmarkButton lessonId={lesson._id} courseId={courseId} />
          </div>

          {lesson.description && (
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">{lesson.description}</p>
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

            {(lesson as any).resources?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="space-y-2">
                  {(lesson as any).resources.map(
                    (resource: any, idx: number) => {
                      const ref = resource.asset?._ref;
                      if (!ref) return null;
                      const [, id, ext] = ref.split("-");
                      const fileUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
                      return (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors group"
                        >
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">
                            {resource.title || "Download file"}
                          </span>
                          <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </a>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <LessonQuiz lessonId={lesson._id} />
            <LessonNotes lessonId={lesson._id} />
            <LessonDiscussion lessonId={lesson._id} />
          </div>

          <LessonBottomNav
            courseId={courseId}
            prevLesson={nav.prevLesson}
            nextLesson={nav.nextLesson}
          />
        </div>
      </div>

      <KeyboardShortcuts
        courseId={courseId}
        prevLessonId={nav.prevLesson?._id || null}
        nextLessonId={nav.nextLesson?._id || null}
      />
      <LessonCompleteButton lessonId={lesson._id} clerkId={user!.id} />
    </div>
  );
}
