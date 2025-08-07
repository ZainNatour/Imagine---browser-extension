import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimilarProductsCarousel } from '../../src/components/SimilarProductsCarousel';

const items = [
  { id: '1', name: 'A', image: '/a.jpg', price: '$1' },
  { id: '2', name: 'B', image: '/b.jpg', price: '$2' }
];

test('renders carousel items', () => {
  render(<SimilarProductsCarousel items={items} />);
  expect(screen.getByAltText('A')).toBeInTheDocument();
  expect(screen.getByAltText('B')).toBeInTheDocument();
});
