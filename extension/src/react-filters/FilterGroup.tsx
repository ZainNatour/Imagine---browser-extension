import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Transition } from '@headlessui/react';

interface Props {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export const FilterGroup: React.FC<Props> = ({ title, options, selected, onChange }) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())), [options, query]);

  return (
    <div className="mb-4">
      <button className="w-full text-left font-semibold" onClick={() => setOpen(!open)}>{title}</button>
      <Transition show={open} enter="transition duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="transition duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div className="mt-2">
          {options.length > 8 && (
            <input type="text" placeholder="Search" className="mb-2 w-full border px-2 py-1" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}
          <List height={120} itemCount={filtered.length} itemSize={24} width="100%">
            {({ index, style }: { index: number; style: React.CSSProperties }) => {
              const option = filtered[index];
              const checked = selected.includes(option);
              return (
                <label style={style} className="flex items-center space-x-2">
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    const next = e.target.checked ? [...selected, option] : selected.filter((s) => s !== option);
                    onChange(next);
                  }} />
                  <span>{option}</span>
                </label>
              );
            }}
          </List>
        </div>
      </Transition>
    </div>
  );
};
