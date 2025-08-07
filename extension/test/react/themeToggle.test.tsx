import { render, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../src/ui/theme-toggle';

describe('ThemeToggle', () => {
  it('toggles dark / light mode', () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole('switch');
    fireEvent.click(btn);
    fireEvent.click(btn);
  });
});

