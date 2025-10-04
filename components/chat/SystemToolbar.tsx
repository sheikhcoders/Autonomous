"use client";

import { useEffect, useState } from "react";
import type { Conversation, ChatSettings } from "@/lib/chat/types";

interface SystemToolbarProps {
  conversation: Conversation;
  settings: ChatSettings;
  onSettingsChange: (settings: Partial<ChatSettings>) => void;
  onSystemPromptChange: (prompt: string) => void;
  onPersonaChange: (persona: string) => void;
}

const MODELS = ["gpt-4o-mini", "gpt-4.1", "claude-3.5", "llama-3.1"];
const PERSONAS = [
  { value: "full-stack", label: "Full-stack engineer" },
  { value: "product-designer", label: "Product designer" },
  { value: "researcher", label: "AI researcher" }
];

export function SystemToolbar({
  conversation,
  settings,
  onSettingsChange,
  onSystemPromptChange,
  onPersonaChange
}: SystemToolbarProps) {
  const [promptDraft, setPromptDraft] = useState(conversation.systemPrompt);

  useEffect(() => {
    setPromptDraft(conversation.systemPrompt);
  }, [conversation.systemPrompt]);

  return (
    <div className="chat-toolbar">
      <label>
        Persona
        <select
          value={conversation.persona}
          onChange={(event) => {
            onPersonaChange(event.target.value);
            onSettingsChange({ persona: event.target.value });
          }}
        >
          {PERSONAS.map((persona) => (
            <option key={persona.value} value={persona.value}>
              {persona.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Model
        <select value={settings.model} onChange={(event) => onSettingsChange({ model: event.target.value })}>
          {MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </label>
      <label>
        Temperature: {settings.temperature.toFixed(2)}
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.temperature}
          onChange={(event) => onSettingsChange({ temperature: Number(event.target.value) })}
        />
      </label>
      <label>
        System prompt
        <textarea
          value={promptDraft}
          onChange={(event) => setPromptDraft(event.target.value)}
          onBlur={() => onSystemPromptChange(promptDraft)}
          placeholder="Describe the behaviour you want the assistant to follow"
        />
      </label>
    </div>
  );
}
