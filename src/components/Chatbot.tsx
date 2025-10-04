import { useState } from 'react';

type MessageRole = 'user' | 'assistant' | 'tool';

type Message = {
  id: string;
  role: MessageRole;
  name?: string;
  content: string;
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
    result?: string;
  };
};

const assistantName = 'Playwright MCP';

const inputPlaceholder =
  'Ask the MCP server to explore, capture snapshots, or execute deterministic browser actions…';

const docsFallbackUrl = 'https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot';

const seedMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    name: assistantName,
    content:
      "Hello! I can drive Playwright to collect structured accessibility snapshots so you don't have to parse screenshots. What workflow should we run today?"
  },
  {
    id: '2',
    role: 'user',
    name: 'You',
    content: 'Navigate to the AI SDK UI chatbot docs and summarise the integration steps.'
  },
  {
    id: '3',
    role: 'assistant',
    name: assistantName,
    content: 'Running Playwright navigation…',
    toolCall: {
      name: 'playwright.navigate',
      args: { url: docsFallbackUrl },
      result: 'Visited documentation page and captured accessibility tree.'
    }
  },
  {
    id: '4',
    role: 'assistant',
    name: assistantName,
    content:
      'The docs recommend rendering the <Chat /> component, wiring a message array, and streaming responses through the AI SDK UI channel APIs.'
  }
];

const createSimulatedAssistantMessages = (prompt: string): Message[] => {
  const timestamp = Date.now();
  const normalizedPrompt = prompt.toLowerCase();
  const summaryRequested =
    normalizedPrompt.includes('summary') ||
    normalizedPrompt.includes('summarise') ||
    normalizedPrompt.includes('summarize');

  if (normalizedPrompt.includes('navigate') || normalizedPrompt.includes('open')) {
    const urlMatch = prompt.match(/https?:\/\/\S+/);
    const destinationUrl = urlMatch?.at(0) ?? docsFallbackUrl;

    return [
      {
        id: `${timestamp}-assistant-tool`,
        role: 'assistant',
        name: assistantName,
        content: 'Running Playwright navigation…',
        toolCall: {
          name: 'playwright.navigate',
          args: { url: destinationUrl },
          result: `Visited ${destinationUrl} and captured accessibility metadata.`
        }
      },
      {
        id: `${timestamp}-assistant-summary`,
        role: 'assistant',
        name: assistantName,
        content: summaryRequested
          ? `Here is a concise summary of the integration steps described at ${destinationUrl}: render the <Chat /> component, maintain a persistent message array, and stream assistant responses from your MCP server to keep the UI in sync.`
          : `Navigation to ${destinationUrl} completed. Connect your MCP server stream to relay the full integration guidance back to this panel.`
      }
    ];
  }

  if (normalizedPrompt.includes('accessibility') || normalizedPrompt.includes('snapshot')) {
    return [
      {
        id: `${timestamp}-assistant-accessibility`,
        role: 'assistant',
        name: assistantName,
        content:
          'To capture accessibility snapshots with Playwright, use page.accessibility.snapshot(), persist the JSON result, and attach it to your MCP message stream so the client can inspect the semantic tree without parsing images.'
      }
    ];
  }

  return [
    {
      id: `${timestamp}-assistant`,
      role: 'assistant',
      name: assistantName,
      content:
        'This demo response is simulated. Connect the UI to your MCP server to execute the request and stream back real Playwright updates.'
    }
  ];
};

export function Chatbot() {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      name: 'You',
      content: input.trim()
    };

    const assistantMessages = createSimulatedAssistantMessages(userMessage.content);

    setMessages((prev) => [...prev, userMessage, ...assistantMessages]);
    setInput('');
  }

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div className="avatar avatar-assistant">M</div>
        <div>
          <div className="chat-title">Model Context Protocol Chat</div>
          <p className="chat-description">
            Showcase of an AI SDK UI chatbot panel wired for deterministic tool usage with Playwright.
          </p>
        </div>
      </header>

      <div className="chat-messages" aria-live="polite">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <textarea
          aria-label="Chat message"
          value={input}
          placeholder={inputPlaceholder}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

type ChatMessageProps = {
  message: Message;
};

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const avatarClass = isUser ? 'avatar avatar-user' : 'avatar avatar-assistant';
  const avatarLabel = isUser ? 'You' : message.name ?? 'Assistant';

  return (
    <article className="message">
      <div className={avatarClass} aria-hidden="true">
        {avatarLabel.slice(0, 1)}
      </div>
      <div className="message-body">
        <header>{avatarLabel}</header>
        <p>{message.content}</p>
        {message.toolCall ? (
          <pre className="tool-call">
            <code>
              {JSON.stringify(
                {
                  tool: message.toolCall.name,
                  args: message.toolCall.args,
                  result: message.toolCall.result
                },
                null,
                2
              )}
            </code>
          </pre>
        ) : null}
      </div>
    </article>
  );
}
