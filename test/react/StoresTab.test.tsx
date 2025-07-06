import { render, screen, fireEvent } from '@testing-library/react';
import { StoresTab } from '../../src/popup/StoresTab';

const stores = [
  {
    name: 'Alpha',
    image: '/a.jpg',
    clothingType: 'Shirts',
    targetDemographic: ['Men'],
    priceRange: 'Low',
    url: '/a'
  },
  {
    name: 'Beta',
    image: '/b.jpg',
    clothingType: 'Pants',
    targetDemographic: ['Women'],
    priceRange: 'High',
    url: '/b'
  }
];

test('filters by clothing type', async () => {
  render(<StoresTab initialStores={stores} />);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
  expect(screen.getByText('Beta')).toBeInTheDocument();
  const shirtChip = screen.getByRole('button', { name: 'Shirts' });
  fireEvent.click(shirtChip);
  const apply = screen.getAllByLabelText('Apply Filters')[0];
  fireEvent.click(apply);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
  expect(screen.queryByText('Beta')).toBeNull();
});
