"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, Delete, History, X } from "lucide-react";

const buttons = [
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  "0", ".", "=", "+"
];

type HistoryItem = {
  expression: string;
  result: string;
};

export default function CalculatorPopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;

      if (/^[0-9]$/.test(key)) return handleClick(key);
      if (["+", "-", "*", "/"].includes(key)) return handleClick(key);
      if (key === ".") return handleClick(".");

      if (key === "Enter") {
        e.preventDefault();
        return handleClick("=");
      }

      if (key === "Backspace") {
        e.preventDefault();
        return deleteLast();
      }

      if (key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, display]);

  const livePreview = useMemo(() => {
    if (display === "0" || display === "Error") return null;
    if (["+", "-", "*", "/", "."].includes(display.slice(-1))) return null;

    try {
      const result = evaluate(display);
      return result !== display ? result : null;
    } catch {
      return null;
    }
  }, [display]);

  function formatDisplay(value: string) {
    return value.replaceAll("*", "×").replaceAll("/", "÷");
  }

  function evaluate(expression: string) {
    const safeExpression = expression.replace(/[^0-9+\-*/.()]/g, "");
    const result = Function(`"use strict"; return (${safeExpression})`)();

    if (!Number.isFinite(result)) throw new Error("Invalid result");

    return String(Number(result.toFixed(8)));
  }

  function calculate() {
    try {
      const result = evaluate(display);

      setHistory((current) => [
        { expression: display, result },
        ...current.slice(0, 7)
      ]);

      setDisplay(result);
    } catch {
      setDisplay("Error");
    }
  }

  function handleClick(value: string) {
    if (value === "=") return calculate();

    if (display === "Error") {
      setDisplay(value);
      return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
      const last = display.slice(-1);

      if (["+", "-", "*", "/"].includes(last)) {
        setDisplay((current) => current.slice(0, -1) + value);
        return;
      }
    }

    if (value === ".") {
      const parts = display.split(/[+\-*/]/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes(".")) return;
    }

    if (display === "0" && value !== ".") {
      setDisplay(value);
      return;
    }

    setDisplay((current) => current + value);
  }

  function deleteLast() {
    setDisplay((current) =>
      current.length <= 1 || current === "Error" ? "0" : current.slice(0, -1)
    );
  }

  function clearDisplay() {
    setDisplay("0");
  }

  function memoryAdd() {
    try {
      setMemory((current) => current + Number(evaluate(display)));
    } catch {
      setDisplay("Error");
    }
  }

  function memorySubtract() {
    try {
      setMemory((current) => current - Number(evaluate(display)));
    } catch {
      setDisplay("Error");
    }
  }

  function memoryRecall() {
    setDisplay(String(memory));
  }

  function memoryClear() {
    setMemory(0);
  }

  const calculatorModal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                    Quick Tool
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    Calculator
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHistory((current) => !current)}
                    className="rounded-2xl border border-white/10 p-2 text-slate-200 transition hover:bg-white/10"
                  >
                    <History className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-white/10 p-2 text-slate-200 transition hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-right">
                <p className="min-h-8 break-all text-2xl font-bold text-white">
                  {formatDisplay(display)}
                </p>

                {livePreview ? (
                  <p className="mt-1 text-sm text-slate-400">
                    = {formatDisplay(livePreview)}
                  </p>
                ) : null}
              </div>

              {showHistory ? (
                <div className="mb-3 max-h-32 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3">
                  {history.length === 0 ? (
                    <p className="text-center text-sm text-slate-400">
                      No history yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setDisplay(item.result)}
                          className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                        >
                          <p className="text-xs text-slate-400">
                            {formatDisplay(item.expression)}
                          </p>
                          <p className="text-sm font-semibold text-white">
                            = {formatDisplay(item.result)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mb-2 grid grid-cols-4 gap-2">
                <button onClick={memoryAdd} className="rounded-2xl bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15">
                  M+
                </button>
                <button onClick={memorySubtract} className="rounded-2xl bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15">
                  M-
                </button>
                <button onClick={memoryRecall} className="rounded-2xl bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15">
                  MR
                </button>
                <button onClick={memoryClear} className="rounded-2xl bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15">
                  MC
                </button>
              </div>

              <div className="mb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={clearDisplay}
                  className="rounded-2xl bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={deleteLast}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Delete className="h-4 w-4" />
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {buttons.map((button) => {
                  const isOperator = ["+", "-", "*", "/", "="].includes(button);

                  return (
                    <button
                      key={button}
                      type="button"
                      onClick={() => handleClick(button)}
                      className={
                        isOperator
                          ? "rounded-2xl bg-brand-500 py-3 text-base font-bold text-white transition hover:bg-brand-400"
                          : "rounded-2xl bg-white/10 py-3 text-base font-semibold text-white transition hover:bg-white/15"
                      }
                    >
                      {button === "*" ? "×" : button === "/" ? "÷" : button}
                    </button>
                  );
                })}
              </div>

              {memory !== 0 ? (
                <p className="mt-3 text-center text-xs text-slate-400">
                  Memory: {formatDisplay(String(memory))}
                </p>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        <Calculator className="h-4 w-4" />
        Calculator
      </button>

      {calculatorModal}
    </>
  );
}