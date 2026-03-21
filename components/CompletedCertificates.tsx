"use client";

import { useState } from "react";
import { Award, Download, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CompletedCourse {
  courseId: string;
  courseTitle: string;
  progress: number;
}

export function CompletedCertificates({
  courses,
  studentName,
}: {
  courses: CompletedCourse[];
  studentName: string;
}) {
  const completed = courses.filter((c) => c.progress >= 100);

  if (completed.length === 0) return null;

  return (
    <div className="space-y-3">
      {completed.map((course) => (
        <CertificateRow
          key={course.courseId}
          courseId={course.courseId}
          courseTitle={course.courseTitle}
          studentName={studentName}
        />
      ))}
    </div>
  );
}

function CertificateRow({
  courseId,
  courseTitle,
  studentName,
}: {
  courseId: string;
  courseTitle: string;
  studentName: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 252);
      doc.rect(0, 0, w, h, "F");

      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(2);
      doc.rect(10, 10, w - 20, h - 20);
      doc.setLineWidth(0.5);
      doc.rect(14, 14, w - 28, h - 28);

      const cornerSize = 8;
      const corners = [
        [16, 16],
        [w - 16 - cornerSize, 16],
        [16, h - 16 - cornerSize],
        [w - 16 - cornerSize, h - 16 - cornerSize],
      ];
      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(0.3);
      corners.forEach(([x, y]) => {
        doc.line(x, y, x + cornerSize, y);
        doc.line(x, y, x, y + cornerSize);
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(114, 0, 0);
      doc.text("CERTIFICATE OF COMPLETION", w / 2, 38, { align: "center" });

      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(w / 2 - 50, 43, w / 2 + 50, 43);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("This is to certify that", w / 2, 58, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(30, 30, 30);
      doc.text(studentName, w / 2, 74, { align: "center" });

      const nameWidth = doc.getTextWidth(studentName);
      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(w / 2 - nameWidth / 2, 77, w / 2 + nameWidth / 2, 77);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("has successfully completed the course", w / 2, 90, {
        align: "center",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(114, 0, 0);
      const titleLines = doc.splitTextToSize(courseTitle, w - 80);
      doc.text(titleLines, w / 2, 105, { align: "center" });

      const dateY = 105 + titleLines.length * 10 + 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Completed on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        w / 2,
        dateY,
        { align: "center" }
      );

      const sigY = h - 40;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(w / 2 - 40, sigY, w / 2 + 40, sigY);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Antioch Christian Resource Center", w / 2, sigY + 5, {
        align: "center",
      });

      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Certificate ID: ${Date.now().toString(36).toUpperCase()}`,
        w / 2,
        h - 18,
        { align: "center" }
      );

      doc.save(
        `certificate-${courseTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`
      );
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Award className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{courseTitle}</h3>
        <p className="text-xs text-muted-foreground">Completed</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {isGenerating ? "Generating..." : "Certificate"}
          </span>
        </button>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="View course"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
