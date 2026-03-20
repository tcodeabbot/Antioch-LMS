import { defineField, defineType } from "sanity";

export const lessonCommentType = defineType({
  name: "lessonComment",
  title: "Lesson Comment",
  type: "document",
  fields: [
    defineField({
      name: "student",
      title: "Student",
      type: "reference",
      to: [{ type: "student" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lesson",
      title: "Lesson",
      type: "reference",
      to: [{ type: "lesson" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Comment",
      type: "text",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      studentName: "student.firstName",
      content: "content",
      createdAt: "createdAt",
    },
    prepare({ studentName, content, createdAt }) {
      return {
        title: studentName || "Student",
        subtitle: `${createdAt ? new Date(createdAt).toLocaleDateString() : ""} — ${content?.slice(0, 60) || ""}`,
      };
    },
  },
});
