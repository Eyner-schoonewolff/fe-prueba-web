import { render, screen, fireEvent } from "@testing-library/react";
import { CardForm } from "@/components/payment/CardForm";

jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  const Image = (props: any) => <img alt={props.alt} src={props.src} />;
  Image.displayName = "Image";
  return <Image {...props} />;
});

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText(/4111 1111 1111 1111/i), {
    target: { value: "4111111111111111" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Como aparece en la tarjeta/i), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), {
    target: { value: "12/30" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Cód\. seguridad/i), {
    target: { value: "123" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Tu correo para el recibo/i), {
    target: { value: "john@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Juan Andrés Pérez/i), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText(/\+57 300 123 4567/i), {
    target: { value: "+57 300 123 4567" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Calle 123/i), {
    target: { value: "Calle 123" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Bogotá/i), {
    target: { value: "Bogotá" },
  });
};

describe("CardForm", () => {
  it("valida y llama onValid con datos correctos", () => {
    const onValid = jest.fn();
    render(<CardForm onValid={onValid} />);

    fillForm();

    fireEvent.click(
      screen.getByRole("button", { name: /continuar al resumen/i })
    );

    expect(onValid).toHaveBeenCalled();
  });

  it("muestra errores cuando faltan campos", () => {
    const onValid = jest.fn();
    render(<CardForm onValid={onValid} />);

    fireEvent.click(
      screen.getByRole("button", { name: /continuar al resumen/i })
    );

    expect(onValid).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(/requerid|inválid|MM\/YY|Email inválido/i).length
    ).toBeGreaterThan(0);
  });
});
