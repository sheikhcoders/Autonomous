"use client";

import { FormEvent, useCallback, useState } from "react";

interface MessageComposerProps {
  placeholder?: string;
  isSending: boolean;
  onSubmit: (value: string) => void;
}

export function MessageComposer({ placeholder, isSending, onSubmit }: MessageComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSending) {
        return;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      onSubmit(trimmed);
      setValue("");
    },
    [isSending, onSubmit, value]
  );

  return (
    <div className="chat-composer">
      <div className="chat-meta">
        <span>Shift+Enter for newline</span>
        <span>{value.length} characters</span>
      </div>
      {isSending ? (
        <p role="status" aria-live="polite" className="chat-status">
          Assistant is responding…
        </p>
      ) : null}
      <form onSubmit={handleSubmit} aria-busy={isSending}>
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (isSending) {
                return;
              }
              const trimmed = value.trim();
              if (trimmed) {
                onSubmit(trimmed);
                setValue("");
              }
            }
          }}
          aria-disabled={isSending}
        />
        <button type="submit" disabled={isSending} aria-disabled={isSending}>
          {isSending ? "Sending" : "Send"}
        </button>
      </form>
    </div>
  );
}
