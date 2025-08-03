import { render } from '@testing-library/react';
import { FilterPanel } from '../../../../../src/components/FilterPanel/FilterPanel';

describe('FilterPanel', () => {
  it('applies selected filters', () => {
    render(
      <FilterPanel
        demographics={[]}
        clothingTypes={[]}
        priceLabels={[]}
        sortOptions={['Name (A-Z)', 'Name (Z-A)']}
        onApply={jest.fn()}
      />
    );
    // TODO: simulate toggling options and applying filters
  });
});
