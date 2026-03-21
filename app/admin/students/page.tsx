import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAllStudents } from "@/sanity/lib/admin/getAllStudents";
import { Users } from "lucide-react";
import { ExportStudentsButton } from "@/components/admin/ExportStudentsButton";
import { StudentsTable } from "@/components/admin/StudentsTable";

export default async function AdminStudentsPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const students = await getAllStudents();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Students
          </h1>
          <p className="text-muted-foreground">
            View and manage all enrolled students
          </p>
        </div>
        <ExportStudentsButton students={students} />
      </div>

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

      <StudentsTable students={students} />
    </div>
  );
}
