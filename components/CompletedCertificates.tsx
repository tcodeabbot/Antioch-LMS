"use client";

import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import Link from "next/link";

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
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold">Your Certificates</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {completed.map((course) => (
          <CertificateCard
            key={course.courseId}
            courseId={course.courseId}
            courseTitle={course.courseTitle}
            studentName={studentName}
          />
        ))}
      </div>
    </div>
  );
}

function CertificateCard({
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
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">
            {courseTitle}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Course completed
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="text-xs text-primary hover:underline"
            >
              View Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
