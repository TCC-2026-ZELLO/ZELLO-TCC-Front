import { For, JSX, splitProps } from "solid-js";
import { StarIcon } from "~/components/Icons/Icons";

export interface RatingProps extends JSX.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
}

export function Rating(props: RatingProps) {
    const [local, rest] = splitProps(props, ["value", "max", "class"]);

    const maxStars = () => local.max || 5;
    const stars = () => Array.from({ length: maxStars() }, (_, i) => i + 1);

    return (
        <div class={`flex items-center gap-0.5 ${local.class || ""}`} {...rest}>
            <For each={stars()}>
                {(star) => (
                    <StarIcon
                        class="size-4 text-muted-foreground/40 transition-colors duration-200 data-[active=true]:text-warning"
                        data-active={star <= local.value}
                    />
                )}
            </For>
        </div>
    );
}