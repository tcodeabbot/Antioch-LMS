"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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

interface ExportStudentsButtonProps {
  students: Student[];
}

export function ExportStudentsButton({ students }: ExportStudentsButtonProps) {
  const exportToCSV = () => {
    // Create CSV headers
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Street Address",
      "City",
      "State/Province",
      "Postal Code",
      "Country",
      "Enrollments",
      "Joined Date",
    ];

    // Create CSV rows
    const rows = students.map((student) => [
      student.firstName,
      student.lastName,
      student.email,
      student.phone || "",
      student.address?.street || "",
      student.address?.city || "",
      student.address?.state || "",
      student.address?.postalCode || "",
      student.address?.country || "",
      student.enrollmentCount?.toString() || "0",
      student._createdAt
        ? new Date(student._createdAt).toLocaleDateString()
        : "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `students-export-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    // Format student data for JSON export
    const jsonData = students.map((student) => ({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || "",
      address: {
        street: student.address?.street || "",
        city: student.address?.city || "",
        state: student.address?.state || "",
        postalCode: student.address?.postalCode || "",
        country: student.address?.country || "",
      },
      enrollments: student.enrollmentCount || 0,
      joinedDate: student._createdAt
        ? new Date(student._createdAt).toISOString()
        : "",
    }));

    // Create and download file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `students-export-${Date.now()}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Students
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
