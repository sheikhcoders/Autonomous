"use client";

import { useMemo, useState } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { SystemToolbar } from "@/components/chat/SystemToolbar";
import { useChatManager } from "@/lib/chat/useChatManager";

export function ChatApp() {
  const {
    conversations,
    activeConversation,
    settings,
    isSending,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    updateConversationPersona,
    updateSystemPrompt,
    updateSettings,
    sendMessage,
    regenerateAssistantMessage
  } = useChatManager();

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const conversationStats = useMemo(() => {
    if (!activeConversation) {
      return "";
    }
    const tokens = activeConversation.messages.reduce((total, message) => total + message.content.length / 4, 0);
    return `${activeConversation.messages.length} messages · ~${Math.ceil(tokens)} tokens`;
  }, [activeConversation]);

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar" aria-label="Conversation list">
        <div className="chat-sidebar-header">
          <h1>AI Elements Copilot</h1>
          <div className="chat-sidebar-actions">
            <button type="button" onClick={() => createConversation()}>New chat</button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-pressed={isSidebarCollapsed}
              aria-label={isSidebarCollapsed ? "Expand conversation list" : "Collapse conversation list"}
            >
              {isSidebarCollapsed ? "Show" : "Hide"}
            </button>
          </div>
        </div>

        {!isSidebarCollapsed ? (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            onSelect={selectConversation}
            onDelete={deleteConversation}
            onRename={renameConversation}
          />
        ) : null}
      </aside>

      <section className="chat-main" aria-label="Chat workspace">
        {activeConversation ? (
          <>
            <header className="chat-header">
              <div>
                <h2>{activeConversation.title}</h2>
                <p>{conversationStats}</p>
              </div>
              <SystemToolbar
                conversation={activeConversation}
                settings={settings}
                onSettingsChange={updateSettings}
                onSystemPromptChange={(prompt) => updateSystemPrompt(activeConversation.id, prompt)}
                onPersonaChange={(persona) => updateConversationPersona(activeConversation.id, persona)}
              />
            </header>

            <MessageList
              conversationId={activeConversation.id}
              messages={activeConversation.messages}
              onRegenerate={regenerateAssistantMessage}
            />

            <MessageComposer
              isSending={isSending}
              placeholder="Shift+Enter for newline"
              onSubmit={(value) => sendMessage(activeConversation.id, value)}
            />
          </>
        ) : (
          <div className="empty-state" role="status">
            <strong>No conversation selected</strong>
            <p>Use the sidebar to create a new chat and start exploring product ideas.</p>
            <button type="button" onClick={() => createConversation("New concept")}>Create conversation</button>
          </div>
        )}
      </section>
    </div>
  );
}
