import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../../../../../src/components/FilterPanel/FilterPanel';

// Polyfill ResizeObserver for Radix UI components
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

describe('FilterPanel', () => {
  it('applies selected filters', () => {
    const demographics = ['Men', 'Women'];
    const clothingTypes = ['Tops', 'Bottoms'];
    const priceLabels = ['Under $50', '$50-$100'];
    const sortOptions = ['Name (A-Z)'];
    const onApply = jest.fn();

    const { container } = render(
      <FilterPanel
        demographics={demographics}
        clothingTypes={clothingTypes}
        priceLabels={priceLabels}
        sortOptions={sortOptions}
        onApply={onApply}
      />
    );

    // toggle "Women" demographic and "Tops" clothing type
    fireEvent.click(screen.getByText('Women'));
    fireEvent.click(screen.getByText('Tops'));

    // move the slider to select "Under $50" only
    const sliders = screen.getAllByRole('slider');
    sliders[1].focus();
    fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' });

    // select a rating
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // trigger sort radio change
    const sortRadio = screen.getByLabelText('Name (A-Z)');
    fireEvent.change(sortRadio, { target: { checked: true } });

    // apply the filters
    const applyButtons = screen.getAllByRole('button', { name: 'Apply Filters' });
    fireEvent.click(applyButtons[0]);

    expect(onApply).toHaveBeenCalledTimes(1);
    const arg = onApply.mock.calls[0][0];
    expect({
      demographics: arg.demographic,
      clothingTypes: arg.clothing,
      prices: [priceLabels[arg.price[0]]],
      sort: arg.sort,
    }).toEqual({
      demographics: ['Women'],
      clothingTypes: ['Tops'],
      prices: ['Under $50'],
      sort: 'Name (A-Z)',
    });

    expect(container).toMatchSnapshot();
  });
});
