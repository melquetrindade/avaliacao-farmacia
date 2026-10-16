"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type FeedbackType = "success" | "error" | "warning";

type Feedback = {
  id: number;
  message: string;
  description?: string;
  type: FeedbackType;
};

type ShowFeedback = (
  message: string,
  type: FeedbackType,
  description?: string,
) => void;

const FeedbackContext = createContext<ShowFeedback | null>(null);

const feedbackStyles: Record<FeedbackType, string> = {
  success:
    "border-emerald-700 bg-emerald-600 text-white",
  error: "border-red-700 bg-red-600 text-white",
  warning: "border-amber-600 bg-amber-100 text-amber-950",
};

export function FuncionariosFeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const showFeedback = useCallback<ShowFeedback>(
    (message, type, description) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const id = ++nextIdRef.current;
      setFeedback({ id, message, description, type });
      timeoutRef.current = setTimeout(() => {
        setFeedback((current) => (current?.id === id ? null : current));
        timeoutRef.current = null;
      }, 5000);
    },
    [],
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return (
    <FeedbackContext.Provider value={showFeedback}>
      {children}
      {feedback && (
        <div
          key={feedback.id}
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
          className={`fixed top-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-xl border px-4 py-3 shadow-lg ${feedbackStyles[feedback.type]}`}
        >
          <p className="text-sm font-semibold">{feedback.message}</p>
          {feedback.description && (
            <p className="mt-1 text-sm opacity-90">{feedback.description}</p>
          )}
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFuncionariosFeedback() {
  const showFeedback = useContext(FeedbackContext);

  if (!showFeedback) {
    throw new Error(
      "useFuncionariosFeedback deve ser usado dentro de FuncionariosFeedbackProvider.",
    );
  }

  return showFeedback;
}
