import { NextRequest } from "next/server";
import type { ChatMessage } from "@/lib/chat/types";

const personas: Record<string, string> = {
  "product-designer":
    "You are a product designer who explains UX trade-offs, suggests interface improvements, and writes concise product specs.",
  "full-stack":
    "You are a senior full-stack engineer. Offer implementation-ready suggestions, highlight integration points, and call out potential risks.",
  researcher:
    "You are an AI researcher who summarises findings, compares techniques, and is explicit about assumptions."
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages: ChatMessage[] = body?.messages ?? [];
  const persona = typeof body?.persona === "string" ? body.persona : "full-stack";
  const temperature = typeof body?.temperature === "number" ? body.temperature : 0.6;
  const draftSystemPrompt = typeof body?.systemPrompt === "string" ? body.systemPrompt : "";

  const personaPrompt = personas[persona] ?? personas["full-stack"];
  const systemPrompt = [personaPrompt, draftSystemPrompt].filter(Boolean).join("\n\n");

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userContent = lastUserMessage?.content?.trim();

  const replySections: string[] = [];

  if (systemPrompt) {
    replySections.push(
      `Persona context (temperature ${temperature.toFixed(2)}): ${systemPrompt}`
    );
  }

  if (userContent) {
    replySections.push(`You asked me to: ${userContent}`);
  } else {
    replySections.push(
      "No user prompt was supplied. Ask me about product ideas, implementation plans, or debugging questions."
    );
  }

  const conversationInsights = summariseConversation(messages);
  if (conversationInsights) {
    replySections.push(conversationInsights);
  }

  const suggestions = buildSuggestions(userContent);
  if (suggestions.length > 0) {
    replySections.push("Next steps:" + suggestions.map((item) => `\n• ${item}`).join(""));
  }

  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: replySections.join("\n\n"),
    createdAt: new Date().toISOString(),
    status: "complete"
  };

  return new Response(JSON.stringify({ message: assistantMessage }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function summariseConversation(messages: ChatMessage[]) {
  if (!messages.length) {
    return "";
  }

  const userTurns = messages.filter((message) => message.role === "user");
  const assistantTurns = messages.filter((message) => message.role === "assistant");

  const summaryParts: string[] = [];

  if (userTurns.length > 0) {
    summaryParts.push(
      `User messages so far (${userTurns.length}): ${userTurns
        .slice(-3)
        .map((message) => truncate(message.content, 140))
        .join(" | ")}`
    );
  }

  if (assistantTurns.length > 0) {
    summaryParts.push(
      `Assistant replies so far (${assistantTurns.length}): ${assistantTurns
        .slice(-3)
        .map((message) => truncate(message.content, 140))
        .join(" | ")}`
    );
  }

  return summaryParts.join("\n");
}

function buildSuggestions(userContent?: string) {
  if (!userContent) {
    return [
      "Share a product requirement, API contract, or error trace you want help with.",
      "Switch persona in the toolbar to explore different viewpoints.",
      "Draft a follow-up question to dig deeper into your topic."
    ];
  }

  const lowered = userContent.toLowerCase();

  if (lowered.includes("plan") || lowered.includes("architecture")) {
    return [
      "List the critical components and responsibilities you expect to build.",
      "Highlight any third-party APIs or services that will be involved.",
      "Ask for edge cases or failure scenarios you might be missing."
    ];
  }

  if (lowered.includes("debug") || lowered.includes("error")) {
    return [
      "Paste the relevant stack trace or console output so I can inspect it.",
      "Describe what you expected to happen and what actually occurred.",
      "Explain the environment (local, staging, production) where the bug appears."
    ];
  }

  if (lowered.includes("copy") || lowered.includes("marketing")) {
    return [
      "Clarify the audience you are targeting with this message.",
      "Share the tone or brand guidelines you need to follow.",
      "Specify the channel (landing page, onboarding email, release notes, etc.)."
    ];
  }

  return [
    "Request code snippets or pseudo-code to move faster.",
    "Ask for test cases or telemetry you can add to validate the idea.",
    "Invite the assistant to suggest how AI building blocks can elevate the experience."
  ];
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
