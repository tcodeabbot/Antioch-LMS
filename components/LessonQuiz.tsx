"use client";

import { useState, useEffect, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getQuizForLessonAction,
  getBestQuizAttemptAction,
  submitQuizAttemptAction,
} from "@/app/actions/quizActions";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonQuizData, QuizAttempt, QuizQuestion } from "@/sanity/lib/lessons/quizzes";

interface LessonQuizProps {
  lessonId: string;
}

type QuizState = "loading" | "ready" | "taking" | "reviewing";

export function LessonQuiz({ lessonId }: LessonQuizProps) {
  const { user } = useUser();
  const [quiz, setQuiz] = useState<LessonQuizData | null>(null);
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Array<{ isCorrect: boolean; correctAnswer: string }> | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getQuizForLessonAction(lessonId).then(async (res) => {
      if (res.success && res.data) {
        setQuiz(res.data);
        const attemptRes = await getBestQuizAttemptAction(lessonId, user.id);
        if (attemptRes.success && attemptRes.data) {
          setBestAttempt(attemptRes.data);
        }
        setQuizState("ready");
      } else {
        setQuizState("ready");
      }
    });
  }, [lessonId, user?.id]);

  if (quizState === "loading" || !quiz) return null;

  const questions = quiz.questions || [];
  if (questions.length === 0) return null;

  function getOptions(q: QuizQuestion): string[] {
    if (q.questionType === "trueFalse") return ["True", "False"];
    return q.options || [];
  }

  function handleSelectAnswer(qIndex: number, answer: string) {
    if (quizState !== "taking") return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  }

  function handleStartQuiz() {
    setSelectedAnswers({});
    setResults(null);
    setScore(null);
    setPassed(null);
    setQuizState("taking");
    setIsOpen(true);
  }

  function handleSubmitQuiz() {
    if (!user?.id || !quiz) return;

    const questionResults = questions.map((q, i) => ({
      questionIndex: i,
      selectedAnswer: selectedAnswers[i] || "",
      isCorrect: (selectedAnswers[i] || "") === q.correctAnswer,
      correctAnswer: q.correctAnswer,
    }));

    const correct = questionResults.filter((r) => r.isCorrect).length;
    const pct = Math.round((correct / questions.length) * 100);
    const didPass = pct >= (quiz.passingScore || 70);

    setResults(questionResults);
    setScore(pct);
    setPassed(didPass);
    setQuizState("reviewing");

    startTransition(async () => {
      await submitQuizAttemptAction(
        lessonId,
        user!.id,
        questionResults.map(({ questionIndex, selectedAnswer, isCorrect }) => ({
          questionIndex,
          selectedAnswer,
          isCorrect,
        })),
        pct,
        didPass
      );
      const updated = await getBestQuizAttemptAction(lessonId, user!.id);
      if (updated.success && updated.data) setBestAttempt(updated.data);
    });
  }

  const allAnswered = questions.every((_, i) => selectedAnswers[i] !== undefined);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <ClipboardCheck className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1">
          Lesson Quiz
          {bestAttempt && (
            <span className={cn(
              "ml-2 text-xs",
              bestAttempt.passed ? "text-emerald-600" : "text-amber-600"
            )}>
              Best: {bestAttempt.score}%
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {quizState === "ready" && (
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-medium">Lesson Quiz</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {questions.length} question{questions.length !== 1 ? "s" : ""} · Passing score: {quiz.passingScore}%
                </p>
              </div>
              {bestAttempt && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                  bestAttempt.passed
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                )}>
                  {bestAttempt.passed ? <Trophy className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  Best score: {bestAttempt.score}% — {bestAttempt.passed ? "Passed" : "Not passed"}
                </div>
              )}
              <button
                onClick={handleStartQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
              >
                {bestAttempt ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>
          )}

          {(quizState === "taking" || quizState === "reviewing") && (
            <div className="divide-y divide-border">
              {questions.map((q, qIndex) => {
                const options = getOptions(q);
                const selected = selectedAnswers[qIndex];
                const result = results?.[qIndex];

                return (
                  <div key={qIndex} className="p-4 sm:p-6">
                    <div className="flex gap-3 mb-4">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                    </div>

                    <div className="space-y-2 ml-9">
                      {options.map((option) => {
                        const isSelected = selected === option;
                        const isReviewing = quizState === "reviewing";
                        const isCorrectOption = option === q.correctAnswer;

                        let optionClass = "border-border hover:bg-muted/50 cursor-pointer";
                        if (isReviewing) {
                          optionClass = "cursor-default ";
                          if (isCorrectOption) {
                            optionClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                          } else if (isSelected && !result?.isCorrect) {
                            optionClass += "border-red-500 bg-red-50 dark:bg-red-950/30";
                          } else {
                            optionClass += "border-border opacity-60";
                          }
                        } else if (isSelected) {
                          optionClass = "border-primary bg-primary/5 cursor-pointer";
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleSelectAnswer(qIndex, option)}
                            disabled={isReviewing}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors",
                              optionClass
                            )}
                          >
                            <span className={cn(
                              "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center",
                              isSelected && !isReviewing && "border-primary bg-primary",
                              isReviewing && isCorrectOption && "border-emerald-500 bg-emerald-500",
                              isReviewing && isSelected && !result?.isCorrect && "border-red-500 bg-red-500",
                              !isSelected && !isReviewing && "border-muted-foreground/40",
                              isReviewing && !isCorrectOption && !isSelected && "border-muted-foreground/20"
                            )}>
                              {isReviewing && isCorrectOption && <CheckCircle2 className="h-3 w-3 text-white" />}
                              {isReviewing && isSelected && !result?.isCorrect && <XCircle className="h-3 w-3 text-white" />}
                              {isSelected && !isReviewing && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isReviewingAndHasExplanation(quizState, q) && (
                      <p className="ml-9 mt-3 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Actions footer */}
              <div className="p-4 sm:p-6">
                {quizState === "taking" && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(selectedAnswers).length} of {questions.length} answered
                    </p>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={!allAnswered || isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Submit Quiz
                    </button>
                  </div>
                )}

                {quizState === "reviewing" && score !== null && (
                  <div className="space-y-4">
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-lg",
                      passed
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
                    )}>
                      {passed ? (
                        <Trophy className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {passed ? "Congratulations! You passed!" : "Not quite — keep learning!"}
                        </p>
                        <p className="text-sm opacity-80">
                          You scored {score}% ({results?.filter((r) => r.isCorrect).length}/{questions.length} correct). Passing score: {quiz.passingScore}%.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleStartQuiz}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted text-sm font-medium transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isReviewingAndHasExplanation(state: QuizState, q: QuizQuestion): boolean {
  return state === "reviewing" && !!q.explanation;
}
