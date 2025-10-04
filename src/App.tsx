import { Chatbot } from './components/Chatbot';
import { IndexCards } from './components/IndexCards';

export default function App() {
  return (
    <main>
      <section>
        <h1>Playwright MCP + AI SDK UI</h1>
        <p className="lead">
          Explore how a Model Context Protocol server powered by Playwright can collaborate with
          an AI SDK UI chatbot for deterministic browser automation workflows.
        </p>
        <IndexCards
          cards={[
            {
              title: 'Overview',
              description: 'Get an overview about the AI SDK UI.',
              href: '/docs/ai-sdk-ui/overview'
            },
            {
              title: 'Chatbot',
              description: 'Learn how to integrate an interface for a chatbot.',
              href: '/docs/ai-sdk-ui/chatbot'
            },
            {
              title: 'Chatbot Message Persistence',
              description: 'Learn how to store and load chat messages in a chatbot.',
              href: '/docs/ai-sdk-ui/chatbot-message-persistence'
            },
            {
              title: 'Chatbot Tool Usage',
              description: 'Learn how to integrate an interface for a chatbot with tool calling.',
              href: '/docs/ai-sdk-ui/chatbot-tool-usage'
            },
            {
              title: 'Completion',
              description: 'Learn how to integrate an interface for text completion.',
              href: '/docs/ai-sdk-ui/completion'
            },
            {
              title: 'Object Generation',
              description: 'Learn how to integrate an interface for object generation.',
              href: '/docs/ai-sdk-ui/object-generation'
            },
            {
              title: 'Streaming Data',
              description: 'Learn how to stream data.',
              href: '/docs/ai-sdk-ui/streaming-data'
            },
            {
              title: 'Reading UI Message Streams',
              description:
                'Learn how to read UIMessage streams for terminal UIs, custom clients, and server components.',
              href: '/docs/ai-sdk-ui/reading-ui-message-streams'
            },
            {
              title: 'Error Handling',
              description: 'Learn how to handle errors.',
              href: '/docs/ai-sdk-ui/error-handling'
            }
          ]}
        />
      </section>

      <section className="chat-layout">
        <h2 className="section-title">Chatbot Demo</h2>
        <Chatbot />
      </section>
    </main>
  );
}
