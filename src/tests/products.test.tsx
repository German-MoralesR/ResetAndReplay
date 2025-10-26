import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Products from "../pages/Products";

describe("Products Component", () => {
  it("muestra el título de la página de productos", () => {
    render(<Products addToCart={vi.fn()} />);
    expect(screen.getByText("Catálogo Retro — Productos seleccionados")).toBeInTheDocument();
  });

  it("renderiza la lista de productos", () => {
    render(<Products addToCart={vi.fn()} />);
    const productCards = document.querySelectorAll('.product-card');
    expect(productCards.length).toBeGreaterThan(0);
  });

  it("llama a addToCart al hacer clic en el botón Añadir", () => {
    const addToCart = vi.fn();
    render(<Products addToCart={addToCart} />);
    const addButtons = screen.getAllByText("Añadir");
    fireEvent.click(addButtons[0]);
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      price: expect.any(Number),
      image: expect.any(String)
    }));
  });
});