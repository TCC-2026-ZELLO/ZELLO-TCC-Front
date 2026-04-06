import { For } from "solid-js";
import "./Rating.css";


export function Rating(props: { value: number; max?: number }){
    const maxStars = props.max || 5;
    const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

    return (
        <div class="zello-rating">
            <For each={stars}>
                {(star) => (
                    <svg
                        class="zello-star"
                        data-active={star <= props.value}
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                )}
            </For>
        </div>
    );
}