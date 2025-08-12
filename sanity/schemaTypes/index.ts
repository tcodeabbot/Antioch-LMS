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
  ],
};