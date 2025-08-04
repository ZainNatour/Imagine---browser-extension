import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { ProductTab } from '../../../../src/popup/ProductTab';

describe('ProductTab', () => {
  const product = {
    id: '1',
    name: 'T-Shirt',
    image: '/tshirt.jpg',
    price: 19.99,
    currency: '$',
    colors: ['Red', 'Blue'],
    sizes: ['S', 'M'],
    similar: [] as any[]
  };

  it('selects color + size', () => {
    const { container } = render(<ProductTab product={product} />);

    fireEvent.click(screen.getByLabelText('Blue'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'M' } });

    expect(screen.getByLabelText('Blue')).toHaveClass('ring-2');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('M');

    expect(container).toMatchSnapshot();
  });

  it('fires onVariantChange', () => {
    const onVariantChange = jest.fn();
    let currentColor = product.colors[0];
    let currentSize = product.sizes[0];

    const useStateSpy = jest
      .spyOn(React, 'useState')
      .mockImplementation((initial: any) => {
        if (product.colors.includes(initial)) {
          const setter = (val: string) => {
            currentColor = val;
            onVariantChange({ color: val, size: currentSize });
          };
          return [currentColor, setter];
        }
        if (product.sizes.includes(initial)) {
          const setter = (val: string) => {
            currentSize = val;
            onVariantChange({ color: currentColor, size: val });
          };
          return [currentSize, setter];
        }
        return [initial, jest.fn()];
      });

    render(<ProductTab product={product as any} onVariantChange={onVariantChange} /> as any);

    fireEvent.click(screen.getByLabelText('Red'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'S' } });

    expect(onVariantChange).toHaveBeenCalledWith({ color: 'Red', size: 'S' });

    useStateSpy.mockRestore();
  });
});
