import { render, screen, fireEvent } from '@testing-library/react';
import { StoresTab } from '../../../../src/popup/StoresTab';

(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('StoresTab', () => {
  it('sorts stores by name descending', async () => {
    const stores = [
      {
        name: 'Adidas',
        image: '',
        clothingType: 'type',
        targetDemographic: [],
        priceRange: 'Low',
        url: '#a',
      },
      {
        name: 'Gucci',
        image: '',
        clothingType: 'type',
        targetDemographic: [],
        priceRange: 'Low',
        url: '#b',
      },
      {
        name: 'Nike',
        image: '',
        clothingType: 'type',
        targetDemographic: [],
        priceRange: 'Low',
        url: '#c',
      },
    ];

    const { container } = render(<StoresTab initialStores={stores} />);
    await screen.findByText('Adidas');

    fireEvent.click(screen.getByLabelText('Name (Z-A)'));
    const apply = screen.getAllByLabelText('Apply Filters')[0];
    fireEvent.click(apply);

    const names = screen
      .getAllByRole('link')
      .map((link) => link.textContent?.trim());
    expect(names).toEqual(['Nike', 'Gucci', 'Adidas']);

    const list = container.querySelector('.grid-cols-2');
    expect(list).toMatchSnapshot();
  });

  it('filters by tag', async () => {
    const stores = [
      {
        name: 'Gap',
        image: '',
        clothingType: 'type',
        targetDemographic: ['Kids'],
        priceRange: 'Low',
        url: '#g',
      },
      {
        name: 'HM',
        image: '',
        clothingType: 'type',
        targetDemographic: ['Women'],
        priceRange: 'Low',
        url: '#h',
      },
    ];

    render(<StoresTab initialStores={stores} />);
    await screen.findByText('Gap');

    const kidsButton = screen.getByRole('button', { name: 'Kids' });
    fireEvent.click(kidsButton);
    const apply = screen.getAllByLabelText('Apply Filters')[0];
    fireEvent.click(apply);

    expect(screen.getByText('Gap')).toBeInTheDocument();
    expect(screen.queryByText('HM')).toBeNull();
  });
});
