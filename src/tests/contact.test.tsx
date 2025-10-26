// TypeScript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contact from "../pages/Contact";

describe("Contact Page", () => {
    it("Muestra los campos Nombre, correo y opinion/consulta", () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );

        expect(screen.getByLabelText("Nombre:")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo electrónico:")).toBeInTheDocument();
        expect(screen.getByLabelText("Opinión o consulta:")).toBeInTheDocument();
    });

    it("Muestra mensaje de error si los campos estan vacios al enviar el formulario", async () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        const submitButton = screen.getByText("Enviar");

        fireEvent.click(submitButton);
        expect(await screen.findByText("El nombre debe tener entre 3 y 50 caracteres")).toBeInTheDocument();
        expect(await screen.findByText("Ingresa un correo válido (usuario@dominio.com)")).toBeInTheDocument();
        expect(await screen.findByText("El mensaje debe tener al menos 5 caracteres")).toBeInTheDocument();
    });

    it("Muestra mensaje de exito al enviar el formulario con datos validos", async () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        const nameInput = screen.getByLabelText("Nombre:");
        const emailInput = screen.getByLabelText("Correo electrónico:");
        const messageInput = screen.getByLabelText("Opinión o consulta:");
        const submitButton = screen.getByText("Enviar");
        fireEvent.change(nameInput, { target: { value: "Juan Perez" } });
        fireEvent.change(emailInput, { target: { value: "juan@gmail.com" } });
        fireEvent.change(messageInput, { target: { value: "Me gusta su sitio web!" } });
        fireEvent.click(submitButton);

        expect(await screen.findByText("¡Gracias por tu mensaje, Juan Perez! Lo hemos recibido correctamente.")).toBeInTheDocument();
    });

});