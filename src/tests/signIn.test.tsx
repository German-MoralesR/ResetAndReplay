import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SignIn from "../pages/SignIn";

describe("SignIn Page", () => {
    it("Muestra los campos del formulario de registro", () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );
        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo")).toBeInTheDocument();
        expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirmar Contraseña")).toBeInTheDocument();
        expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de Nacimiento")).toBeInTheDocument();
    });

    it("Muestra mensaje de error si los campos estan vacios al enviar el formulario", async () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );
        const submitButton = screen.getByText("Registrarse");
        fireEvent.click(submitButton);

        expect(await screen.findByText("Nombre debe contener 3 a 20 caracteres")).toBeInTheDocument();
        expect(await screen.findByText("Correo debe tener un formato válido (usuario@dominio.com)")).toBeInTheDocument();
        expect(await screen.findByText("Usuario debe contener 4 a 20 caracteres")).toBeInTheDocument();
        expect(await screen.findByText("La contraseña debe contener al menos 8 caracteres")).toBeInTheDocument();
        expect(await screen.findByText("Debe aceptar los términos y condiciones")).toBeInTheDocument();
    });

    it("Muestra mensaje de exito al enviar el formulario con datos validos", async () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );

        const alertSpy = vi.spyOn(window, 'alert');
        const nameInput = screen.getByLabelText("Nombre");
        const emailInput = screen.getByLabelText("Correo");
        const userInput = screen.getByLabelText("Usuario");
        const passwordInput = screen.getByLabelText("Contraseña");
        const cPasswordInput = screen.getByLabelText("Confirmar Contraseña");
        const termsCheckbox = screen.getByLabelText("Acepto los términos y condiciones");
        const submitButton = screen.getByText("Registrarse");
        fireEvent.change(nameInput, { target: { value: "Juan Perez" } });
        fireEvent.change(emailInput, { target: { value: "juan@gmail.com" } });
        fireEvent.change(userInput, { target: { value: "juanp" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.change(cPasswordInput, { target: { value: "password123" } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);
        expect(alertSpy).toHaveBeenCalledWith("¡Se ha registrado correctamente!");
    });
});