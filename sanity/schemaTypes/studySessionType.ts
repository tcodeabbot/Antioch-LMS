import { defineField, defineType } from "sanity";

export const studySessionType = defineType({
  name: "studySession",
  title: "Study Session",
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
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "startedAt",
      title: "Started At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      lessonTitle: "lesson.title",
      courseTitle: "course.title",
      duration: "durationSeconds",
      startedAt: "startedAt",
    },
    prepare({ lessonTitle, courseTitle, duration, startedAt }) {
      const mins = Math.round((duration || 0) / 60);
      return {
        title: `${lessonTitle || "Lesson"} (${mins}m)`,
        subtitle: `${courseTitle || "Course"} — ${startedAt ? new Date(startedAt).toLocaleDateString() : ""}`,
      };
    },
  },
});
