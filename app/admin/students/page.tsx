import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAllStudents } from "@/sanity/lib/admin/getAllStudents";
import { Users, Mail, Calendar, GraduationCap } from "lucide-react";
import Image from "next/image";

export default async function AdminStudentsPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const students = await getAllStudents();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Students
        </h1>
        <p className="text-muted-foreground">
          View and manage all enrolled students
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Students
            </p>
            <p className="text-2xl font-bold text-foreground">
              {students.length}
            </p>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {students.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student: any) => (
                  <tr
                    key={student._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {student.imageUrl ? (
                          <Image
                            src={student.imageUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {student.enrollmentCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {student._createdAt
                          ? new Date(student._createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No students yet
          </h3>
          <p className="text-muted-foreground">
            Students will appear here once they enroll in courses.
          </p>
        </div>
      )}
    </div>
  );
}

