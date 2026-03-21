import { defineField, defineType } from "sanity";

export const notificationType = defineType({
  name: "notification",
  title: "Notification",
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
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Discussion Reply", value: "discussion_reply" },
          { title: "Streak Milestone", value: "streak_milestone" },
          { title: "Course Update", value: "course_update" },
          { title: "Streak Reminder", value: "streak_reminder" },
          { title: "Course Completed", value: "course_completed" },
          { title: "General", value: "general" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "string",
      description: "Optional URL to navigate to when clicked",
    }),
    defineField({
      name: "read",
      title: "Read",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      read: "read",
      createdAt: "createdAt",
    },
    prepare({ title, type, read, createdAt }) {
      return {
        title: `${read ? "" : "● "}${title}`,
        subtitle: `${type} — ${createdAt ? new Date(createdAt).toLocaleDateString() : ""}`,
      };
    },
  },
});
