import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';

import { cn } from './utils';

const switchVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-9 data-[state=unchecked]:bg-gray-200'
);

const thumbVariants = cva(
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
);

export function ThemeToggle({ className }: { className?: string }) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    chrome.storage.sync.get('theme', ({ theme }) => {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      setChecked(isDark);
    });
  }, []);

  const onCheckedChange = (value: boolean) => {
    setChecked(value);
    document.documentElement.classList.toggle('dark', value);
    chrome.storage.sync.set({ theme: value ? 'dark' : 'light' });
  };

  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(switchVariants(), className)}
    >
      <SwitchPrimitive.Thumb className={thumbVariants()} />
    </SwitchPrimitive.Root>
  );
}
