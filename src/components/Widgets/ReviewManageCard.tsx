import { createSignal, Show } from "solid-js";
import { formatDate, localizeDomain, t } from "../../core/i18n";
import {
    deleteReviewResponse,
    respondToReview,
    type Review,
    updateReviewResponse,
} from "../../services/reviews.service";
import { toast } from "../../store/toastStore";
import { EditIcon, ReplyIcon, StarIcon, TrashIcon } from "../Icons/Icons";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ReviewManageCardProps {
    review: Review;
    /** Só o Gestor do estabelecimento pode excluir uma resposta (RF26 - CA5). */
    canDelete: boolean;
    onChanged: () => void;
}

export const ReviewManageCard = (props: ReviewManageCardProps) => {
    const [isEditing, setIsEditing] = createSignal(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = createSignal(false);
    const [text, setText] = createSignal(props.review.responseText || "");
    const [submitting, setSubmitting] = createSignal(false);

    const hasResponse = () => !!props.review.responseText;

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

    const startEditing = () => {
        setText(props.review.responseText || "");
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setText(props.review.responseText || "");
    };

    const submit = async () => {
        if (text().trim().length < 5) {
            toast.error(t().reviews.response.tooShort);
            return;
        }

        setSubmitting(true);
        try {
            if (hasResponse()) {
                await updateReviewResponse(props.review.id, { text: text().trim() });
                toast.success(t().reviews.response.updateSuccess);
            } else {
                await respondToReview(props.review.id, { text: text().trim() });
                toast.success(t().reviews.response.success);
            }
            setIsEditing(false);
            props.onChanged();
        } catch (e: any) {
            toast.error(localizeDomain.apiError(e?.message, t().reviews.response.error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirmed = async () => {
        setSubmitting(true);
        try {
            await deleteReviewResponse(props.review.id);
            toast.success(t().reviews.response.deleteSuccess);
            setConfirmDeleteOpen(false);
            props.onChanged();
        } catch (e: any) {
            toast.error(localizeDomain.apiError(e?.message, t().reviews.response.error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="flex items-center gap-3">
                    <img
                        src={
                            props.review.client?.photoUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(props.review.client?.name || "Z")}&background=random`
                        }
                        class="h-10 w-10 rounded-full border border-border object-cover"
                        alt={t().widgets.clientPhotoAlt}
                    />
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-foreground">
                            {props.review.client?.name}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            {formatDate(props.review.createdAt)}
                        </span>
                    </div>
                </div>
                <StarRating val={props.review.rating} />
            </div>

            <p class="text-sm leading-relaxed text-foreground">"{props.review.comment}"</p>

            <Show
                when={!isEditing()}
                fallback={
                    <div class="mt-1 flex flex-col gap-2">
                        <textarea
                            class="w-full resize-none rounded-lg border border-border bg-secondary/40 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows="3"
                            placeholder={t().reviews.response.placeholder}
                            value={text()}
                            onInput={(e) => setText(e.currentTarget.value)}
                        />
                        <div class="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                                disabled={submitting()}
                            >
                                {t().reviews.response.cancel}
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={submit}
                                disabled={submitting() || text().trim().length < 5}
                            >
                                <Show
                                    when={submitting()}
                                    fallback={t().reviews.response.save}
                                >
                                    {t().common.wait}
                                </Show>
                            </Button>
                        </div>
                    </div>
                }
            >
                <Show
                    when={hasResponse()}
                    fallback={
                        <Button
                            variant="outline"
                            size="sm"
                            class="self-start"
                            onClick={startEditing}
                        >
                            <ReplyIcon size={16} class="mr-1" /> {t().reviews.response.reply}
                        </Button>
                    }
                >
                    <div class="mt-1 ml-2 flex flex-col gap-2 border-l-2 border-primary/50 pl-4">
                        <span class="text-xs font-bold text-primary">
                            {props.review.targetType === "PROFESSIONAL"
                                ? t().reviews.response.fromProfessional
                                : t().reviews.response.fromBusiness}
                        </span>
                        <p class="text-sm leading-relaxed text-muted-foreground">
                            {props.review.responseText}
                        </p>

                        <div class="mt-1 flex flex-wrap gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={startEditing}
                                disabled={submitting()}
                            >
                                <EditIcon size={14} class="mr-1" />{" "}
                                {t().reviews.response.edit}
                            </Button>
                            <Show when={props.canDelete}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="text-error"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                    disabled={submitting()}
                                >
                                    <TrashIcon size={14} class="mr-1" />{" "}
                                    {t().reviews.response.delete}
                                </Button>
                            </Show>
                        </div>
                    </div>
                </Show>
            </Show>

            <Modal
                isOpen={confirmDeleteOpen()}
                onClose={() => setConfirmDeleteOpen(false)}
                title={t().reviews.response.delete}
                size="md"
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        {t().reviews.response.deleteConfirm}
                    </p>
                    <div class="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteOpen(false)}
                            disabled={submitting()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteConfirmed}
                            disabled={submitting()}
                        >
                            {submitting() ? t().common.wait : t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
