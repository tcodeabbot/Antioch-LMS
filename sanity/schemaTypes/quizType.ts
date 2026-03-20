import { defineField, defineType } from "sanity";

export const quizQuestionType = defineType({
  name: "quizQuestion",
  title: "Quiz Question",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "questionType",
      title: "Question Type",
      type: "string",
      options: {
        list: [
          { title: "Multiple Choice", value: "multipleChoice" },
          { title: "True / False", value: "trueFalse" },
        ],
      },
      initialValue: "multipleChoice",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Answer options. For True/False questions, leave empty (True/False are generated automatically).",
    }),
    defineField({
      name: "correctAnswer",
      title: "Correct Answer",
      type: "string",
      description:
        'The correct answer text. Must match one of the options exactly (or "True"/"False" for T/F questions).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "explanation",
      title: "Explanation",
      type: "text",
      description: "Optional explanation shown after the student answers.",
    }),
  ],
  preview: {
    select: { question: "question", questionType: "questionType" },
    prepare({ question, questionType }) {
      return {
        title: question || "Untitled Question",
        subtitle: questionType === "trueFalse" ? "True / False" : "Multiple Choice",
      };
    },
  },
});

export const quizType = defineType({
  name: "quiz",
  title: "Quiz",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lesson",
      title: "Lesson",
      type: "reference",
      to: [{ type: "lesson" }],
      description: "The lesson this quiz belongs to.",
    }),
    defineField({
      name: "passingScore",
      title: "Passing Score (%)",
      type: "number",
      description: "Minimum percentage to pass (e.g. 70 for 70%).",
      initialValue: 70,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "questions",
      title: "Questions",
      type: "array",
      of: [{ type: "quizQuestion" }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title", lessonTitle: "lesson.title" },
    prepare({ title, lessonTitle }) {
      return {
        title: title || "Untitled Quiz",
        subtitle: lessonTitle ? `Lesson: ${lessonTitle}` : "No lesson assigned",
      };
    },
  },
});

export const quizAttemptType = defineType({
  name: "quizAttempt",
  title: "Quiz Attempt",
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
      name: "quiz",
      title: "Quiz",
      type: "reference",
      to: [{ type: "quiz" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answers",
      title: "Answers",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "questionIndex", type: "number", title: "Question Index" }),
            defineField({ name: "selectedAnswer", type: "string", title: "Selected Answer" }),
            defineField({ name: "isCorrect", type: "boolean", title: "Is Correct" }),
          ],
        },
      ],
    }),
    defineField({
      name: "score",
      title: "Score (%)",
      type: "number",
    }),
    defineField({
      name: "passed",
      title: "Passed",
      type: "boolean",
    }),
    defineField({
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    }),
  ],
  preview: {
    select: { quizTitle: "quiz.title", score: "score", passed: "passed" },
    prepare({ quizTitle, score, passed }) {
      return {
        title: quizTitle || "Quiz",
        subtitle: `Score: ${score ?? 0}% — ${passed ? "Passed" : "Failed"}`,
      };
    },
  },
});
