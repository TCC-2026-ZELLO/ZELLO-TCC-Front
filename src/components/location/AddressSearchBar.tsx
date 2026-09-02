import { Show } from "solid-js";
import { Input } from "../Widgets/Input";
import { Button } from "../Widgets/Button";
import { MapPinIcon } from "../Icons/Icons";

export interface AddressSearchBarProps {
    query: string;
    onInput: (value: string) => void;
    onSubmit: () => void;
    onUseMyLocation: () => void;
    isSearchingAddress: boolean;
    isLocating: boolean;
}

export function AddressSearchBar(props: AddressSearchBarProps) {
    const handleSubmit = (event: SubmitEvent): void => {
        event.preventDefault();
        props.onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div class="flex-1">
                <Input
                    type="search"
                    searchIcon
                    placeholder="Buscar por endereço ou CEP"
                    aria-label="Buscar por endereço ou CEP"
                    value={props.query}
                    onInput={(event) => props.onInput((event.target as HTMLInputElement).value)}
                />
            </div>
            <div class="flex shrink-0 gap-2">
                <Button type="submit" variant="secondary" disabled={props.isSearchingAddress}>
                    {props.isSearchingAddress ? "Buscando…" : "Buscar"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={props.onUseMyLocation}
                    disabled={props.isLocating}
                    aria-label={props.isLocating ? "Localizando sua posição atual" : "Usar minha localização atual"}
                    title={props.isLocating ? "Localizando sua posição atual" : "Usar minha localização atual"}
                >
                    <MapPinIcon class="size-4" aria-hidden="true" />
                    <Show when={!props.isLocating} fallback="Localizando…">
                        Usar minha localização
                    </Show>
                </Button>
            </div>
        </form>
    );
}
