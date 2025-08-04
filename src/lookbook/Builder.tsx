/* istanbul ignore file */
import React, { useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { PlacedItem, useLookbookStore } from './store';

interface BuilderProps {
  items: PlacedItem[];
  open?: boolean;
}

const DraggableThumb: React.FC<{ item: PlacedItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.productId });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`item-${item.productId}`}
      style={{
        position: 'absolute',
        left: item.x + (transform?.x ?? 0),
        top: item.y + (transform?.y ?? 0),
        zIndex: item.z,
        width: 50,
        height: 50,
        background: '#ddd',
      }}
    />
  );
};

export const Builder: React.FC<BuilderProps> = ({ items, open = true }) => {
  const { current, createLook, addItem, moveItem } = useLookbookStore();

  useEffect(() => {
    createLook('');
    items.forEach((it, idx) => addItem({ ...it, x: it.x ?? 0, y: it.y ?? 0, z: idx }));
  }, [items, createLook, addItem]);

  const handleDragEnd = (event: DragEndEvent) => {
    const id = event.active.id as string;
    const delta = event.delta;
    const item = current?.items.find((i) => i.productId === id);
    if (item) {
      moveItem(id, item.x + delta.x, item.y + delta.y);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <div className="w-full h-96 bg-gray-50 relative overflow-hidden" data-testid="lookbook-canvas">
          <DndContext onDragEnd={handleDragEnd}>
            {current?.items.map((it) => (
              <DraggableThumb key={it.productId} item={it} />
            ))}
          </DndContext>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const BuilderButton: React.FC<{ items: PlacedItem[] }> = ({ items }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open}>
      <Button size="sm" onClick={() => setOpen(true)}>
        Outfit Builder
      </Button>
      {open && <Builder items={items} open={open} />}
    </Dialog>
  );
};
