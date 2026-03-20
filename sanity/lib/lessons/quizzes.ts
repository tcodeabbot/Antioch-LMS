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

export interface Quiz {
  _id: string;
  title: string;
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

export async function getQuizForLesson(lessonId: string): Promise<Quiz | null> {
  const result = await sanityFetch({
    query: groq`*[_type == "quiz" && lesson._ref == $lessonId][0]{
      _id,
      title,
      passingScore,
      questions
    }`,
    params: { lessonId },
  });

  return result.data as Quiz | null;
}

export async function getBestQuizAttempt(
  quizId: string,
  clerkId: string
): Promise<QuizAttempt | null> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return null;

  const result = await sanityFetch({
    query: groq`*[_type == "quizAttempt" && quiz._ref == $quizId && student._ref == $studentId] | order(score desc)[0]{
      _id,
      score,
      passed,
      completedAt,
      answers
    }`,
    params: { quizId, studentId: student._id },
  });

  return result.data as QuizAttempt | null;
}

export async function submitQuizAttempt(
  quizId: string,
  clerkId: string,
  answers: Array<{ questionIndex: number; selectedAnswer: string; isCorrect: boolean }>,
  score: number,
  passed: boolean
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  return client.create({
    _type: "quizAttempt",
    student: { _type: "reference", _ref: student._id },
    quiz: { _type: "reference", _ref: quizId },
    answers,
    score,
    passed,
    completedAt: new Date().toISOString(),
  });
}
