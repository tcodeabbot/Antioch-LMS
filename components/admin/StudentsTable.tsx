"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { Users, Mail, GraduationCap, Calendar } from "lucide-react";
import Image from "next/image";

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
      key: "phone",
      label: "Phone",
      sortable: false,
      hiddenOnMobile: true,
      render: (row) => (
        <span className="text-sm text-foreground">
          {row.phone || "Not provided"}
        </span>
      ),
    },
    {
      key: "address",
      label: "Location",
      sortable: false,
      hiddenOnMobile: true,
      getValue: (row) => {
        const a = row.address;
        if (!a) return "";
        return [a.city, a.state, a.country].filter(Boolean).join(", ");
      },
      render: (row) => {
        if (!row.address) {
          return (
            <span className="text-sm text-muted-foreground">Not provided</span>
          );
        }
        const { city, state, country } = row.address;
        return (
          <div className="text-sm text-foreground">
            <div>
              {city}
              {city && state ? ", " : ""}
              {state}
            </div>
            {country && (
              <div className="text-muted-foreground">{country}</div>
            )}
          </div>
        );
      },
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
      emptyIcon={
        <Users className="h-16 w-16 text-muted-foreground" />
      }
      emptyTitle="No students yet"
      emptyDescription="Students will appear here once they enroll in courses."
    />
  );
}
