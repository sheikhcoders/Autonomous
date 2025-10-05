nse } from "next/server";
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

const DEFAULT_MODEL = "deepseek-r1-distill-llama-70b";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const persona = typeof body?.persona === "string" ? body.persona : "full-stack";
  const temperature = typeof body?.temperature === "number" ? body.temperature : 0.6;
  const draftSystemPrompt = typeof body?.systemPrompt === "string" ? body.systemPrompt : "";
  const requestedModel = typeof body?.model === "string" ? body.model : DEFAULT_MODEL;

  const personaPrompt = personas[persona] ?? personas["full-stack"];
  const systemPrompt = [personaPrompt, draftSystemPrompt].filter(Boolean).join("\n\n");

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.error("Missing GROQ_API_KEY. Cannot fulfil chat request.");
    return new Response(
      JSON.stringify({
        error: {
          message: "Server misconfiguration. Please set GROQ_API_KEY and try again."
        }
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  const client = new Groq({ apiKey: groqApiKey });

  const formattedMessages = formatMessagesForProvider(messages, systemPrompt);

  try {
    const completion = await client.chat.completions.create({
      model: requestedModel,
      temperature,
      messages: formattedMessages,
      stream: false
    });

    const choice = completion.choices?.[0];
    const message = choice?.message;
    const assistantContent = message?.content?.trim();

    if (!assistantContent) {
      console.error("Groq completion missing content", {
        requestedModel,
        choice,
        usage: completion.usage
      });
      return new Response(
        JSON.stringify({
          error: {
            message: "The AI response was empty. Please try again."
          }
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const metadata: NonNullable<ChatMessage["metadata"]> = {
      provider: "groq",
      model: requestedModel,
      finishReason: choice.finish_reason ?? "",
      persona,
      temperature
    };

    if (message?.reasoning) {
      metadata.reasoning = JSON.stringify(message.reasoning);
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent,
      createdAt: new Date().toISOString(),
      status: "complete",
      metadata
    };

    return Response.json({ message: assistantMessage, usage: completion.usage });
  } catch (error) {
    const status = getErrorStatus(error);
    const errorMessage = getErrorMessage(error);

    console.error("Groq chat completion failed", {
      status,
      requestedModel,
      persona,
      temperature,
      messageCount: formattedMessages.length,
      error
    });

    return new Response(
      JSON.stringify({
        error: {
          message: "Upstream AI provider request failed. Please try again shortly.",
          details: errorMessage
        }
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}

type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function formatMessagesForProvider(messages: ChatMessage[], systemPrompt: string): ProviderMessage[] {
  const sanitizedHistory = messages.filter((message) => {
    if (!message?.content?.trim()) {
      return false;
    }

    if (message.role === "tool") {
      return false;
    }

    return true;
  });

  const history = sanitizedHistory.map((message) => ({
    role: mapRole(message.role),
    content: message.content
  }));

  if (systemPrompt) {
    return [{ role: "system", content: systemPrompt }, ...history];
  }

  return history;
}

function mapRole(role: ChatMessage["role"]): ProviderMessage["role"] {
  if (role === "assistant" || role === "user" || role === "system") {
    return role;
  }

  return "assistant";
}

function getErrorStatus(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeNumber = (error as { status?: number }).status;
    if (typeof maybeNumber === "number" && maybeNumber >= 400 && maybeNumber <= 599) {
      return maybeNumber;
    }
  }

  return 502;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }

  return typeof error === "string" ? error : "Unknown error";
}
