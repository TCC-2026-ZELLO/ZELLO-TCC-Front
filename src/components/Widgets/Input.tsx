import { splitProps, JSX, Show, createSignal } from "solid-js";
import { SearchIcon, EyeIcon, EyeOffIcon } from "~/components/Icons/Icons";

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  type?: "text" | "email" | "password" | "number" | "search" | "tel" | "time";
  labelText?: string;
  searchIcon?: boolean;
  error?: string;
  validate?: (value: string) => string | null | undefined;
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, [
    "labelText",
    "searchIcon",
    "class",
    "error",
    "validate",
    "onBlur",
    "onInput",
    "type",
  ]);

  const [internalError, setInternalError] = createSignal<string | null>(null);
  const [showPassword, setShowPassword] = createSignal(false);

  const currentError = () => local.error || internalError();

  const handleBlur = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement;
    if (local.validate) {
      setInternalError(local.validate(target.value) || null);
    }
    if (typeof local.onBlur === "function") {
      local.onBlur(e as any);
    }
  };

  const handleInput = (e: InputEvent) => {
    if (internalError()) {
      setInternalError(null);
    }
    if (typeof local.onInput === "function") {
      local.onInput(e as any);
    }
  };

  const inputType = () => {
    if (local.type === "password") {
      return showPassword() ? "text" : "password";
    }
    return local.type || "text";
  };

  return (
    <label
      class={`flex w-full cursor-text flex-col gap-2 ${local.class || ""}`}
    >
      <Show when={local.labelText}>
        <span class="text-xs font-semibold uppercase text-muted-foreground">
          {local.labelText}
        </span>
      </Show>

      <div class="relative flex w-full items-center">
        <Show when={local.searchIcon}>
          <div class="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground">
            <SearchIcon />
          </div>
        </Show>

        <input
          class="h-12 w-full rounded-lg border border-border bg-[var(--color-input-background,transparent)] px-4 py-2 font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary data-[has-icon=true]:pl-10 data-[invalid=true]:border-error data-[invalid=true]:focus:border-error data-[invalid=true]:focus:ring-error"
          classList={{ "pr-10": local.type === "password" }}
          type={inputType()}
          data-has-icon={!!local.searchIcon}
          data-invalid={!!currentError()}
          onBlur={handleBlur}
          onInput={handleInput}
          {...rest}
        />

        <Show when={local.type === "password"}>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword())}
            class="absolute right-3 flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground"
            title={showPassword() ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword() ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </Show>
      </div>

      <Show when={currentError()}>
        <span class="mt-1 block text-xs text-error">{currentError()}</span>
      </Show>
    </label>
  );
}
