import { render } from '@testing-library/react';
import { StoresTab } from '../../../../src/popup/StoresTab';

describe('StoresTab', () => {
  it('sorts stores by name descending', () => {
    render(<StoresTab initialStores={[]} />);
    // TODO: provide initialStores and trigger apply with sort "Name (Z-A)"
  });
});
