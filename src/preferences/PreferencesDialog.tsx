/* istanbul ignore file */
import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { useMarketplaceStore } from '../popup/MarketplaceTab';
import { usePrefsStore, Style } from './store';

export const PreferencesDialog: React.FC = () => {
  const { products } = useMarketplaceStore();
  const stores = useMemo(() => Array.from(new Set(products.map((p) => p.store))), [products]);
  const { stores: prefStores, style, event, setPrefs } = usePrefsStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(prefStores);
  const [selStyle, setSelStyle] = useState<Style>(style);
  const [selEvent, setSelEvent] = useState(event);

  const toggleStore = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s],
    );
  };

  const save = () => {
    setPrefs({ stores: selected, style: selStyle, event: selEvent });
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-2" onClick={() => setOpen(true)}>
          Settings
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="p-4 w-64 space-y-4">
          <div className="flex flex-wrap gap-2">
            {stores.map((s) => (
              <Button
                key={s}
                variant="outline"
                data-active={selected.includes(s) || undefined}
                onClick={() => toggleStore(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Style</p>
            <div className="flex gap-2">
              {(['casual', 'formal', 'sport'] as Style[]).map((s) => (
                <label key={s} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="style"
                    value={s}
                    checked={selStyle === s}
                    onChange={() => setSelStyle(s)}
                  />
                  {s[0].toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={selEvent}
            onChange={(e) => setSelEvent(e.target.value)}
            placeholder="Upcoming event"
            className="w-full border rounded p-1"
          />
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
