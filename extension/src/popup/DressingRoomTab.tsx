import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Canvas, Image } from 'fabric';

export interface DressingItem {
  id: string;
  image: string;
  variants: string[];
  qty: number;
}

interface ItemProps {
  item: DressingItem;
  onChangeQty: (id: string, qty: number) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemProps> = ({ item, onChangeQty, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div ref={setNodeRef} style={style} className="border rounded p-2 flex items-start space-x-2 bg-white dark:bg-gray-800" {...attributes} {...listeners}>
      <img
        src={item.image}
        alt="thumbnail"
        loading="lazy"
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <div className="flex space-x-1 mb-1">
          {item.variants.map(v => (
            <span key={v} className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{v}</span>
          ))}
        </div>
        <div className="flex items-center space-x-1" aria-label="Quantity selector">
          <button onClick={() => onChangeQty(item.id, item.qty - 1)} aria-label="Decrease quantity" className="px-1">-</button>
          <span>{item.qty}</span>
          <button onClick={() => onChangeQty(item.id, item.qty + 1)} aria-label="Increase quantity" className="px-1">+</button>
        </div>
      </div>
      <button onClick={() => onDelete(item.id)} aria-label="Remove item" className="text-red-600">×</button>
    </div>
  );
};

export const DressingRoomTab: React.FC = () => {
  const [items, setItems] = useState<DressingItem[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    chrome.storage.local.get('dressingRoom', ({ dressingRoom }) => {
      if (Array.isArray(dressingRoom)) {
        setItems(dressingRoom);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ dressingRoom: items });
  }, [items]);

  useEffect(() => {
    const canvas = new Canvas('preview-canvas');
    canvas.setWidth(300);
    canvas.setHeight(400);
    items.forEach((item) => {
      Image.fromURL(item.image).then((img) => {
        canvas.add(img);
      });
    });

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = canvas.getZoom() - e.deltaY / 200;
      canvas.setZoom(Math.max(0.5, Math.min(2, zoom)));
      canvas.requestRenderAll();
    };
    canvas.getElement().addEventListener('wheel', handleWheel);

    let startDist = 0;
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        canvas.getElement().setPointerCapture(e.pointerId);
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && e.isPrimary === false) {
        const _el = (e.target as HTMLElement).ownerDocument?.getElementsByTagName('canvas')[0] as
          | HTMLCanvasElement
          | undefined;
        const _touches = (_el as unknown as { touches?: TouchList })?.touches;
        if (_touches && _touches.length === 2) {
          const t1 = _touches[0];
          const t2 = _touches[1];
          const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          if (!startDist) startDist = dist;
          const zoom = canvas.getZoom() * (dist / startDist);
          canvas.setZoom(Math.max(0.5, Math.min(2, zoom)));
          canvas.requestRenderAll();
        }
      }
    };
    const handlePointerUp = () => {
      startDist = 0;
    };
    const el = canvas.getElement();
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      canvas.dispose();
    };
  }, [items]);

  const handleQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));
  };
  const handleDelete = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const handleDragEnd = (_event: DragEndEvent) => {
    const { active, over } = _event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-1/2 p-2">
        <canvas id="preview-canvas" className="border w-full h-full" />
      </div>
      <div className="lg:w-1/2 p-2 overflow-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onChangeQty={handleQty} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default DressingRoomTab;
