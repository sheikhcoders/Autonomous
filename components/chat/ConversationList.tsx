"use client";

import { useMemo, useState } from "react";
import type { Conversation } from "@/lib/chat/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onRename
}: ConversationListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations]
  );

  return (
    <div className="conversation-list" role="list">
      {sortedConversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const isRenaming = renamingId === conversation.id;
        return (
          <article
            key={conversation.id}
            className={`conversation-card${isActive ? " active" : ""}`}
            role="listitem"
            aria-current={isActive}
            onClick={() => onSelect(conversation.id)}
          >
            {isRenaming ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onRename(conversation.id, draftTitle);
                  setRenamingId(null);
                }}
              >
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={() => {
                    onRename(conversation.id, draftTitle);
                    setRenamingId(null);
                  }}
                />
              </form>
            ) : (
              <>
                <h2>{conversation.title}</h2>
                <time dateTime={conversation.updatedAt}>
                  Updated {formatTimestamp(conversation.updatedAt)}
                </time>
              </>
            )}
            <div className="conversation-card-actions" aria-hidden={!isActive}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setRenamingId(conversation.id);
                  setDraftTitle(conversation.title);
                }}
              >
                Rename
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(conversation.id);
                }}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatTimestamp(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return new Date(value).toLocaleDateString();
}
