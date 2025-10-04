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

## License

MIT
