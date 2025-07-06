import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChip } from '../../src/react-filters/FilterChip';

test('chip calls onRemove', () => {
  const onRemove = jest.fn();
  render(<FilterChip label="Demo" onRemove={onRemove} />);
  const chip = screen.getAllByRole('button')[0];
  fireEvent.click(chip);
  expect(onRemove).toHaveBeenCalled();
});
