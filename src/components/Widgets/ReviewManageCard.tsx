import { createSignal, Show } from "solid-js";
import { Button } from "./Button";
import { StarIcon, ReplyIcon, EditIcon, TrashIcon } from "../Icons/Icons";
import { t } from "../../store/appState";
import { toast } from "../../store/toastStore";
import {
    Review,
    respondToReview,
    updateReviewResponse,
    deleteReviewResponse,
} from "../../services/reviews.service";

interface ReviewManageCardProps {
    review: Review;
    /** Só o Gestor do estabelecimento pode excluir uma resposta (RF26 - CA5). */
    canDelete: boolean;
    onChanged: () => void;
}

/**
 * RF26 - Responder aos comentários e avaliações dos clientes.
 * Usado nas telas de gestão (Configurações do Profissional / Empresa) para
 * criar, editar e (quando permitido) excluir a resposta a uma avaliação.
 */
export const ReviewManageCard = (props: ReviewManageCardProps) => {
    const [isEditing, setIsEditing] = createSignal(false);
    const [text, setText] = createSignal(props.review.responseText || "");
    const [submitting, setSubmitting] = createSignal(false);

    const hasResponse = () => !!props.review.responseText;

    const StarRating = (p: { val: number }) => (
        <div class="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span class={`${p.val >= star ? 'text-amber-400' : 'text-muted-foreground/30'}`}>
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
            toast.error(e.message || t().reviews.response.error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t().reviews.response.deleteConfirm)) return;

        setSubmitting(true);
        try {
            await deleteReviewResponse(props.review.id);
            toast.success(t().reviews.response.deleteSuccess);
            props.onChanged();
        } catch (e: any) {
            toast.error(e.message || t().reviews.response.error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div class="flex flex-col gap-3 p-5 bg-card border border-border rounded-xl">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <img
                        src={props.review.client?.photoUrl || `https://ui-avatars.com/api/?name=${props.review.client?.name}&background=random`}
                        class="w-10 h-10 rounded-full border border-border object-cover"
                        alt="Foto do cliente"
                    />
                    <div class="flex flex-col">
                        <span class="font-bold text-sm text-foreground">{props.review.client?.name}</span>
                        <span class="text-xs text-muted-foreground">
                            {new Date(props.review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <StarRating val={props.review.rating} />
            </div>

            <p class="text-sm text-foreground leading-relaxed">"{props.review.comment}"</p>

            <Show
                when={!isEditing()}
                fallback={
                    <div class="flex flex-col gap-2 mt-1">
                        <textarea
                            class="w-full bg-secondary/40 border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows="3"
                            placeholder={t().reviews.response.placeholder}
                            value={text()}
                            onInput={(e) => setText(e.currentTarget.value)}
                        />
                        <div class="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={cancelEditing} disabled={submitting()}>
                                {t().reviews.response.cancel}
                            </Button>
                            <Button variant="primary" size="sm" onClick={submit} disabled={submitting() || text().trim().length < 5}>
                                <Show when={submitting()} fallback={t().reviews.response.save}>{t().common.wait}</Show>
                            </Button>
                        </div>
                    </div>
                }
            >
                <Show
                    when={hasResponse()}
                    fallback={
                        <Button variant="outline" size="sm" class="self-start" onClick={startEditing}>
                            <ReplyIcon size={16} class="mr-1" /> {t().reviews.response.reply}
                        </Button>
                    }
                >
                    <div class="mt-1 ml-2 pl-4 border-l-2 border-primary/50 flex flex-col gap-2">
                        <span class="text-xs font-bold text-primary">
                            {props.review.targetType === 'PROFESSIONAL'
                                ? t().reviews.response.fromProfessional
                                : t().reviews.response.fromBusiness}
                        </span>
                        <p class="text-sm text-muted-foreground leading-relaxed">{props.review.responseText}</p>

                        <div class="flex gap-2 mt-1">
                            <Button variant="ghost" size="sm" onClick={startEditing} disabled={submitting()}>
                                <EditIcon size={14} class="mr-1" /> {t().reviews.response.edit}
                            </Button>
                            <Show when={props.canDelete}>
                                <Button variant="ghost" size="sm" class="text-error" onClick={handleDelete} disabled={submitting()}>
                                    <TrashIcon size={14} class="mr-1" /> {t().reviews.response.delete}
                                </Button>
                            </Show>
                        </div>
                    </div>
                </Show>
            </Show>
        </div>
    );
};
