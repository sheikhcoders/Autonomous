import Groq from 'groq-sdk';

export async function main() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY environment variable is required to run this script.'
    );
  }

  const client = new Groq({ apiKey });

  const stream = await client.chat.completions.create({
    model: 'deepseek-r1-distill-llama-70b',
    stream: true,
    messages: [
      {
        role: 'user',
        content: 'Invent a new holiday and describe its traditions.',
      },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content;

    if (text) {
      process.stdout.write(text);
    }
  }
}

const isDirectExecution = (() => {
  if (typeof process === 'undefined' || !process.argv?.[1]) {
    return false;
  }

  try {
    const executedPath = new URL(`file://${process.argv[1]}`).href;
    return import.meta.url === executedPath;
  } catch {
    return false;
  }
})();

if (isDirectExecution) {
  main().catch((error) => {
    console.error('Streaming request failed:', error);
    process.exit(1);
  });
}
