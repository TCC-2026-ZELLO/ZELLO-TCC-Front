import { Show } from "solid-js";
import { t } from "../../core/i18n";
import { MapPinIcon } from "../Icons/Icons";
import { Button } from "../Widgets/Button";
import { Input } from "../Widgets/Input";

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
        <form
            onSubmit={handleSubmit}
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
        >
            <div class="flex-1">
                <Input
                    type="search"
                    searchIcon
                    placeholder={t().location.searchPlaceholder}
                    aria-label={t().location.searchPlaceholder}
                    value={props.query}
                    onInput={(event) =>
                        props.onInput((event.target as HTMLInputElement).value)
                    }
                />
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
                <Button
                    type="submit"
                    variant="secondary"
                    disabled={props.isSearchingAddress}
                >
                    {props.isSearchingAddress
                        ? t().location.searchingButton
                        : t().location.searchButton}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={props.onUseMyLocation}
                    disabled={props.isLocating}
                    aria-label={
                        props.isLocating
                            ? t().location.locatingAria
                            : t().location.useMyLocationAria
                    }
                    title={
                        props.isLocating
                            ? t().location.locatingAria
                            : t().location.useMyLocationAria
                    }
                >
                    <MapPinIcon class="size-4" aria-hidden="true" />
                    <Show
                        when={!props.isLocating}
                        fallback={t().location.locating}
                    >
                        {t().location.useMyLocation}
                    </Show>
                </Button>
            </div>
        </form>
    );
}
