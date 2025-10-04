# Playwright MCP Chatbot Demo

This project demonstrates how a Model Context Protocol (MCP) server powered by Playwright can pair
with an AI SDK UI chatbot interface. The UI showcases a cards-based documentation navigator and a
chat panel that simulates deterministic tool usage with Playwright.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173).

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – type-check and create a production build
- `npm run preview` – preview the built app locally

## Project structure

```
.
├── index.html
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── Chatbot.tsx
│   │   └── IndexCards.tsx
│   ├── main.tsx
│   └── styles.css
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Next steps

Replace the simulated assistant responses inside `Chatbot.tsx` with live streaming data from your MCP
server. The UI is intentionally framework-agnostic so it can connect to any backend that emits AI SDK
UI-compatible message streams.
