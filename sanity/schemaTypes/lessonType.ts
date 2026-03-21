import { defineField, defineType } from "sanity";

export const lessonType = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "The URL for the video player (e.g. YouTube, Vimeo)",
    }),
    defineField({
      name: "loomUrl",
      title: "Loom Share URL",
      type: "url",
      description:
        "The full Loom share URL (e.g., https://www.loom.com/share/...)",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true; // Allow empty value
          try {
            const url = new URL(value);
            if (!url.hostname.endsWith("loom.com")) {
              return "URL must be from loom.com";
            }
            if (!url.pathname.startsWith("/share/")) {
              return "Must be a Loom share URL";
            }
            const videoId = url.pathname.split("/share/")[1];
            if (!/^[a-f0-9-]{32,36}/.test(videoId)) {
              return "Invalid Loom video ID in URL";
            }
            return true;
          } catch {
            return "Please enter a valid URL";
          }
        }),
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      description:
        "Estimated time to complete this lesson in minutes. If left empty, an estimate is calculated automatically.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "resources",
      title: "Resources",
      type: "array",
      description: "Downloadable files for this lesson (PDFs, worksheets, etc.)",
      of: [
        {
          type: "file",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "quizPassingScore",
      title: "Quiz Passing Score (%)",
      type: "number",
      description:
        "Minimum percentage to pass the quiz (e.g. 70). Leave empty if no quiz.",
      validation: (rule) => rule.min(0).max(100),
      group: "quiz",
    }),
    defineField({
      name: "quizQuestions",
      title: "Quiz Questions",
      type: "array",
      group: "quiz",
      of: [{ type: "quizQuestion" }],
    }),
  ],
  groups: [
    { name: "quiz", title: "Quiz" },
  ],
});