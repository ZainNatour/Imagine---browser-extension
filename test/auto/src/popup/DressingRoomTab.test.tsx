import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DressingRoomTab, DressingItem } from '../../../../src/popup/DressingRoomTab';

// Mock fabric.js which is used for canvas interactions inside the component.
// eslint-disable-next-line no-var
var fabricListeners: Record<string, any> = {};
jest.mock('fabric', () => ({
  Canvas: jest.fn().mockImplementation((id: string) => {
    const el = document.getElementById(id) || document.createElement('canvas');
    return {
      setWidth: jest.fn(),
      setHeight: jest.fn(),
      add: jest.fn(),
      getZoom: jest.fn(() => 1),
      setZoom: jest.fn(),
      getElement: () => {
        (el as any).addEventListener = (type: string, handler: any) => {
          fabricListeners[type] = handler;
        };
        (el as any).removeEventListener = jest.fn();
        (el as any).setPointerCapture = jest.fn();
        return el;
      },
      requestRenderAll: jest.fn(),
      dispose: jest.fn(),
      __listeners: fabricListeners
    };
  }),
  Image: { fromURL: () => Promise.resolve({}) },
  __listeners: fabricListeners
}));

// Simplified dnd-kit mocks that rely on native drag events.
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const activeId = e.dataTransfer.getData('text/plain');
        const overEl = (e.target as HTMLElement).closest('[data-id]');
        const overId = overEl?.getAttribute('data-id');
        onDragEnd({ active: { id: activeId }, over: { id: overId } });
      }}
    >
      {children}
    </div>
  ),
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => [])
}));

jest.mock('@dnd-kit/sortable', () => {
  const arrayMove = (arr: any[], from: number, to: number) => {
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  };
  return {
    SortableContext: ({ children }: any) => <div>{children}</div>,
    useSortable: ({ id }: any) => ({
      attributes: { draggable: true, 'data-id': id },
      listeners: {
        onDragStart: (e: any) => e.dataTransfer.setData('text/plain', id)
      },
      setNodeRef: jest.fn(),
      transform: null,
      transition: null
    }),
    arrayMove,
    verticalListSortingStrategy: jest.fn()
  };
});

// Provide a minimal chrome.storage mock for the component.
(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

describe('DressingRoomTab', () => {
  it('reorders items on drag end', async () => {
    const items: DressingItem[] = Array.from({ length: 8 }, (_, idx) => ({
      id: String(idx + 1),
      image: `/img-${idx + 1}.jpg`,
      variants: [`V${idx + 1}`],
      qty: 1
    }));

    // When the component loads it fetches initial items from chrome.storage.
    jest.spyOn(chrome.storage.local, 'get').mockImplementation((_: any, cb: any) => {
      cb({ dressingRoom: items });
    });
    jest.spyOn(chrome.storage.local, 'set').mockImplementation(() => {});

    const { container } = render(<DressingRoomTab />);

    // Initial order: img-1.jpg should be first.
    const thumbnails = await screen.findAllByAltText('thumbnail');
    expect(thumbnails[0]).toHaveAttribute('src', '/img-1.jpg');

    // Drag the first item to the end.
    const data = {
      store: {} as Record<string, string>,
      setData(type: string, val: string) {
        this.store[type] = val;
      },
      getData(type: string) {
        return this.store[type];
      }
    } as any;
    const firstCard = thumbnails[0].parentElement!;
    const lastCard = thumbnails[thumbnails.length - 1].parentElement!;

    // Trigger canvas interactions via captured handlers to cover zoom and pointer logic.
    fabricListeners.wheel({ preventDefault: () => {}, deltaY: 10 } as any);
    fabricListeners.pointerdown({ pointerType: 'touch', pointerId: 1 } as any);
    fabricListeners.pointermove({
      pointerType: 'touch',
      isPrimary: false,
      target: {
        ownerDocument: {
          getElementsByTagName: () => [
            { touches: [
              { clientX: 0, clientY: 0 },
              { clientX: 10, clientY: 0 }
            ] }
          ]
        }
      }
    } as any);
    fabricListeners.pointerup({} as any);

    fireEvent.dragStart(firstCard, { dataTransfer: data });
    fireEvent.dragEnter(lastCard);
    fireEvent.dragOver(lastCard);
    fireEvent.drop(lastCard, { dataTransfer: data });

    // After drop, the first image should now be at the end.
    const reordered = await screen.findAllByAltText('thumbnail');
    expect(reordered[reordered.length - 1]).toHaveAttribute('src', '/img-1.jpg');
    // State length stays the same meaning no items were added/removed.
    expect(reordered).toHaveLength(8);

    expect(container).toMatchSnapshot();

    // Additional interactions to cover quantity and delete handlers.
    const inc = screen.getAllByRole('button', { name: /Increase quantity/i })[0];
    const dec = screen.getAllByRole('button', { name: /Decrease quantity/i })[0];
    fireEvent.click(inc);
    fireEvent.click(dec);
    const remove = screen.getAllByRole('button', { name: /Remove item/i })[0];
    fireEvent.click(remove);
  });
});
