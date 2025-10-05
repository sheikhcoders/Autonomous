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
messages along with persona and temperature metadata. It returns a single assistant message by default, but
is structured so you can replace the mocked implementation with your own streaming handler.

## Customisation roadmap

- Swap the mock implementation in `app/api/chat/route.ts` with your preferred inference provider.
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
