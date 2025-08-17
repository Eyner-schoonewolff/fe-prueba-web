import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

jest.mock('next/image', () => (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  const Image = (props: any) => <img alt={props.alt} src={props.src} />;
  Image.displayName = 'Image';
  return <Image {...props} />;
});

describe('Sidebar', () => {
  it('renderiza el logo de Wompi', () => {
    render(<Sidebar />);
    expect(screen.getByAltText(/wompi/i)).toBeInTheDocument();
  });
});