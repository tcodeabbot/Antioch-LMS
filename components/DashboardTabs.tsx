"use client";

import { useState } from "react";
import { BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/CourseCard";
import { CompletedCertificates } from "@/components/CompletedCertificates";
import Link from "next/link";

interface CourseData {
  course: {
    _id: string;
    title?: string | null;
    [key: string]: unknown;
  };
  progress: number;
}

export function DashboardTabs({
  courses,
  studentName,
}: {
  courses: CourseData[];
  studentName: string;
}) {
  const [activeTab, setActiveTab] = useState<"courses" | "certificates">(
    "courses"
  );

  const completedCount = courses.filter((c) => c.progress >= 100).length;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("courses")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "courses"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" />
          My Courses
          <span
            className={cn(
              "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
              activeTab === "courses"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {courses.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "certificates"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="h-4 w-4" />
          Certificates
          {completedCount > 0 && (
            <span
              className={cn(
                "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                activeTab === "certificates"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {completedCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((item) => (
            <CourseCard
              key={item.course._id}
              course={item.course as any}
              progress={item.progress}
              href={`/dashboard/courses/${item.course._id}`}
            />
          ))}
        </div>
      )}

      {activeTab === "certificates" && (
        <div>
          {completedCount > 0 ? (
            <CompletedCertificates
              courses={courses.map((c) => ({
                courseId: c.course._id,
                courseTitle: c.course.title || "Course",
                progress: c.progress,
              }))}
              studentName={studentName}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                No certificates yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Complete all lessons in a course to earn your certificate of
                completion.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
