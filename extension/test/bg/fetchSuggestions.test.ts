import { fetchSuggestions } from '../../src/recommender/api';

test('posts ids and prefs to recommender', async () => {
  const mockFetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve([]) });
  (global as any).fetch = mockFetch;
  process.env.RECOMMENDER_URL = 'https://example.com';
  const prefs = { stores: ['s1'], style: 'casual', event: 'party' };
  await fetchSuggestions(['1', '2'], prefs);
  expect(mockFetch).toHaveBeenCalledWith('https://example.com/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['1', '2'], ...prefs }),
  });
});
