"use client";

import { AdminDataTable, type Column } from "./AdminDataTable";
import { GraduationCap, User, BookOpen, DollarSign, Calendar } from "lucide-react";
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

export function EnrollmentsTable({ enrollments }: { enrollments: Enrollment[] }) {
  const columns: Column<Enrollment>[] = [
    {
      key: "student",
      label: "Student",
      sortable: true,
      getValue: (row) =>
        row.student
          ? `${row.student.firstName} ${row.student.lastName}`.toLowerCase()
          : "",
      render: (row) =>
        row.student ? (
          <div className="flex items-center gap-3">
            {row.student.imageUrl ? (
              <Image
                src={row.student.imageUrl}
                alt={`${row.student.firstName} ${row.student.lastName}`}
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
              <p className="text-sm font-medium text-foreground whitespace-nowrap">
                {row.student.firstName} {row.student.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.student.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
      getValue: (row) => row.course?.title?.toLowerCase() ?? "",
      render: (row) =>
        row.course ? (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {row.course.title}
              </p>
              {row.course.category && (
                <p className="text-xs text-muted-foreground">
                  {row.course.category.title}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => {
        const dollars = (row.amount || 0) / 100;
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              ${dollars.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        );
      },
    },
    {
      key: "paymentId",
      label: "Payment ID",
      sortable: false,
      hiddenOnMobile: true,
      render: (row) => (
        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {row.paymentId || "N/A"}
        </code>
      ),
    },
    {
      key: "enrolledAt",
      label: "Enrolled At",
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
        "course.title",
      ]}
      searchPlaceholder="Search by student, email, or course..."
      emptyIcon={
        <GraduationCap className="h-16 w-16 text-muted-foreground" />
      }
      emptyTitle="No enrollments yet"
      emptyDescription="Enrollments will appear here once students enroll in courses."
    />
  );
}
