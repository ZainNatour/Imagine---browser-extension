import { render } from '@testing-library/react';
import { Card, CardHeader, CardContent } from '../../../../src/ui/card';

describe('Card', () => {
  it('renders header and content', () => {
    render(
      <Card>
        <CardHeader />
        <CardContent />
      </Card>
    );
    // TODO: assert rendered output
  });
});
