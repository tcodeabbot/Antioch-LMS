"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Bell, Loader2, Check, X, Send } from "lucide-react";
import { sendBulkNotificationAction } from "@/app/actions/adminNotificationActions";
import { cn } from "@/lib/utils";

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

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function BulkStudentActions({
  students,
  selectedIds,
}: {
  students: Student[];
  selectedIds: Set<string>;
}) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selected = students.filter((s) => selectedIds.has(s._id));

  const exportCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Country",
      "Enrollments",
      "Joined",
    ];
    const rows = selected.map((s) => [
      s.firstName,
      s.lastName,
      s.email,
      s.phone || "",
      s.address?.city || "",
      s.address?.state || "",
      s.address?.country || "",
      String(s.enrollmentCount || 0),
      s._createdAt ? new Date(s._createdAt).toLocaleDateString() : "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    downloadFile(csv, `students-selected-${Date.now()}.csv`, "text/csv");
  };

  const handleSendNotification = () => {
    if (!title.trim()) return;
    setResult(null);
    startTransition(async () => {
      const ids = Array.from(selectedIds);
      const res = await sendBulkNotificationAction(ids, title, message);
      if (res.success) {
        setResult({
          type: "success",
          text: `Notification sent to ${res.count} student${res.count !== 1 ? "s" : ""}`,
        });
        setTitle("");
        setMessage("");
        setTimeout(() => {
          setShowNotifyModal(false);
          setResult(null);
        }, 2000);
      } else {
        setResult({ type: "error", text: res.error || "Failed" });
      }
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setShowNotifyModal(true)}
      >
        <Bell className="h-3.5 w-3.5" />
        Notify
      </Button>

      {/* Notification modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Send Notification to {selectedIds.size} Student
                {selectedIds.size !== 1 ? "s" : ""}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setShowNotifyModal(false);
                  setResult(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {result && (
              <div
                className={cn(
                  "px-4 py-2.5 text-sm flex items-center gap-2",
                  result.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                )}
              >
                {result.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {result.text}
              </div>
            )}

            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Optional message body..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNotifyModal(false);
                  setResult(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!title.trim() || isPending}
                onClick={handleSendNotification}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
