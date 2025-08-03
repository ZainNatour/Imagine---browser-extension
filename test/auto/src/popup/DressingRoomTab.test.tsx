import { render } from '@testing-library/react';
import { DressingRoomTab } from '../../../../src/popup/DressingRoomTab';

describe('DressingRoomTab', () => {
  it('reorders items on drag end', () => {
    render(<DressingRoomTab />);
    // TODO: add items and simulate drag to trigger handleDragEnd
  });
});
