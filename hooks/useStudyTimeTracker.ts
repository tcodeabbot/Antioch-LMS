"use client";

import { useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { recordStudySessionAction } from "@/app/actions/studyTimeActions";

const HEARTBEAT_INTERVAL = 60_000; // save every 60s
const MIN_DURATION = 5; // ignore sessions under 5s

export function useStudyTimeTracker(lessonId: string, courseId: string) {
  const { user } = useUser();
  const activeSecondsRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const startedAtRef = useRef(new Date().toISOString());
  const isVisibleRef = useRef(true);
  const savedRef = useRef(false);

  const flush = useCallback(async () => {
    const seconds = activeSecondsRef.current;
    if (!user?.id || seconds < MIN_DURATION || savedRef.current) return;
    savedRef.current = true;
    activeSecondsRef.current = 0;
    await recordStudySessionAction(
      user.id,
      lessonId,
      courseId,
      seconds,
      startedAtRef.current
    );
    startedAtRef.current = new Date().toISOString();
    savedRef.current = false;
  }, [user?.id, lessonId, courseId]);

  useEffect(() => {
    if (!user?.id) return;

    const tick = () => {
      if (isVisibleRef.current) {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        if (elapsed < 5) {
          activeSecondsRef.current += elapsed;
        }
        lastTickRef.current = now;
      } else {
        lastTickRef.current = Date.now();
      }
    };

    const tickInterval = setInterval(tick, 1000);

    const heartbeat = setInterval(() => {
      if (activeSecondsRef.current >= MIN_DURATION) {
        flush();
      }
    }, HEARTBEAT_INTERVAL);

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === "visible";
      if (!isVisibleRef.current && activeSecondsRef.current >= MIN_DURATION) {
        flush();
      }
      lastTickRef.current = Date.now();
    };

    const handleBeforeUnload = () => {
      if (activeSecondsRef.current >= MIN_DURATION && user?.id) {
        const payload = JSON.stringify({
          clerkId: user.id,
          lessonId,
          courseId,
          durationSeconds: Math.round(activeSecondsRef.current),
          startedAt: startedAtRef.current,
        });
        navigator.sendBeacon("/api/study-time", payload);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(tickInterval);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (activeSecondsRef.current >= MIN_DURATION) {
        flush();
      }
    };
  }, [user?.id, lessonId, courseId, flush]);
}
