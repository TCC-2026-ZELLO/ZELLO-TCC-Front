import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
    it("exibe a mensagem de permissão negada e aciona onRetryLocation ao clicar em 'Tentar novamente'", () => {
        const onRetryLocation = vi.fn();
        render(() => <EmptyState reason="no-permission" onRetryLocation={onRetryLocation} />);

        expect(screen.getByText("Precisamos da sua localização")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(onRetryLocation).toHaveBeenCalledOnce();
    });

    it("exibe a mensagem de 'nenhum resultado' sem oferecer o botão de tentar novamente", () => {
        render(() => <EmptyState reason="no-results" onRetryLocation={vi.fn()} />);

        expect(screen.getByText("Nenhum estabelecimento encontrado")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("não renderiza nada quando reason é 'idle'", () => {
        const { container } = render(() => <EmptyState reason="idle" onRetryLocation={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });
});
