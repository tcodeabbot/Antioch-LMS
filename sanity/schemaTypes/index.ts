import type { SchemaTypeDefinition } from "sanity";

import { moduleType } from "./moduleType";
import { lessonType } from "./lessonType";
import { blockContent } from "./blockContent";
import { instructorType } from "./instructorType";
import { courseType } from "./courseType";
import { studentType } from "./studentType";
import { enrollmentType } from "./enrollmentType";
import { categoryType } from "./categoryType";
import { lessonCompletionType } from "./lessonCompletionType";
import { lessonNoteType } from "./lessonNoteType";
import { lessonCommentType } from "./lessonCommentType";
import { quizQuestionType, quizAttemptType } from "./quizType";
import { lessonBookmarkType } from "./lessonBookmarkType";
import { studySessionType } from "./studySessionType";
import { notificationType } from "./notificationType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContent,
    moduleType,
    lessonType,
    instructorType,
    courseType,
    studentType,
    enrollmentType,
    categoryType,
    lessonCompletionType,
    lessonNoteType,
    lessonCommentType,
    quizQuestionType,
    quizAttemptType,
    lessonBookmarkType,
    studySessionType,
    notificationType,
  ],
};