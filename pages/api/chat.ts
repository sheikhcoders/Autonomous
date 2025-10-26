import type { NextApiRequest, NextApiResponse } from "next";
import { Groq } from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import type { ChatMessage } from "@/lib/chat/types";

// Ensure the Groq API key is set in the environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable.");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Utility to filter out unsupported roles and transform messages for the Groq API
function sanitizeMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  const validRoles: Set<"user" | "assistant" | "system" | "tool"> = new Set([
    "user",
    "assistant",
    "system",
    "tool"
  ]);
  return messages
    .filter((message) => validRoles.has(message.role))
    .map(({ role, content, name }) => ({ role, content, name }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages, persona, temperature, systemPrompt, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' in request body" });
  }

  if (!persona || typeof persona !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'persona' in request body" });
  }

  if (temperature === undefined || typeof temperature !== "number") {
    return res.status(400).json({ error: "Missing or invalid 'temperature' in request body" });
  }

  if (!systemPrompt || typeof systemPrompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'systemPrompt' in request body" });
  }

  if (!model || typeof model !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'model' in request body" });
  }

  try {
    const sanitizedMessages = sanitizeMessages(messages);

    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
      temperature
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      return res.status(500).json({ error: "Unexpected response from Groq API" });
    }

    const assistantMessage: ChatMessage = {
      id: response.id,
      role: "assistant",
      content: choice.message.content || "",
      createdAt: new Date().toISOString(),
      metadata: {
        finishReason: choice.finish_reason,
        usage: response.usage
          ? {
              completionTokens: response.usage.completion_tokens,
              promptTokens: response.usage.prompt_tokens,
              totalTokens: response.usage.total_tokens
            }
          : undefined
      }
    };

    return res.status(200).json({ message: assistantMessage });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Groq API request failed:", errorMessage);
    return res.status(500).json({ error: `Groq API request failed: ${errorMessage}` });
  }
}