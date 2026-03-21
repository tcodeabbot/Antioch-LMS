"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { Users, Mail, GraduationCap, Calendar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { EngagementLevel } from "@/sanity/lib/admin/getAllStudents";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  enrollmentCount?: number;
  _createdAt?: string;
  engagement?: EngagementLevel;
}

const engagementConfig: Record<
  EngagementLevel,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  low: {
    label: "Low",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400",
  },
};

export function EngagementBadge({ level }: { level: EngagementLevel }) {
  const config = engagementConfig[level];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function StudentsTable({ students }: { students: Student[] }) {
  const router = useRouter();

  const columns: Column<Student>[] = [
    {
      key: "firstName",
      label: "Student",
      sortable: true,
      getValue: (row) => `${row.firstName} ${row.lastName}`.toLowerCase(),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <Image
              src={row.imageUrl}
              alt={`${row.firstName} ${row.lastName}`}
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
            {row.firstName} {row.lastName}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate max-w-[200px]">{row.email}</span>
        </div>
      ),
    },
    {
      key: "engagement",
      label: "Engagement",
      sortable: true,
      getValue: (row) => {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2, inactive: 3 };
        return order[row.engagement || "inactive"];
      },
      render: (row) =>
        row.engagement ? (
          <EngagementBadge level={row.engagement} />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: "enrollmentCount",
      label: "Enrollments",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {row.enrollmentCount || 0}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: false,
      hiddenOnMobile: true,
      mobileLabel: false,
      render: (row) => (
        <span className="text-sm text-foreground">
          {row.phone || "Not provided"}
        </span>
      ),
    },
    {
      key: "_createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <Calendar className="h-4 w-4 shrink-0" />
          {row._createdAt
            ? new Date(row._createdAt).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={students}
      rowKey={(row) => row._id}
      searchableFields={["firstName", "lastName", "email"]}
      searchPlaceholder="Search students by name or email..."
      onRowClick={(row) => router.push(`/admin/students/${row._id}`)}
      emptyIcon={<Users className="h-16 w-16 text-muted-foreground" />}
      emptyTitle="No students yet"
      emptyDescription="Students will appear here once they enroll in courses."
    />
  );
}
