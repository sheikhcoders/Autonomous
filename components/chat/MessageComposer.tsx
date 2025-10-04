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
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      onSubmit(trimmed);
      setValue("");
    },
    [onSubmit, value]
  );

  return (
    <div className="chat-composer">
      <div className="chat-meta">
        <span>Shift+Enter for newline</span>
        <span>{value.length} characters</span>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const trimmed = value.trim();
              if (trimmed) {
                onSubmit(trimmed);
                setValue("");
              }
            }
          }}
        />
        <button type="submit" disabled={isSending}>
          {isSending ? "Sending" : "Send"}
        </button>
      </form>
    </div>
  );
}
