import { useMemo, useState } from 'react';

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

const seedMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    name: 'Playwright MCP',
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
    name: 'Playwright MCP',
    content: 'Running Playwright navigation…',
    toolCall: {
      name: 'playwright.navigate',
      args: { url: 'https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot' },
      result: 'Visited documentation page and captured accessibility tree.'
    }
  },
  {
    id: '4',
    role: 'assistant',
    name: 'Playwright MCP',
    content:
      'The docs recommend rendering the <Chat /> component, wiring a message array, and streaming responses through the AI SDK UI channel APIs.'
  }
];

export function Chatbot() {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState('');

  const placeholder = useMemo(
    () =>
      'Ask the MCP server to explore, capture snapshots, or execute deterministic browser actions…',
    []
  );

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

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      name: 'Playwright MCP',
      content:
        'This demo response is simulated. Hook this UI to your MCP server stream to make it conversational!'
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
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
          placeholder={placeholder}
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
