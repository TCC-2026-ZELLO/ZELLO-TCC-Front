import { createSignal, createEffect, Show } from "solid-js";
import { Button } from "./Button";
import { StarIcon } from "../Icons/Icons";
import { t } from "../../store/appState";
import { toast } from "../../store/toastStore";
import { createReview, getReviewsByAppointment, Review } from "../../services/reviews.service";

export const ReviewWidget = (props: { appointment: any, onReviewed: () => void }) => {
    const [existingReviews, setExistingReviews] = createSignal<Review[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [submitting, setSubmitting] = createSignal(false);
    
    // Form state
    const [rating, setRating] = createSignal(0);
    const [hoverRating, setHoverRating] = createSignal(0);
    const [comment, setComment] = createSignal("");
    const [targetType, setTargetType] = createSignal<'PROFESSIONAL' | 'BUSINESS'>('PROFESSIONAL');

    createEffect(async () => {
        try {
            const data = await getReviewsByAppointment(props.appointment.id);
            setExistingReviews(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    });

    const hasProfessionalReview = () => existingReviews().some(r => r.targetType === 'PROFESSIONAL');
    const hasBusinessReview = () => existingReviews().some(r => r.targetType === 'BUSINESS');

    const canReviewProfessional = () => props.appointment.professional && !hasProfessionalReview();
    const canReviewBusiness = () => props.appointment.business && !hasBusinessReview();

    // Setup initial target type
    createEffect(() => {
        if (!loading()) {
            if (canReviewProfessional()) setTargetType('PROFESSIONAL');
            else if (canReviewBusiness()) setTargetType('BUSINESS');
        }
    });

    const isExpired = () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(props.appointment.date) < thirtyDaysAgo;
    };

    const submitReview = async () => {
        if (rating() < 1 || rating() > 5) return toast.error("Selecione uma nota de 1 a 5.");
        if (comment().length < 10) return toast.error(t().reviews.commentLabel);

        setSubmitting(true);
        try {
            await createReview({
                appointmentId: props.appointment.id,
                rating: rating(),
                comment: comment(),
                targetType: targetType()
            });
            toast.success(t().reviews.success);
            setRating(0);
            setComment("");
            const data = await getReviewsByAppointment(props.appointment.id);
            setExistingReviews(data);
            props.onReviewed();
        } catch (e: any) {
            toast.error(e.message || t().reviews.error);
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = (p: { val: number, hover: number, setVal?: (v: number) => void, setHover?: (v: number) => void, readonly?: boolean }) => {
        return (
            <div class="flex gap-1" onMouseLeave={() => p.setHover?.(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        class={`transition-colors ${p.readonly ? 'cursor-default' : 'cursor-pointer'} ${(p.hover || p.val) >= star ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                        onMouseEnter={() => p.setHover?.(star)}
                        onClick={() => p.setVal?.(star)}
                        disabled={p.readonly}
                    >
                        <StarIcon size={24} fill="currentColor" />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div class="flex flex-col gap-4 p-4 rounded-xl bg-secondary/50 border border-border mt-2">
            <Show when={!loading()}>
                
                {/* Existing Reviews */}
                <Show when={existingReviews().length > 0}>
                    <div class="flex flex-col gap-3 mb-2">
                        <h4 class="text-sm font-bold text-foreground">{t().reviews.readOnlyTitle}</h4>
                        {existingReviews().map(r => (
                            <div class="p-3 bg-card border border-border rounded-lg flex flex-col gap-2">
                                <div class="flex justify-between items-center">
                                    <span class="text-xs font-semibold text-primary">
                                        {r.targetType === 'PROFESSIONAL' ? t().reviews.professional : t().reviews.business}
                                    </span>
                                    <StarRating val={r.rating} hover={0} readonly />
                                </div>
                                <p class="text-sm text-foreground italic">"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                </Show>

                {/* Form */}
                <Show when={canReviewProfessional() || canReviewBusiness()}>
                    <Show when={!isExpired()} fallback={
                        <p class="text-sm text-red-500 italic text-center py-2">{t().reviews.expired}</p>
                    }>
                        <div class="flex flex-col gap-3">
                            <Show when={canReviewProfessional() && canReviewBusiness()}>
                                <div>
                                    <label class="text-xs font-bold text-muted-foreground mb-1 block">{t().reviews.targetType}</label>
                                    <select 
                                        class="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground"
                                        value={targetType()}
                                        onChange={(e) => setTargetType(e.target.value as any)}
                                    >
                                        <option value="PROFESSIONAL">{t().reviews.professional}</option>
                                        <option value="BUSINESS">{t().reviews.business}</option>
                                    </select>
                                </div>
                            </Show>

                            <div class="flex flex-col items-center gap-2 py-2">
                                <span class="text-sm font-bold text-foreground">
                                    {targetType() === 'PROFESSIONAL' ? t().reviews.rateProfessional : t().reviews.rateBusiness}
                                </span>
                                <StarRating val={rating()} hover={hoverRating()} setVal={setRating} setHover={setHoverRating} />
                            </div>

                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-bold text-muted-foreground">{t().reviews.commentLabel}</label>
                                <textarea
                                    class="w-full bg-card border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    rows="3"
                                    placeholder={t().reviews.commentPlaceholder}
                                    value={comment()}
                                    onInput={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <Button 
                                variant="primary" 
                                class="w-full mt-2" 
                                onClick={submitReview}
                                disabled={submitting() || rating() === 0 || comment().length < 10}
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
