import { render } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../../src/ui/card';

describe('Card', () => {
  it('renders header + content', () => {
    const { getByText, container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Subtitle</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Subtitle')).toBeInTheDocument();
    expect(getByText('Body')).toBeInTheDocument();
    expect(getByText('Footer')).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('forwards extra className & data attributes', () => {
    const { getByTestId } = render(
      <Card data-testid="root" className="bg-red-500" />
    );

    expect(getByTestId('root')).toHaveClass('bg-red-500');
  });
});
