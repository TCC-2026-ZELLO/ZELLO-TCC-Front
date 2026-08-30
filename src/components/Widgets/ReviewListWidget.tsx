import { createSignal, createEffect, Show, For } from "solid-js";
import { StarIcon } from "../Icons/Icons";
import { t } from "../../store/appState";
import { getReviewsByProfessional, getReviewsByBusiness, Review } from "../../services/reviews.service";

interface ReviewListProps {
    professionalId?: string;
    businessId?: string;
}

export const ReviewListWidget = (props: ReviewListProps) => {
    const [reviews, setReviews] = createSignal<Review[]>([]);
    const [loading, setLoading] = createSignal(true);

    createEffect(async () => {
        try {
            setLoading(true);
            let data: Review[] = [];
            if (props.professionalId) {
                data = await getReviewsByProfessional(props.professionalId);
            } else if (props.businessId) {
                data = await getReviewsByBusiness(props.businessId);
            }
            setReviews(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    });

    const StarRating = (p: { val: number }) => {
        return (
            <div class="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span class={`${p.val >= star ? 'text-amber-400' : 'text-muted-foreground/30'}`}>
                        <StarIcon size={16} fill="currentColor" />
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString();
    };

    return (
        <div class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Show when={!loading()} fallback={<div class="p-8 text-center text-muted-foreground animate-pulse">Carregando avaliações...</div>}>
                <Show when={reviews().length > 0} fallback={
                    <div class="p-8 text-center text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                        {t().reviews.noReviews}
                    </div>
                }>
                    <For each={reviews()}>
                        {(review) => (
                            <div class="flex flex-col gap-3 p-5 bg-card border border-border rounded-xl">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-3">
                                        <img 
                                            src={review.client?.photoUrl || `https://ui-avatars.com/api/?name=${review.client?.name}&background=random`} 
                                            class="w-10 h-10 rounded-full border border-border object-cover" 
                                            alt="Foto do cliente"
                                        />
                                        <div class="flex flex-col">
                                            <span class="font-bold text-sm text-foreground">{review.client?.name}</span>
                                            <span class="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                                        </div>
                                    </div>
                                    <StarRating val={review.rating} />
                                </div>
                                <p class="text-sm text-foreground leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                        )}
                    </For>
                </Show>
            </Show>
        </div>
    );
};
