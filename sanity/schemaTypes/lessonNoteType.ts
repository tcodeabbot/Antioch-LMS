import { defineField, defineType } from "sanity";

export const lessonNoteType = defineType({
  name: "lessonNote",
  title: "Lesson Note",
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
      title: "Note Content",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      lessonTitle: "lesson.title",
      content: "content",
    },
    prepare({ lessonTitle, content }) {
      return {
        title: lessonTitle || "Lesson",
        subtitle: content?.slice(0, 80) || "",
      };
    },
  },
});
