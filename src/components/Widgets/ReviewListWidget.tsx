import { createEffect, createSignal, For, Show } from "solid-js";
import { formatDate, t } from "../../core/i18n";
import {
    getReviewsByBusiness,
    getReviewsByProfessional,
    type Review,
} from "../../services/reviews.service";
import { StarIcon } from "../Icons/Icons";

interface ReviewListProps {
    professionalId?: string;
    businessId?: string;
}

export const ReviewListWidget = (props: ReviewListProps) => {
    const [reviews, setReviews] = createSignal<Review[]>([]);
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        const proId = props.professionalId;
        const bizId = props.businessId;
        if (!proId && !bizId) {
            setReviews([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const promise = proId
            ? getReviewsByProfessional(proId)
            : getReviewsByBusiness(bizId!);
        promise
            .then((data) => setReviews(Array.isArray(data) ? data : []))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    });

    const StarRating = (p: { val: number }) => (
        <div class="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    class={`${
                        p.val >= star ? "text-amber-400" : "text-muted-foreground/30"
                    }`}
                >
                    <StarIcon size={16} fill="currentColor" />
                </span>
            ))}
        </div>
    );

    return (
        <div class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Show
                when={!loading()}
                fallback={
                    <div class="animate-pulse p-8 text-center text-muted-foreground">
                        {t().widgets.loadingReviews}
                    </div>
                }
            >
                <Show
                    when={reviews().length > 0}
                    fallback={
                        <div class="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center text-muted-foreground">
                            {t().reviews.noReviews}
                        </div>
                    }
                >
                    <For each={reviews()}>
                        {(review) => (
                            <div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                                <div class="flex flex-wrap items-start justify-between gap-2">
                                    <div class="flex items-center gap-3">
                                        <img
                                            src={
                                                review.client?.photoUrl ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client?.name || "Z")}&background=random`
                                            }
                                            class="h-10 w-10 rounded-full border border-border object-cover"
                                            alt={t().widgets.clientPhotoAlt}
                                        />
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-foreground">
                                                {review.client?.name}
                                            </span>
                                            <span class="text-xs text-muted-foreground">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <StarRating val={review.rating} />
                                </div>
                                <p class="text-sm leading-relaxed text-foreground">
                                    "{review.comment}"
                                </p>

                                <Show when={review.responseText}>
                                    <div class="mt-1 ml-2 flex flex-col gap-1 border-l-2 border-primary/50 pl-4">
                                        <span class="text-xs font-bold text-primary">
                                            {review.targetType === "PROFESSIONAL"
                                                ? t().reviews.response.fromProfessional
                                                : t().reviews.response.fromBusiness}
                                        </span>
                                        <p class="text-sm leading-relaxed text-muted-foreground">
                                            {review.responseText}
                                        </p>
                                    </div>
                                </Show>
                            </div>
                        )}
                    </For>
                </Show>
            </Show>
        </div>
    );
};
