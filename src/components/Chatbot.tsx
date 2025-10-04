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
    name: 'AI Elements Copilot',
    content:
      'Hey! Need help scaffolding AI-native interfaces? I can walk you through the AI Elements registry and wire components into your app.'
  },
  {
    id: '2',
    role: 'user',
    name: 'You',
    content: 'I want a conversation layout with inline citations and a task timeline. Where should I start?'
  },
  {
    id: '3',
    role: 'assistant',
    name: 'AI Elements Copilot',
    content: 'Inspecting component registry…',
    toolCall: {
      name: 'ai-elements.lookup',
      args: { components: ['conversation', 'inline-citation', 'task'] },
      result: 'Found conversation, inline-citation, and task components with live previews.'
    }
  },
  {
    id: '4',
    role: 'assistant',
    name: 'AI Elements Copilot',
    content:
      'Start by rendering <Conversation /> with your message stream, wrap insights with <InlineCitation />, and visualise progress via the <Task /> timeline.'
  }
];

export function Chatbot() {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState('');

  const placeholder = useMemo(
    () =>
      'Ask the copilot to assemble UI flows, suggest components, or orchestrate AI tool calls…',
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
      name: 'AI Elements Copilot',
      content:
        'Great choice! Connect your data source to <Conversation /> and progressively hydrate messages as your model streams updates.'
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  }

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div className="avatar avatar-assistant">A</div>
        <div>
          <div className="chat-title">AI Elements Copilot</div>
          <p className="chat-description">
            Follow along as the copilot assembles components, previews tool outputs, and keeps specs in sync
            with the AI Elements registry.
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
