import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Input } from "../Input";
import { MaskedInput } from "../MaskedInput";
import { Modal } from "../Modal";
import { ToastContainer } from "../Toast";
import { Stepper } from "../Stepper";
import { showToast } from "../../../store/toastStore";

describe("Checklist de Usabilidade e Acessibilidade (WCAG 2.1 AA)", () => {
    describe("CHK-COM-01 / WCAG 3.3.1 & 3.3.2: Identificação de Erros e Prevenção em Inputs", () => {
        it("exibe feedback de erro com role='alert' e marca o input com aria-invalid='true' ao falhar validação no blur", () => {
            render(() => (
                <Input
                    labelText="E-mail"
                    placeholder="seu@email.com"
                    required
                    validate={(v) => (v.includes("@") ? null : "Informe um e-mail válido")}
                />
            ));

            const input = screen.getByPlaceholderText("seu@email.com");
            expect(input).toHaveAttribute("aria-invalid", "false");

            fireEvent.input(input, { target: { value: "email-invalido" } });
            fireEvent.blur(input);

            expect(input).toHaveAttribute("aria-invalid", "true");
            const alert = screen.getByRole("alert");
            expect(alert).toHaveTextContent("Informe um e-mail válido");
        });

        it("permite alternar a visibilidade da senha com botão rotulado via aria-label (WCAG 4.1.2)", () => {
            render(() => <Input type="password" labelText="Senha" placeholder="Digite sua senha" />);

            const input = screen.getByPlaceholderText("Digite sua senha");
            expect(input).toHaveAttribute("type", "password");

            const toggleBtn = screen.getByRole("button", { name: "Mostrar senha" });
            fireEvent.click(toggleBtn);

            expect(input).toHaveAttribute("type", "text");
            expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();
        });

        it("formata automaticamente CPF no MaskedInput e previne caracteres não-numéricos (Prevenção de Erros)", () => {
            const onInput = vi.fn();
            render(() => (
                <MaskedInput
                    mask="cpf"
                    value="12345678901"
                    onInput={onInput}
                    labelText="CPF"
                    placeholder="000.000.000-00"
                />
            ));

            const input = screen.getByPlaceholderText("000.000.000-00") as HTMLInputElement;
            expect(input.value).toBe("123.456.789-01");

            fireEvent.input(input, { target: { value: "123abc45678901999" } });
            expect(onInput).toHaveBeenCalledWith("12345678901");
        });
    });

    describe("CHK-OPE-01 / WCAG 2.1.1 & 4.1.2: Controle do Usuário e Acessibilidade por Teclado em Modais", () => {
        it("renderiza role='dialog' com aria-modal='true' e fecha ao pressionar a tecla Escape", () => {
            const onClose = vi.fn();
            render(() => (
                <Modal isOpen={true} onClose={onClose} title="Confirmar Agendamento">
                    <p>Deseja confirmar o horário selecionado?</p>
                </Modal>
            ));

            const dialog = screen.getByRole("dialog", { name: "Confirmar Agendamento" });
            expect(dialog).toHaveAttribute("aria-modal", "true");

            fireEvent.keyDown(window, { key: "Escape" });
            expect(onClose).toHaveBeenCalledOnce();
        });

        it("possui botão de fechamento explícito com aria-label='Fechar modal'", () => {
            const onClose = vi.fn();
            render(() => (
                <Modal isOpen={true} onClose={onClose} title="Detalhes do Serviço">
                    <p>Conteúdo</p>
                </Modal>
            ));

            const closeButton = screen.getByRole("button", { name: "Fechar modal" });
            fireEvent.click(closeButton);
            expect(onClose).toHaveBeenCalledOnce();
        });
    });

    describe("CHK-ROB-01 / WCAG 4.1.3: Visibilidade do Status do Sistema via ToastContainer", () => {
        it("anuncia mensagens de sucesso com role='status' (polite) e erros com role='alert' (assertive)", () => {
            render(() => <ToastContainer />);

            showToast("Agendamento salvo com sucesso!", "success", 5000);
            showToast("Falha ao processar horário.", "error", 5000);

            const statusToast = screen.getByRole("status");
            expect(statusToast).toHaveTextContent("Agendamento salvo com sucesso!");
            expect(statusToast).toHaveAttribute("aria-live", "polite");

            const alertToast = screen.getByRole("alert");
            expect(alertToast).toHaveTextContent("Falha ao processar horário.");
            expect(alertToast).toHaveAttribute("aria-live", "assertive");
        });
    });

    describe("CHK-PER-02 / WCAG 1.3.1: Orientação e Visibilidade em Fluxos Multi-etapas (Stepper)", () => {
        it("marca semanticamente a etapa atual com aria-current='step'", () => {
            render(() => (
                <Stepper
                    steps={["Tipo de conta", "Dados pessoais", "Endereço"]}
                    currentStep={2}
                />
            ));

            const items = screen.getAllByRole("listitem");
            expect(items).toHaveLength(3);
            expect(items[0]).not.toHaveAttribute("aria-current");
            expect(items[1]).toHaveAttribute("aria-current", "step");
            expect(items[2]).not.toHaveAttribute("aria-current");
        });
    });
});
