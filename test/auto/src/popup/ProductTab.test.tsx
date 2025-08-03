import { render } from '@testing-library/react';
import { ProductTab } from '../../../../src/popup/ProductTab';

describe('ProductTab', () => {
  it('allows selecting variants', () => {
    render(<ProductTab />);
    // TODO: render with product and change color/size selections
  });
});
