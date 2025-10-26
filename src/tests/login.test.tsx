import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // para simular rutas
import Login from "../pages/Login";// Importamos el componente que vamos a testear


// Bloque principal de pruebas: todas las pruebas relacionadas con el componente Login
describe("Login Component", () => {
// PRUEBA 1: Verificar que los campos se muestren correctamente
  it("muestra los campos de correo y contraseña", () => {
// Renderizamos el componente dentro de un MemoryRouter simulado
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
// Verificamos que los inputs del formulario estén presentes en el DOM simulado
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
// También comprobamos que el botón 'Ingresar' esté visible
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  // PRUEBA 2: Validar comportamiento cuando los campos están vacíos
  it("muestra errores si los campos están vacíos", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
// Simulamos que el usuario presiona el botón 'Ingresar' sin escribir nada
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    // Buscar errores de validación
    expect(await screen.findByText("El correo es obligatorio")).toBeInTheDocument();
    expect(await screen.findByText("La contraseña es obligatoria")).toBeInTheDocument();
  });

  it("acepta credenciales correctas", async () => {
    const onLoginSuccess = vi.fn(); // función simulada

    render(
      <MemoryRouter>
        <Login onLoginSuccess={onLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    // onLoginSuccess debe haberse llamado
    expect(onLoginSuccess).toHaveBeenCalled();
  });
});