import type * as React from "react";

export function Bubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        } px-3 py-2 text-sm shadow-sm`}
      >
        {children}
      </div>
    </div>
  );
}
