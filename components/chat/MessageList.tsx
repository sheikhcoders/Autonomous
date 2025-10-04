"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat/types";

interface MessageListProps {
  conversationId: string;
  messages: ChatMessage[];
  onRegenerate: (conversationId: string, messageId: string) => void;
}

export function MessageList({ conversationId, messages, onRegenerate }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div className="message-list" ref={scrollRef} aria-live="polite">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          conversationId={conversationId}
          message={message}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
}

interface MessageItemProps {
  conversationId: string;
  message: ChatMessage;
  onRegenerate: (conversationId: string, messageId: string) => void;
}

function MessageItem({ conversationId, message, onRegenerate }: MessageItemProps) {
  const isUser = message.role === "user";
  const initials = message.name?.slice(0, 2).toUpperCase() || (isUser ? "You" : "AI");

  return (
    <article className={`message-item ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar" aria-hidden="true">
        {initials}
      </div>
      <div className="message-content">
        <header>
          <span>{isUser ? "You" : message.name ?? "AI Copilot"}</span>
          <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        </header>
        <div className="message-body">{message.content || <em>Thinking…</em>}</div>
        <footer className="message-actions">
          {!isUser ? (
            <button type="button" onClick={() => onRegenerate(conversationId, message.id)}>
              Regenerate
            </button>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (!message.content) return;
              try {
                await navigator.clipboard?.writeText(message.content);
              } catch (error) {
                console.warn("Clipboard copy failed", error);
              }
            }}
            disabled={!message.content}
          >
            Copy
          </button>
        </footer>
        {message.status && message.status !== "complete" ? (
          <span className="message-status">{statusLabel(message.status)}</span>
        ) : null}
      </div>
    </article>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status: NonNullable<ChatMessage["status"]>) {
  switch (status) {
    case "pending":
      return "Queued";
    case "streaming":
      return "Streaming";
    case "error":
      return "Error";
    default:
      return "";
  }
}
