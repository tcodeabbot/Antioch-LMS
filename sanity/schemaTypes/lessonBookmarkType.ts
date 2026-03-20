import { defineField, defineType } from "sanity";

export const lessonBookmarkType = defineType({
  name: "lessonBookmark",
  title: "Lesson Bookmark",
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
      name: "course",
      title: "Course",
      type: "reference",
      to: [{ type: "course" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Bookmarked At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      lessonTitle: "lesson.title",
      courseTitle: "course.title",
    },
    prepare({ lessonTitle, courseTitle }) {
      return {
        title: lessonTitle || "Lesson",
        subtitle: courseTitle || "Course",
      };
    },
  },
});
