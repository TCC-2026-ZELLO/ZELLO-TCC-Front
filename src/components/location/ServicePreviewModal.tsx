import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { formatDistance, localizeDomain, t } from "../../core/i18n";
import type { ServiceLocation } from "../../types/location";
import { Badge } from "../Widgets/Badge";
import { Button } from "../Widgets/Button";
import { Modal } from "../Widgets/Modal";
import { Rating } from "../Widgets/Rating";

export interface ServicePreviewModalProps {
    service: ServiceLocation | null;
    onClose: () => void;
}

export function ServicePreviewModal(props: ServicePreviewModalProps) {
    const navigate = useNavigate();

    const goToFullProfile = (service: ServiceLocation): void => {
        props.onClose();
        navigate(`/business_profile/${service.id}`);
    };

    return (
        <Show when={props.service}>
            {(service) => (
                <Modal
                    isOpen={props.service !== null}
                    onClose={props.onClose}
                    title={service().name}
                    size="md"
                >
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <Rating value={service().rating} />
                            <Badge>
                                {localizeDomain.category(service().category)}
                            </Badge>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {localizeDomain.serviceList(service().services)}
                        </p>
                        <p class="text-xs font-medium text-muted-foreground">
                            {t().location.distanceAway(
                                formatDistance(service().distanceKm),
                            )}
                        </p>
                        <Button
                            onClick={() => goToFullProfile(service())}
                            class="w-full justify-center"
                        >
                            {t().location.viewFullProfile}
                        </Button>
                    </div>
                </Modal>
            )}
        </Show>
    );
}
