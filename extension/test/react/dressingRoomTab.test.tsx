import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DressingRoomTab, DressingItem } from '../../src/popup/DressingRoomTab';

jest.mock('fabric', () => ({
  Canvas: jest.fn().mockImplementation(() => ({
    setWidth: jest.fn(),
    setHeight: jest.fn(),
    add: jest.fn(),
    getZoom: jest.fn(() => 1),
    setZoom: jest.fn(),
    getElement: () => document.createElement('canvas'),
    requestRenderAll: jest.fn(),
    dispose: jest.fn()
  })),
  Image: { fromURL: () => Promise.resolve({}) }
}));

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

const items: DressingItem[] = [
  { id: '1', image: '/a.jpg', variants: ['Red'], qty: 1 },
  { id: '2', image: '/b.jpg', variants: ['Blue'], qty: 2 }
];

jest.spyOn(chrome.storage.local, 'get').mockImplementation((_: any, cb?: any) => { if (cb) cb({ dressingRoom: items }); });
jest.spyOn(chrome.storage.local, 'set').mockImplementation(() => {});

test('renders items and removes one', () => {
  render(<DressingRoomTab />);
  expect(screen.getAllByRole('button', { name: /Remove item/i }).length).toBe(2);
  const remove = screen.getAllByRole('button', { name: /Remove item/i })[0];
  fireEvent.click(remove);
  expect(screen.getAllByRole('button', { name: /Remove item/i }).length).toBe(1);
});
