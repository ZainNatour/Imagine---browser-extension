import { openai } from '../shared/openai';

interface Review { text: string; rating?: string }

const pending = new Set<string>();

export async function summarise(id: string, reviews: Review[]) {
  const prompt = `Summarise pros and cons in <50 words: ${reviews
    .map((r) => r.text)
    .join('\n')}`;
  const {
    choices: [
      {
        message: { content },
      },
    ],
  } = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });
  return content;
}

export function enqueueSummary(id: string, reviews: Review[]) {
  if (pending.has(id)) return;
  pending.add(id);
  summarise(id, reviews)
    .then(async (content) => {
      const { reviewSummaries = {} } = await chrome.storage.local.get(
        'reviewSummaries',
      );
      reviewSummaries[id] = content;
      await chrome.storage.local.set({ reviewSummaries });
    })
    .finally(() => pending.delete(id));
}
