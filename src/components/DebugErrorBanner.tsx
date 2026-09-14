"use client";

import { useEffect, useState } from "react";

/**
 * Debug-only visual error banner.
 *
 * Listens for uncaught runtime errors and unhandled promise rejections and
 * renders the message directly on the page as a visible red banner. This
 * lets a plain screenshot of the live site reveal real client-side failures
 * (e.g. a script that failed to load, a thrown exception during map init)
 * without needing access to the browser devtools console.
 *
 * Safe to leave mounted permanently: it renders nothing unless an actual
 * error is caught.
 */
export default function DebugErrorBanner() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const addMessage = (msg: string) => {
      setMessages((prev) => {
        if (prev.includes(msg)) return prev;
        return [...prev, msg].slice(-5);
      });
    };

    const handleError = (event: ErrorEvent) => {
      const msg =
        event.error instanceof Error
          ? `${event.error.name}: ${event.error.message}`
          : event.message || "Bilinmeyen hata";
      addMessage(`[error] ${msg}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : typeof reason === "string"
          ? reason
          : JSON.stringify(reason);
      addMessage(`[unhandledrejection] ${msg}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div
      id="debug-error-banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: "#7f1d1d",
        color: "#fee2e2",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "6px 8px",
        maxHeight: "35vh",
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        borderBottom: "2px solid #ef4444",
      }}
    >
      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
}