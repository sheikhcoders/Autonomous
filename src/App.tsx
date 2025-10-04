import { Chatbot } from './components/Chatbot';
import { ComponentList } from './components/ComponentList';
import { IndexCards } from './components/IndexCards';

export default function App() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Component Registry</span>
        <h1>AI Elements</h1>
        <p className="lead">
          AI Elements is a component library and custom registry built on top of shadcn/ui to help you
          ship AI-native product experiences faster. Mix and match ready-to-use building blocks like
          conversations, tasks, and inline citations without leaving your design system.
        </p>

        <div className="hero-actions">
          <a className="button" href="https://www.npmjs.com/package/ai-elements">
            View on npm
          </a>
          <a className="button button-secondary" href="https://github.com/vercel/ai-elements">
            Browse source code
          </a>
        </div>
      </section>

      <section className="installation">
        <h2 className="section-title">Install in seconds</h2>
        <p>
          Use the Elements Installer CLI to scaffold the registry into your project. It wires up routes,
          components, and styles that work with the shadcn/ui primitives you already rely on.
        </p>
        <pre>
          <code>npx ai-elements init</code>
        </pre>
      </section>

      <section>
        <h2 className="section-title">Build production-ready AI workflows</h2>
        <IndexCards
          cards={[
            {
              title: 'Opinionated building blocks',
              description:
                'Start from accessible primitives for conversations, agent actions, tool responses, and more.',
              href: 'https://ai-elements.vercel.app/components'
            },
            {
              title: 'Stream-friendly by default',
              description:
                'Every component is wired for incremental rendering so you can plug into live model updates.',
              href: 'https://ai-elements.vercel.app/guides/streaming'
            },
            {
              title: 'Bring your data & design',
              description:
                'Extend tokens, swap icons, or hydrate from your existing state machines without rewriting UI.',
              href: 'https://ai-elements.vercel.app/guides/theming'
            }
          ]}
        />
      </section>

      <section className="catalogue">
        <h2 className="section-title">Components included</h2>
        <p className="catalogue-copy">
          Ship the essentials for agentic experiences: status toasts for tools, task timelines, knowledge
          sources, and more. Each entry links to interactive documentation so you can copy-paste examples
          or pull the code directly from the registry.
        </p>
        <ComponentList
          components={[
            { name: 'Actions', path: 'actions' },
            { name: 'Artifact', path: 'artifact' },
            { name: 'Branch', path: 'branch' },
            { name: 'Chain of Thought', path: 'chain-of-thought' },
            { name: 'Code Block', path: 'code-block' },
            { name: 'Context', path: 'context' },
            { name: 'Conversation', path: 'conversation' },
            { name: 'Image', path: 'image' },
            { name: 'Loader', path: 'loader' },
            { name: 'Message', path: 'message' },
            { name: 'Open in Chat', path: 'open-in-chat' },
            { name: 'Prompt Input', path: 'prompt-input' },
            { name: 'Reasoning', path: 'reasoning' },
            { name: 'Response', path: 'response' },
            { name: 'Sources', path: 'sources' },
            { name: 'Suggestion', path: 'suggestion' },
            { name: 'Task', path: 'task' },
            { name: 'Tool', path: 'tool' },
            { name: 'Web Preview', path: 'web-preview' },
            { name: 'Inline Citation', path: 'inline-citation' }
          ]}
        />
      </section>

      <section className="chat-layout">
        <h2 className="section-title">See it in conversation</h2>
        <Chatbot />
      </section>
    </main>
  );
}
