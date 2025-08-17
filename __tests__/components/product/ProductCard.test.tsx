import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types/product';

jest.mock('next/image', () => (props: any) => {
  // Simplify next/image in tests
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={props.alt} src={props.src} />;
});

describe('ProductCard', () => {
  const product: Product = {
    id: '1',
    name: 'Producto de prueba',
    description: 'Descripción',
    price: 123400,
    image: 'https://example.com/img.jpg',
    stock: 3,
  };

  it('muestra nombre, descripción y precio formateado', () => {
    render(<ProductCard product={product} onBuy={jest.fn()} />);
    expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('1.234,00', { exact: false })).toBeInTheDocument();
  });

  it('llama onBuy al hacer click en Pagar con tarjeta', () => {
    const onBuy = jest.fn();
    render(<ProductCard product={product} onBuy={onBuy} />);
    fireEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }));
    expect(onBuy).toHaveBeenCalledWith(product);
  });
});