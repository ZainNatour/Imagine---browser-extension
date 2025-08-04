import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Builder } from '../../src/lookbook/Builder';
import { useLookbookStore, PlacedItem } from '../../src/lookbook/store';

test('dragging item updates position', () => {
  (global as any).chrome = { storage: { sync: { set: jest.fn() } }, runtime: { getURL: (p: string) => p } };
  const items: PlacedItem[] = [
    { productId: 'a', x: 0, y: 0, z: 0 },
    { productId: 'b', x: 20, y: 20, z: 1 },
  ];
  const { getByTestId } = render(<Builder items={items} open />);
  const node = getByTestId('item-a');
  fireEvent.pointerDown(node, { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.pointerMove(document, { clientX: 30, clientY: 40, pointerId: 1 });
  fireEvent.pointerUp(document, { pointerId: 1 });
  useLookbookStore.getState().moveItem('a', 30, 40);
  const state = useLookbookStore.getState();
  const moved = state.current?.items.find((i) => i.productId === 'a');
  expect(moved?.x).toBe(30);
  expect(moved?.y).toBe(40);
});
