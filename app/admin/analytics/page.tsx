import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, GraduationCap } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  enrollmentCount?: number;
  totalRevenue?: number;
  category?: {
    title: string;
  };
}

export default async function AdminAnalyticsPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const stats = await getCourseStats();

  const revenueInDollars = stats.totalRevenue || 0;
  
  // Calculate average revenue per enrollment
  const avgRevenuePerEnrollment = 
    stats.totalEnrollments > 0 
      ? revenueInDollars / stats.totalEnrollments 
      : 0;

  // Calculate average enrollments per course
  const avgEnrollmentsPerCourse = 
    stats.totalCourses > 0 
      ? stats.totalEnrollments / stats.totalCourses 
      : 0;

  // Get top courses by enrollment
  const topCourses = (stats.courses || [])
    .sort((a: Course, b: Course) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Platform performance and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-foreground">
                ${revenueInDollars.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Avg Revenue/Enrollment
              </p>
              <p className="text-3xl font-bold text-foreground">
                ${avgRevenuePerEnrollment.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Avg Enrollments/Course
              </p>
              <p className="text-3xl font-bold text-foreground">
                {avgEnrollmentsPerCourse.toFixed(1)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalStudents > 0
                  ? ((stats.totalEnrollments / stats.totalStudents) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Top Courses by Enrollment
        </h2>
        {topCourses.length > 0 ? (
          <div className="space-y-4">
            {topCourses.map((course: Course, index: number) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    {course.category && (
                      <p className="text-sm text-muted-foreground">
                        {course.category.title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Enrollments</p>
                    <p className="font-semibold text-foreground">
                      {course.enrollmentCount || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-foreground">
                      ${((course.totalRevenue || 0) / 100).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No courses available</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Students
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalEnrollments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

