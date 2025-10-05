import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function main() {
  const result = streamText({
    model: groq('deepseek-r1-distill-llama-70b'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
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
