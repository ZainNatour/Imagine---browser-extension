import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecommendationCarousel } from '../../src/components/RecommendationCarousel';
import * as api from '../../src/recommender/api';

jest.mock('../../src/recommender/api');

const mockProducts = [
  { id: '1', name: 'A', image: '/a.jpg' },
  { id: '2', name: 'B', image: '/b.jpg' },
  { id: '3', name: 'C', image: '/c.jpg' },
];

(api.fetchSuggestions as jest.Mock).mockResolvedValue(mockProducts);

test('renders suggested product cards', async () => {
  render(<RecommendationCarousel seedIds={['seed']} />);
  const cards = await screen.findAllByTestId('product-card');
  expect(cards).toHaveLength(3);
});
