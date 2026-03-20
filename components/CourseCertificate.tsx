"use client";

import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  progress: number;
}

export function CourseCertificate({
  studentName,
  courseTitle,
  completionDate,
  progress,
}: CourseCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isComplete = progress >= 100;

  async function handleDownload() {
    if (!isComplete || isGenerating) return;
    setIsGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(255, 255, 252);
      doc.rect(0, 0, w, h, "F");

      // Outer border
      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(2);
      doc.rect(10, 10, w - 20, h - 20);

      // Inner border
      doc.setLineWidth(0.5);
      doc.rect(14, 14, w - 28, h - 28);

      // Corner ornaments
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

      // Header: "CERTIFICATE OF COMPLETION"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(114, 0, 0);
      doc.text("CERTIFICATE OF COMPLETION", w / 2, 38, { align: "center" });

      // Decorative line
      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(w / 2 - 50, 43, w / 2 + 50, 43);

      // "This is to certify that"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("This is to certify that", w / 2, 58, { align: "center" });

      // Student name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(30, 30, 30);
      doc.text(studentName, w / 2, 74, { align: "center" });

      // Underline for name
      const nameWidth = doc.getTextWidth(studentName);
      doc.setDrawColor(114, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(w / 2 - nameWidth / 2, 77, w / 2 + nameWidth / 2, 77);

      // "has successfully completed"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("has successfully completed the course", w / 2, 90, {
        align: "center",
      });

      // Course title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(114, 0, 0);
      const titleLines = doc.splitTextToSize(courseTitle, w - 80);
      doc.text(titleLines, w / 2, 105, { align: "center" });

      // Date
      const dateY = 105 + titleLines.length * 10 + 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Completed on ${completionDate}`, w / 2, dateY, {
        align: "center",
      });

      // Signature line
      const sigY = h - 40;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(w / 2 - 40, sigY, w / 2 + 40, sigY);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Antioch Christian Resource Center", w / 2, sigY + 5, {
        align: "center",
      });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Certificate ID: ${Date.now().toString(36).toUpperCase()}`,
        w / 2,
        h - 18,
        { align: "center" }
      );

      doc.save(`certificate-${courseTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-5 sm:p-6",
        isComplete
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800"
          : "border-border bg-muted/30"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
            isComplete
              ? "bg-amber-100 dark:bg-amber-900/40"
              : "bg-muted"
          )}
        >
          <Award
            className={cn(
              "h-5 w-5",
              isComplete
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">
            {isComplete ? "Course Complete!" : "Course Certificate"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isComplete
              ? "Congratulations! Download your certificate of completion."
              : `Complete all lessons to earn your certificate. (${progress}% done)`}
          </p>
          {isComplete && (
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Download Certificate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
