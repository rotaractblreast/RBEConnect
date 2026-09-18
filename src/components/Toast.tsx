import React from "react";
import { ToastMessage } from "../types";

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const isError = t.type === "error";
        const isDone = t.type === "done";
        const isWarn = t.type === "warning";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all transform translate-y-0 ${
              isError
                ? "bg-rose-900 text-rose-50 border-rose-700"
                : isDone
                ? "bg-stone-900 text-amber-300 border-stone-800"
                : isWarn
                ? "bg-amber-900 text-amber-50 border-amber-700"
                : "bg-stone-900 text-stone-100 border-stone-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-xl">
                {isError
                  ? "error"
                  : isDone
                  ? "check_circle"
                  : isWarn
                  ? "warning"
                  : t.type === "lock"
                  ? "lock"
                  : "info"}
              </span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 hover:opacity-75 rounded-lg text-stone-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
