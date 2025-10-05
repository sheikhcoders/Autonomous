import { NextRequest, NextResponse } from "next/server";
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

const MODEL_MAP: Record<string, string> = {
  "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile": "llama-3.1-70b-versatile",
  "llama-guard-3-8b": "llama-guard-3-8b"
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

interface ChatRequestBody {
  messages?: ChatMessage[];
  persona?: string;
  temperature?: number;
  systemPrompt?: string;
  model?: string;
}

export async function POST(req: NextRequest) {
  if (!groq) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured. Set it in your environment to enable chatting." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as ChatRequestBody;
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const persona = typeof body?.persona === "string" ? body.persona : "full-stack";
  const draftSystemPrompt = typeof body?.systemPrompt === "string" ? body.systemPrompt : "";
  const personaPrompt = personas[persona] ?? personas["full-stack"];
  const systemPrompt = [personaPrompt, draftSystemPrompt].filter(Boolean).join("\n\n");
  const model = MODEL_MAP[body?.model ?? ""] ?? DEFAULT_MODEL;
  const temperature = clamp(typeof body?.temperature === "number" ? body.temperature : 0.6, 0, 1);

  const groqMessages = buildGroqMessages(messages, systemPrompt);

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature,
      messages: groqMessages
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq response did not include any content");
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
      status: "complete",
      metadata: {
        model,
        temperature
      }
    };

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Groq chat request failed", error);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function buildGroqMessages(messages: ChatMessage[], systemPrompt: string) {
  const sanitized = messages
    .filter((message) => (message.role === "user" || message.role === "assistant") && Boolean(message.content?.trim()))
    .map((message) => ({
      role: message.role,
      content: message.content
    }));

  if (systemPrompt) {
    return [{ role: "system", content: systemPrompt }, ...sanitized];
  }

  return sanitized;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
