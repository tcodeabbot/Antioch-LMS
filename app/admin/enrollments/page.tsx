import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAllEnrollments } from "@/sanity/lib/admin/getAllEnrollments";
import { GraduationCap, Calendar, DollarSign, User, BookOpen } from "lucide-react";
import Image from "next/image";

interface Enrollment {
  _id: string;
  amount?: number;
  paymentId?: string;
  enrolledAt?: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  course?: {
    title: string;
    category?: {
      title: string;
    };
  };
}

export default async function AdminEnrollmentsPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const enrollments = await getAllEnrollments();
  const totalRevenue = enrollments.reduce(
    (sum: number, enrollment: Enrollment) => sum + (enrollment.amount || 0),
    0
  ) / 100;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Enrollments
        </h1>
        <p className="text-muted-foreground">
          View all course enrollments and payments
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      {enrollments.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrolled At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enrollment: Enrollment) => {
                  const amountInDollars = (enrollment.amount || 0) / 100;
                  return (
                    <tr
                      key={enrollment._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enrollment.student ? (
                          <div className="flex items-center gap-3">
                            {enrollment.student.imageUrl ? (
                              <Image
                                src={enrollment.student.imageUrl}
                                alt={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {enrollment.student.firstName}{" "}
                                {enrollment.student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.student.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.course ? (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {enrollment.course.title}
                              </p>
                              {enrollment.course.category && (
                                <p className="text-xs text-muted-foreground">
                                  {enrollment.course.category.title}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            ${amountInDollars.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {enrollment.paymentId || "N/A"}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {enrollment.enrolledAt
                            ? new Date(enrollment.enrolledAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No enrollments yet
          </h3>
          <p className="text-muted-foreground">
            Enrollments will appear here once students enroll in courses.
          </p>
        </div>
      )}
    </div>
  );
}

