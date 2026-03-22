import { defineField, defineType } from "sanity";

export const lessonCommentType = defineType({
  name: "lessonComment",
  title: "Lesson Comment",
  type: "document",
  fields: [
    defineField({
      name: "authorType",
      title: "Author",
      type: "string",
      options: {
        list: [
          { title: "Student", value: "student" },
          { title: "Admin / Staff", value: "admin" },
        ],
        layout: "radio",
      },
      initialValue: "student",
      description: "Staff replies show a badge in the lesson discussion.",
    }),
    defineField({
      name: "student",
      title: "Student",
      type: "reference",
      to: [{ type: "student" }],
      description: "Required for learner comments. Omitted for staff replies.",
      hidden: ({ parent }) => parent?.authorType === "admin",
    }),
    defineField({
      name: "adminClerkId",
      title: "Admin Clerk user ID",
      type: "string",
      description: "Set when posting as staff from the admin panel.",
      hidden: ({ parent }) => parent?.authorType !== "admin",
    }),
    defineField({
      name: "lesson",
      title: "Lesson",
      type: "reference",
      to: [{ type: "lesson" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parentComment",
      title: "Parent Comment",
      type: "reference",
      to: [{ type: "lessonComment" }],
      description: "If set, this comment is a reply to another comment.",
    }),
    defineField({
      name: "content",
      title: "Comment",
      type: "text",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "pinned",
      title: "Pinned",
      type: "boolean",
      initialValue: false,
      description: "Pinned threads appear highlighted (when supported in UI).",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "editedAt",
      title: "Edited At",
      type: "datetime",
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      if (!doc || typeof doc !== "object") return true;
      const d = doc as {
        authorType?: string;
        student?: { _ref?: string };
        adminClerkId?: string;
      };
      const at = d.authorType || "student";
      if (at === "admin") {
        if (!d.adminClerkId?.trim()) {
          return "Admin Clerk user ID is required for staff replies";
        }
      } else if (!d.student?._ref) {
        return "Student is required for learner comments";
      }
      return true;
    }),
  preview: {
    select: {
      studentName: "student.firstName",
      content: "content",
      createdAt: "createdAt",
      authorType: "authorType",
    },
    prepare({ studentName, content, createdAt, authorType }) {
      const label = authorType === "admin" ? "Staff" : studentName || "Student";
      return {
        title: label,
        subtitle: `${createdAt ? new Date(createdAt).toLocaleDateString() : ""} — ${content?.slice(0, 60) || ""}`,
      };
    },
  },
});
