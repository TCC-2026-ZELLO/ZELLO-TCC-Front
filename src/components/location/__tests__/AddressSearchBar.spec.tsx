import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { AddressSearchBar } from "../AddressSearchBar";

describe("AddressSearchBar", () => {
    it("propaga a digitação via onInput e o envio do formulário via onSubmit", () => {
        const onInput = vi.fn();
        const onSubmit = vi.fn();

        render(() => (
            <AddressSearchBar
                query=""
                onInput={onInput}
                onSubmit={onSubmit}
                onUseMyLocation={vi.fn()}
                isSearchingAddress={false}
                isLocating={false}
            />
        ));

        const input = screen.getByPlaceholderText("Buscar por endereço ou CEP");
        fireEvent.input(input, { target: { value: "Rua XV de Novembro" } });
        expect(onInput).toHaveBeenCalledWith("Rua XV de Novembro");

        const form = screen.getByRole("button", { name: "Buscar" }).closest("form");
        fireEvent.submit(form as HTMLFormElement);
        expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("desabilita o botão de localização enquanto isLocating é verdadeiro", () => {
        render(() => (
            <AddressSearchBar
                query=""
                onInput={vi.fn()}
                onSubmit={vi.fn()}
                onUseMyLocation={vi.fn()}
                isSearchingAddress={false}
                isLocating={true}
            />
        ));

        expect(screen.getByRole("button", { name: /localizando/i })).toBeDisabled();
    });
});
