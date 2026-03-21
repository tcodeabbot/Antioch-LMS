"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { Users, Mail, DollarSign, Calendar } from "lucide-react";
import Image from "next/image";

interface Enrollment {
  _id: string;
  enrolledAt?: string;
  amount?: number;
  student?: {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
}

export function CourseEnrollmentsTable({
  enrollments,
}: {
  enrollments: Enrollment[];
}) {
  const router = useRouter();

  const columns: Column<Enrollment>[] = [
    {
      key: "student",
      label: "Student",
      sortable: true,
      getValue: (row) =>
        row.student
          ? `${row.student.firstName} ${row.student.lastName}`.toLowerCase()
          : "",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.student?.imageUrl ? (
            <Image
              src={row.student.imageUrl}
              alt={`${row.student.firstName} ${row.student.lastName}`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          )}
          <p className="text-sm font-medium text-foreground whitespace-nowrap">
            {row.student?.firstName} {row.student?.lastName}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      getValue: (row) => row.student?.email?.toLowerCase() ?? "",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate max-w-[220px]">
            {row.student?.email || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount Paid",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            ${((row.amount || 0) / 100).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ),
      getValue: (row) => row.amount || 0,
    },
    {
      key: "enrolledAt",
      label: "Enrolled Date",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <Calendar className="h-4 w-4 shrink-0" />
          {row.enrolledAt
            ? new Date(row.enrolledAt).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={enrollments}
      rowKey={(row) => row._id}
      searchableFields={[
        "student.firstName",
        "student.lastName",
        "student.email",
      ]}
      searchPlaceholder="Search enrolled students..."
      onRowClick={(row) => {
        if (row.student?._id) {
          router.push(`/admin/students/${row.student._id}`);
        }
      }}
      emptyIcon={<Users className="h-16 w-16 text-muted-foreground" />}
      emptyTitle="No enrollments yet"
      emptyDescription="This course doesn't have any enrolled students yet."
    />
  );
}
