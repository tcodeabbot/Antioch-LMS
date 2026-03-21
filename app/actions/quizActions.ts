"use server";

import {
  getQuizForLesson,
  getBestQuizAttempt,
  submitQuizAttempt,
} from "@/sanity/lib/lessons/quizzes";

export async function getQuizForLessonAction(lessonId: string) {
  try {
    const quiz = await getQuizForLesson(lessonId);
    return { success: true, data: quiz };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return { success: false, data: null };
  }
}

export async function getBestQuizAttemptAction(
  lessonId: string,
  clerkId: string
) {
  try {
    const attempt = await getBestQuizAttempt(lessonId, clerkId);
    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    return { success: false, data: null };
  }
}

export async function submitQuizAttemptAction(
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
  try {
    await submitQuizAttempt(lessonId, clerkId, answers, score, passed);
    return { success: true };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}
