"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, ChatSettings, Conversation } from "@/lib/chat/types";

const DEFAULT_SYSTEM_PROMPT =
  "You are a pragmatic copilot that can map product ideas to implementation details, highlighting key integration and testing notes.";

const DEFAULT_CONVERSATION: Conversation = {
  id: createId(),
  title: "Kick-off plan",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  messages: [
    {
      id: createId(),
      role: "assistant",
      name: "Vercel Elements Copilot",
      createdAt: new Date().toISOString(),
      status: "complete",
      content:
        "Welcome! Share what you want to build and I'll sketch a plan, call out integration steps, and suggest how to validate it."
    }
  ],
  persona: "full-stack"
};

const STORAGE_KEY = "ai-elements-chatbot";

const DEFAULT_SETTINGS: ChatSettings = {
  persona: "full-stack",
  temperature: 0.6,
  model: "gpt-4o-mini"
};

interface UseChatManagerResult {
  conversations: Conversation[];
  activeConversation?: Conversation;
  settings: ChatSettings;
  isSending: boolean;
  createConversation: (title?: string) => void;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  updateConversationPersona: (conversationId: string, persona: string) => void;
  updateSystemPrompt: (conversationId: string, prompt: string) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  regenerateAssistantMessage: (conversationId: string, messageId: string) => Promise<void>;
}

export function useChatManager(): UseChatManagerResult {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") {
      return [DEFAULT_CONVERSATION];
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [DEFAULT_CONVERSATION];
      }

      const parsed = JSON.parse(stored) as Conversation[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [DEFAULT_CONVERSATION];
      }
      return parsed.map((conversation) => ({
        ...conversation,
        messages: conversation.messages ?? []
      }));
    } catch (error) {
      console.warn("Failed to parse stored conversations", error);
      return [DEFAULT_CONVERSATION];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => conversations[0]?.id);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isSending, setIsSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const createConversation = useCallback(
    (title?: string) => {
      const conversation = createEmptyConversation(settings.persona, title?.trim() || "New exploration");
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
    },
    [settings.persona]
  );

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((conversation) => conversation.id !== conversationId);
        if (filtered.length === 0) {
          const fallback = createEmptyConversation(settings.persona);
          setActiveConversationId(fallback.id);
          return [fallback];
        }
        const fallbackId = filtered[0]?.id;
        setActiveConversationId((current) => (current === conversationId ? fallbackId : current));
        return filtered;
      });
    },
    [settings.persona]
  );

  const renameConversation = useCallback((conversationId: string, title: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: title.trim() || conversation.title, updatedAt: new Date().toISOString() }
          : conversation
      )
    );
  }, []);

  const updateSystemPrompt = useCallback((conversationId: string, prompt: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, systemPrompt: prompt, updatedAt: new Date().toISOString() }
          : conversation
      )
    );
  }, []);

  const updateConversationPersona = useCallback((conversationId: string, persona: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, persona, updatedAt: new Date().toISOString() }
          : conversation
      )
    );
  }, []);

  const updateSettings = useCallback((nextSettings: Partial<ChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...nextSettings }));
  }, []);

  const pushMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages,
              updatedAt: new Date().toISOString()
            }
          : conversation
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!content.trim()) {
        return;
      }

      const conversation = conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
        status: "complete"
      };

      const assistantPlaceholder: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming"
      };

      const nextMessages = [...conversation.messages, userMessage, assistantPlaceholder];
      pushMessages(conversationId, nextMessages);
      setIsSending(true);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: nextMessages,
            persona: conversation.persona,
            temperature: settings.temperature,
            systemPrompt: conversation.systemPrompt,
            model: settings.model
          })
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as { message: ChatMessage };
        const assistantMessage = payload.message;

        const mergedMessages = nextMessages.map((message) =>
          message.id === assistantPlaceholder.id ? { ...assistantMessage, status: "complete" } : message
        );
        pushMessages(conversationId, mergedMessages);
      } catch (error) {
        console.error("Chat request failed", error);
        const erroredMessages = nextMessages.map((message) =>
          message.id === assistantPlaceholder.id
            ? {
                ...message,
                status: "error",
                content: "Request failed. Try again."
              }
            : message
        );
        pushMessages(conversationId, erroredMessages);
      } finally {
        setIsSending(false);
      }
    },
    [conversations, pushMessages, settings.model, settings.temperature]
  );

  const regenerateAssistantMessage = useCallback(
    async (conversationId: string, messageId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        return;
      }

      const targetIndex = conversation.messages.findIndex((message) => message.id === messageId);
      if (targetIndex === -1) {
        return;
      }

      const history = conversation.messages.slice(0, targetIndex);
      const placeholder = conversation.messages[targetIndex];
      if (!placeholder || placeholder.role !== "assistant") {
        return;
      }

      const updatedPlaceholder: ChatMessage = { ...placeholder, status: "streaming", content: "" };
      const nextMessages = [...history, updatedPlaceholder];
      pushMessages(conversationId, nextMessages);
      setIsSending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            persona: conversation.persona,
            temperature: settings.temperature,
            systemPrompt: conversation.systemPrompt,
            model: settings.model
          })
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as { message: ChatMessage };
        const assistantMessage = payload.message;

        const mergedMessages = nextMessages.map((message) =>
          message.id === updatedPlaceholder.id ? { ...assistantMessage, status: "complete" } : message
        );
        pushMessages(conversationId, mergedMessages);
      } catch (error) {
        console.error("Failed to regenerate message", error);
        const erroredMessages = nextMessages.map((message) =>
          message.id === updatedPlaceholder.id
            ? {
                ...message,
                status: "error",
                content: "Regeneration failed. Try again."
              }
            : message
        );
        pushMessages(conversationId, erroredMessages);
      } finally {
        setIsSending(false);
      }
    },
    [conversations, pushMessages, settings.model, settings.temperature]
  );

  return {
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
  };
}

function createId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function createEmptyConversation(persona: string, title = "New exploration"): Conversation {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title,
    createdAt: now,
    updatedAt: now,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    messages: [],
    persona
  };
}
