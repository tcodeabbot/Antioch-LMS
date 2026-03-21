import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export interface QuizQuestion {
  question: string;
  questionType: "multipleChoice" | "trueFalse";
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface LessonQuizData {
  lessonId: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  _id: string;
  score: number;
  passed: boolean;
  completedAt: string;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
}

export async function getQuizForLesson(
  lessonId: string
): Promise<LessonQuizData | null> {
  const result = await sanityFetch({
    query: groq`*[_type == "lesson" && _id == $lessonId][0]{
      "lessonId": _id,
      "passingScore": quizPassingScore,
      "questions": quizQuestions
    }`,
    params: { lessonId },
  });

  const data = result.data as {
    lessonId: string;
    passingScore: number | null;
    questions: QuizQuestion[] | null;
  } | null;

  if (!data?.questions || data.questions.length === 0) return null;

  return {
    lessonId: data.lessonId,
    passingScore: data.passingScore ?? 70,
    questions: data.questions,
  };
}

export async function getBestQuizAttempt(
  lessonId: string,
  clerkId: string
): Promise<QuizAttempt | null> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return null;

  const result = await sanityFetch({
    query: groq`*[_type == "quizAttempt" && lesson._ref == $lessonId && student._ref == $studentId] | order(score desc)[0]{
      _id,
      score,
      passed,
      completedAt,
      answers
    }`,
    params: { lessonId, studentId: student._id },
  });

  return result.data as QuizAttempt | null;
}

export async function submitQuizAttempt(
  lessonId: string,
  clerkId: string,
  answers: Array<{
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }>,
  score: number,
  passed: boolean
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  return client.create({
    _type: "quizAttempt",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    answers,
    score,
    passed,
    completedAt: new Date().toISOString(),
  });
}
