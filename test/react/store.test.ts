import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useFilterStore } from '../../src/react-filters/store';

test('set and clear filters', () => {
  const { result } = renderHook(() => useFilterStore());
  act(() => {
    result.current.setFilter('clothingType', ['Shirts']);
  });
  expect(result.current.clothingType).toEqual(['Shirts']);
  act(() => {
    result.current.clearAll();
  });
  expect(result.current.clothingType).toEqual([]);
});
