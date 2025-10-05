import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import type { ChatMessage } from "@/lib/chat/types";

const personas: Record<string, string> = {
  "product-designer":
    "You are a product designer who explains UX trade-offs, suggests interface improvements, and writes concise product specs.",
  "full-stack":
    "You are a senior full-stack engineer. Offer implementation-ready suggestions, highlight integration points, and call out potential risks.",
  researcher:
    "You are an AI researcher who summarises findings, compares techniques, and is explicit about assumptions."
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

let cachedGroqClient: Groq | null = null;

function getGroqClient() {
  if (cachedGroqClient) {
    return cachedGroqClient;
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }
  cachedGroqClient = new Groq({ apiKey });
  return cachedGroqClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const persona = typeof body?.persona === "string" ? body.persona : "full-stack";
    const temperatureValue = typeof body?.temperature === "number" ? body.temperature : 0.6;
    const draftSystemPrompt = typeof body?.systemPrompt === "string" ? body.systemPrompt : "";
    const requestedModel = typeof body?.model === "string" ? body.model.trim() : "";

    const model = requestedModel || DEFAULT_MODEL;
    const personaPrompt = personas[persona] ?? personas["full-stack"];
    const systemPrompt = [personaPrompt, draftSystemPrompt].filter(Boolean).join("\n\n");

    const history = buildChatHistory(messages, systemPrompt);
    if (history.length === 0) {
      return new Response(
        JSON.stringify({
          message: createAssistantMessage(
            "I need a prompt to get started. Ask about a product idea, architecture decision, or debugging problem."
          )
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model,
      temperature: clamp(temperatureValue, 0, 2),
      messages: history
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq response did not include assistant content.");
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
      status: "complete"
    };

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Chat route failed", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error while fetching assistant response.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function buildChatHistory(messages: ChatMessage[], systemPrompt: string) {
  const history = messages
    .filter((message) =>
      message && typeof message.content === "string" && message.content.trim() && message.role !== "tool"
    )
    .map((message) => ({
      role: mapRole(message.role),
      content: message.content.trim()
    }));

  if (systemPrompt) {
    history.unshift({ role: "system", content: systemPrompt });
  }

  return history;
}

function mapRole(role: ChatMessage["role"]) {
  if (role === "assistant" || role === "system" || role === "user") {
    return role;
  }
  return "user";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createAssistantMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    status: "complete"
  };
}
