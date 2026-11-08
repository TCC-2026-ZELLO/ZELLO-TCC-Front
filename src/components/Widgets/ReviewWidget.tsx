import { createEffect, createSignal, For, Show } from "solid-js";
import { ReviewEligibilityPolicy } from "../../core/domain/policies/ReviewEligibilityPolicy";
import { localizeDomain, t } from "../../core/i18n";
import {
    createReview,
    getReviewsByAppointment,
    type Review,
} from "../../services/reviews.service";
import { toast } from "../../store/toastStore";
import { StarIcon } from "../Icons/Icons";
import { Button } from "./Button";

export const ReviewWidget = (props: { appointment: any; onReviewed: () => void }) => {
    const [existingReviews, setExistingReviews] = createSignal<Review[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [submitting, setSubmitting] = createSignal(false);

    const [rating, setRating] = createSignal(0);
    const [hoverRating, setHoverRating] = createSignal(0);
    const [comment, setComment] = createSignal("");
    const [targetType, setTargetType] = createSignal<"PROFESSIONAL" | "BUSINESS">(
        "PROFESSIONAL",
    );

    createEffect(() => {
        const apptId = props.appointment?.id;
        if (!apptId) return;
        setLoading(true);
        getReviewsByAppointment(apptId)
            .then((data) => setExistingReviews(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    });

    const existingTypes = () => existingReviews().map((r) => r.targetType);

    const canReviewProfessional = () =>
        ReviewEligibilityPolicy.canReviewTarget(
            "PROFESSIONAL",
            props.appointment,
            existingTypes(),
        );
    const canReviewBusiness = () =>
        ReviewEligibilityPolicy.canReviewTarget(
            "BUSINESS",
            props.appointment,
            existingTypes(),
        );

    createEffect(() => {
        if (!loading()) {
            if (canReviewProfessional()) setTargetType("PROFESSIONAL");
            else if (canReviewBusiness()) setTargetType("BUSINESS");
        }
    });

    const isExpired = () => ReviewEligibilityPolicy.isExpired(props.appointment?.date ?? "");

    const submitReview = async () => {
        if (rating() < 1 || rating() > 5) {
            return toast.error(t().widgets.selectRatingError);
        }
        if (comment().trim().length < 10) {
            return toast.error(t().reviews.commentLabel);
        }

        setSubmitting(true);
        try {
            await createReview({
                appointmentId: props.appointment.id,
                rating: rating(),
                comment: comment().trim(),
                targetType: targetType(),
            });
            toast.success(t().reviews.success);
            setRating(0);
            setComment("");
            const data = await getReviewsByAppointment(props.appointment.id);
            setExistingReviews(Array.isArray(data) ? data : []);
            props.onReviewed();
        } catch (e: any) {
            toast.error(localizeDomain.apiError(e?.message, t().reviews.error));
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = (p: {
        val: number;
        hover: number;
        setVal?: (v: number) => void;
        setHover?: (v: number) => void;
        readonly?: boolean;
    }) => (
        <div class="flex gap-1" onMouseLeave={() => p.setHover?.(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    type="button"
                    class={`transition-colors ${p.readonly ? "cursor-default" : "cursor-pointer"} ${
                        (p.hover || p.val) >= star
                            ? "text-amber-400"
                            : "text-muted-foreground/30"
                    }`}
                    onMouseEnter={() => p.setHover?.(star)}
                    onClick={() => p.setVal?.(star)}
                    disabled={p.readonly}
                >
                    <StarIcon size={24} fill="currentColor" />
                </button>
            ))}
        </div>
    );

    return (
        <div class="mt-2 flex flex-col gap-4 rounded-xl border border-border bg-secondary/40 p-4">
            <Show when={!loading()}>
                <Show when={existingReviews().length > 0}>
                    <div class="mb-2 flex flex-col gap-3">
                        <h4 class="text-sm font-bold text-foreground">
                            {t().reviews.readOnlyTitle}
                        </h4>
                        <For each={existingReviews()}>
                            {(r) => (
                                <div class="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="text-xs font-semibold text-primary">
                                            {r.targetType === "PROFESSIONAL"
                                                ? t().reviews.professional
                                                : t().reviews.business}
                                        </span>
                                        <StarRating val={r.rating} hover={0} readonly />
                                    </div>
                                    <p class="text-sm italic text-foreground">"{r.comment}"</p>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>

                <Show when={canReviewProfessional() || canReviewBusiness()}>
                    <Show
                        when={!isExpired()}
                        fallback={
                            <p class="py-2 text-center text-sm italic text-error">
                                {t().reviews.expired}
                            </p>
                        }
                    >
                        <div class="flex flex-col gap-3">
                            <Show when={canReviewProfessional() && canReviewBusiness()}>
                                <div>
                                    <label class="mb-1 block text-xs font-bold text-muted-foreground">
                                        {t().reviews.targetType}
                                    </label>
                                    <select
                                        class="w-full rounded-lg border border-border bg-card p-2 text-sm text-foreground"
                                        value={targetType()}
                                        onChange={(e) =>
                                            setTargetType(e.currentTarget.value as any)
                                        }
                                    >
                                        <option value="PROFESSIONAL">
                                            {t().reviews.professional}
                                        </option>
                                        <option value="BUSINESS">
                                            {t().reviews.business}
                                        </option>
                                    </select>
                                </div>
                            </Show>

                            <div class="flex flex-col items-center gap-2 py-2">
                                <span class="text-sm font-bold text-foreground">
                                    {targetType() === "PROFESSIONAL"
                                        ? t().reviews.rateProfessional
                                        : t().reviews.rateBusiness}
                                </span>
                                <StarRating
                                    val={rating()}
                                    hover={hoverRating()}
                                    setVal={setRating}
                                    setHover={setHoverRating}
                                />
                            </div>

                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-bold text-muted-foreground">
                                    {t().reviews.commentLabel}
                                </label>
                                <textarea
                                    class="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    rows="3"
                                    placeholder={t().reviews.commentPlaceholder}
                                    value={comment()}
                                    onInput={(e) => setComment(e.currentTarget.value)}
                                />
                            </div>

                            <Button
                                variant="primary"
                                class="mt-2 w-full"
                                onClick={submitReview}
                                disabled={
                                    submitting() ||
                                    rating() === 0 ||
                                    comment().trim().length < 10
                                }
                            >
                                {submitting() ? t().common.wait : t().reviews.submit}
                            </Button>
                        </div>
                    </Show>
                </Show>
            </Show>
        </div>
    );
};
