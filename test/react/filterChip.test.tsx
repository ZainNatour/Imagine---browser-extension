import { render, fireEvent } from '@testing-library/react';
import { FilterChip } from '../../src/react-filters/FilterChip';

describe('FilterChip', () => {
  it('invokes onToggle', () => {
    const spy = jest.fn();
    const { getByText } = render(
      <FilterChip label="Women" active={false} onToggle={spy} />
    );
    fireEvent.click(getByText('Women'));
    expect(spy).toHaveBeenCalledWith(true);
  });
});

