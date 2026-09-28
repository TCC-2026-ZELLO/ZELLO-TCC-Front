import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Modal } from "../Widgets/Modal";
import { Rating } from "../Widgets/Rating";
import { Badge } from "../Widgets/Badge";
import { Button } from "../Widgets/Button";
import type { ServiceLocation } from "../../types/location";

export interface ServicePreviewModalProps {
    service: ServiceLocation | null;
    onClose: () => void;
}

/**
 * Modal de pré-visualização aberto ao clicar num pin/resultado. O link para
 * o perfil completo usa a rota real do projeto (`/business_profile/:id`) —
 * o mockup da RF13 citava `/profiles/{id}`, que não existe nesta base.
 */
export function ServicePreviewModal(props: ServicePreviewModalProps) {
    const navigate = useNavigate();

    const goToFullProfile = (service: ServiceLocation): void => {
        props.onClose();
        navigate(`/business_profile/${service.id}`);
    };

    return (
        <Show when={props.service}>
            {(service) => (
                <Modal isOpen={props.service !== null} onClose={props.onClose} title={service().name} size="md">
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <Rating value={service().rating} />
                            <Badge>{service().category}</Badge>
                        </div>
                        <p class="text-sm text-muted-foreground">{service().services}</p>
                        <p class="text-xs font-medium text-muted-foreground">
                            A {service().distanceKm.toFixed(1)} km da localização buscada
                        </p>
                        <Button onClick={() => goToFullProfile(service())} class="w-full justify-center">
                            Ver perfil completo
                        </Button>
                    </div>
                </Modal>
            )}
        </Show>
    );
}
