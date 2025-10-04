export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  name?: string;
  status?: "pending" | "streaming" | "complete" | "error";
  metadata?: Record<string, string | number | boolean>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  systemPrompt: string;
  messages: ChatMessage[];
  persona: string;
}

export interface ChatSettings {
  persona: string;
  temperature: number;
  model: string;
}
