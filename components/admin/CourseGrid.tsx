"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Users,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface LessonHealth {
  _id: string;
  description?: string;
  videoUrl?: string;
  loomUrl?: string;
  quizQuestionCount?: number;
}

interface Module {
  lessonCount?: number;
  title?: string;
  order?: number;
  lessons?: LessonHealth[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  isFree?: boolean;
  totalRevenue?: number;
  enrollmentCount?: number;
  description?: string;
  publicationStatus?: "draft" | "published" | "archived";
  category?: {
    title: string;
  };
  instructor?: {
    name: string;
  };
  modules?: Module[];
}

function getContentWarnings(course: Course): string[] {
  const w: string[] = [];
  const desc = (course.description || "").trim();
  if (!desc || desc.length < 8) w.push("Short or missing course description");

  const mods = course.modules || [];
  if (mods.length === 0) w.push("No modules");

  let lessonsNoVideo = 0;
  let lessonsNoQuiz = 0;
  let lessonsNoDesc = 0;

  for (const m of mods) {
    if ((m.lessonCount || 0) === 0) {
      w.push(`Empty module: ${m.title || "Untitled"}`);
    }
    for (const l of m.lessons || []) {
      const hasVideo = Boolean(l.videoUrl || l.loomUrl);
      if (!hasVideo) lessonsNoVideo++;
      const qc = l.quizQuestionCount ?? 0;
      if (qc === 0) lessonsNoQuiz++;
      const ld = (l.description || "").trim();
      if (!ld) lessonsNoDesc++;
    }
  }

  if (lessonsNoVideo > 0) w.push(`${lessonsNoVideo} lesson(s) without video`);
  if (lessonsNoQuiz > 0) w.push(`${lessonsNoQuiz} lesson(s) without quiz`);
  if (lessonsNoDesc > 0) w.push(`${lessonsNoDesc} lesson(s) without description`);

  return w.slice(0, 8);
}

type SortOption = "title" | "enrollments" | "revenue" | "price" | "lessons";

const PAGE_SIZE = 9;

export function CourseGrid({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("enrollments");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category?.title?.toLowerCase().includes(q) ||
        c.instructor?.name?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "enrollments":
          return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        case "revenue":
          return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        case "price":
          return (b.price || 0) - (a.price || 0);
        case "lessons": {
          const aLessons =
            a.modules?.reduce((s, m) => s + (m.lessonCount || 0), 0) || 0;
          const bLessons =
            b.modules?.reduce((s, m) => s + (m.lessonCount || 0), 0) || 0;
          return bLessons - aLessons;
        }
        default:
          return 0;
      }
    });
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by title, category, or instructor..."
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(val) => {
            setSortBy(val as SortOption);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enrollments">Most Enrolled</SelectItem>
            <SelectItem value="revenue">Highest Revenue</SelectItem>
            <SelectItem value="price">Highest Price</SelectItem>
            <SelectItem value="lessons">Most Lessons</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {search ? "No results found" : "No courses yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {search
              ? `No courses match "${search}". Try a different search.`
              : "Create your first course in Sanity Studio to get started."}
          </p>
          {!search && (
            <Link
              href="/studio"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Studio
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => {
              const courseRevenue = (course.totalRevenue || 0) / 100;
              const totalLessons =
                course.modules?.reduce(
                  (sum, module) => sum + (module.lessonCount || 0),
                  0
                ) || 0;

              const warnings = getContentWarnings(course);
              const status = course.publicationStatus || "published";

              return (
                <div
                  key={course._id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        status === "published"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : status === "draft"
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status}
                    </span>
                    {warnings.length > 0 && (
                      <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    {course.category && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {course.category.title}
                      </p>
                    )}
                    {course.instructor && (
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructor.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Enrollments</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {course.enrollmentCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Lessons</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {totalLessons}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenue</span>
                      </div>
                      <span className="font-medium text-foreground">
                        $
                        {courseRevenue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium text-foreground">
                        {course.isFree
                          ? "Free"
                          : `$${(course.price || 0) / 100}`}
                      </span>
                    </div>
                  </div>

                  {warnings.length > 0 && (
                    <ul className="mb-4 text-xs text-amber-800 dark:text-amber-200/90 space-y-1 border border-amber-500/30 rounded-md p-2 bg-amber-500/5">
                      {warnings.map((msg, i) => (
                        <li key={`${course._id}-w-${i}`} className="flex gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-80" />
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/courses/${course._id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/courses/${course.slug}`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-border hover:bg-accent transition-colors"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {safePage * PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} of{" "}
                {sorted.length}
                {search && ` (filtered from ${courses.length})`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2 min-w-[80px] text-center">
                  {safePage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage >= totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
