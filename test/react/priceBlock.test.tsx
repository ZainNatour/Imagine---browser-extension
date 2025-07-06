import { render, screen } from '@testing-library/react';
import { PriceBlock } from '../../src/components/PriceBlock';

test('renders discount info', () => {
  render(<PriceBlock price={50} oldPrice={100} currency="$" />);
  expect(screen.getByText('$50.00')).toBeInTheDocument();
  expect(screen.getByText('$100.00')).toBeInTheDocument();
  expect(screen.getByText('Save 50%')).toBeInTheDocument();
});
