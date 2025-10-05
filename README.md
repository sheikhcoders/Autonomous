# Vercel AI Elements Chatbot Starter

This project provides a fully featured, hackable Next.js chatbot experience inspired by the Vercel AI
Elements component system. It ships with a multi-conversation workspace, persona-aware system prompts,
and a reusable chat state manager so you can plug in your preferred inference stack immediately.

## Features

- ✅ **Next.js App Router** with TypeScript and streaming-ready API routes
- ✅ **Conversation workspace** including renaming, deletion, and automatic persistence
- ✅ **Persona and model toolbar** modelled after Vercel AI Elements
- ✅ **System prompt editor** for rapid experimentation
- ✅ **Client-side chat manager hook** for wiring any AI backend

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Upstash Redis and Groq credentials before running any API routes.

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | REST endpoint for your Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | REST token for the Upstash Redis database. |
| `GROQ_API_KEY` | API key used by the Groq SDK and streaming examples. |

## Project structure

```
.
├── app
│   ├── api
│   │   └── chat
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── chat
│       ├── ChatApp.tsx
│       ├── ConversationList.tsx
│       ├── MessageComposer.tsx
│       ├── MessageList.tsx
│       └── SystemToolbar.tsx
├── lib
│   └── chat
│       ├── types.ts
│       └── useChatManager.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## API contract

The `/api/chat` route expects the same schema used by Vercel AI Elements: an array of `{ id, role, content }
messages along with persona and temperature metadata. It proxies the request to Groq's Chat Completions API
via the Vercel AI SDK conventions and returns the assistant's reply. You can extend the route to stream
responses or enrich the payload with tool calls if your use case requires it.

### Upstash Redis example route

The App Router exposes `POST /api/upstash`, which demonstrates how to read data from Upstash Redis using the official SDK.

```ts
// app/api/upstash/route.ts
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function POST() {
  const result = await redis.get('item');
  return NextResponse.json({ result });
}
```

### Groq integration examples

- `pages/api/groq-test.js` adds a Pages Router endpoint that exercises the Groq SDK's Chat Completions API.
- `scripts/groq-stream.ts` shows how to stream text responses from Groq models via the official `groq-sdk`.

Run the streaming demo with your API key by executing the script via `ts-node` or `tsx`:

```bash
npx tsx scripts/groq-stream.ts
```

You can also make raw HTTP requests with cURL by swapping in your key and prompt:

```bash
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <GROQ_API_KEY>" \
  -d '{
        "messages": [
          {
            "role": "user",
            "content": "Why is fast inference so important for AI applications?"
          }
        ],
        "model": "qwen-qwq-32b",
        "temperature": 0.6,
        "max_completion_tokens": 32768,
        "top_p": 0.95,
        "stream": true,
        "stop": null
      }'
```

## Customisation roadmap

- Extend the Groq-backed implementation in `app/api/chat/route.ts` with streaming, tool execution, or
  retrieval-augmented prompts.
- Extend the `useChatManager` hook to call vector search, tool executors, or evaluation harnesses.
- Replace the CSS tokens in `app/globals.css` with Tailwind or your design system of choice.

## Agent testing workflow

To keep prompt and configuration changes grounded in measurable impact, adopt an iterative
testing loop:

1. **Define the target behaviour** by writing automated or scriptable test cases before you
   touch prompts or code. Cover core user journeys, stress cases, and likely failure modes so
   expectations are explicit.
2. **Run the suite and inspect the failures** to identify the biggest behavioural gaps.
   Triage failed scenarios by user or business impact to decide what to tackle first.
3. **Tweak one lever at a time**—prompt copy, retrieval settings, safety guardrails—and record
   each experiment so you know exactly which change drove the improvement.
4. **Re-run the tests after every adjustment**. Iterate until the entire suite passes so you can
   ship with confidence.
5. **Integrate the suite into CI/CD when possible** to automatically catch regressions as the
   agent evolves.

## License

MIT
