import { useParams } from "@solidjs/router";
import { createResource, createSignal, For, Show } from "solid-js";
import {
    CalendarIcon,
    CheckCircleIcon,
    MapPinIcon,
    RibbonIcon,
    StarIcon,
} from "../components/Icons/Icons";
import { BookingModal } from "../components/Widgets/BookingModal";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { ReviewListWidget } from "../components/Widgets/ReviewListWidget";
import { Tabs } from "../components/Widgets/Tabs";
import {
    formatDecimal,
    formatMoney,
    formatMoneyHint,
    localizeDomain,
    t,
} from "../core/i18n";
import { professionalService } from "../services/professional.service";

const TYPE_COLORS: Record<string, string> = {
    diploma: "bg-primary/15 text-primary",
    specialization: "bg-secondary text-secondary-foreground",
    course: "bg-success/15 text-success",
    certification: "bg-warning/15 text-warning-foreground",
};

export default function PublicProfile() {
    const params = useParams();
    const [activeTab, setActiveTab] = createSignal("servicos");
    const [selectedServiceForBooking, setSelectedServiceForBooking] =
        createSignal<any>(null);

    const [profile] = createResource(
        () => params.id,
        professionalService.getPublicProfile,
    );
    const [services] = createResource(
        () => params.id,
        professionalService.getServices,
    );
    const [portfolio] = createResource(
        () => params.id,
        professionalService.getPortfolio,
    );
    const [qualifications] = createResource(
        () => params.id,
        professionalService.getQualifications,
    );

    const firstBookableService = () => (services() ?? [])[0] ?? null;

    return (
        <Show
            when={!profile.loading}
            fallback={
                <div class="mx-auto max-w-5xl animate-pulse p-8 text-center text-muted-foreground">
                    {t().publicProfile.loading}
                </div>
            }
        >
            <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pb-20 sm:py-8">
                {/* HEADER CARD */}
                <Card class="relative overflow-hidden border border-border bg-card p-0 shadow-sm">
                    <div class="relative h-44 w-full bg-muted sm:h-48">
                        <Show
                            when={profile()?.bannerUrl}
                            fallback={
                                <div class="h-full w-full bg-gradient-to-r from-primary/60 to-primary" />
                            }
                        >
                            <img
                                src={profile()?.bannerUrl}
                                class="h-full w-full object-cover"
                                alt={t().publicProfile.bannerAlt}
                            />
                        </Show>
                    </div>

                    <div class="relative flex flex-col items-center gap-5 px-6 pb-6 pt-0 sm:flex-row sm:items-center sm:px-10 sm:py-6">
                        <img
                            src={
                                profile()?.photoUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile()?.user?.name || profile()?.name || "P")}&background=random`
                            }
                            alt={t().publicProfile.avatarAlt}
                            class="-mt-14 size-28 shrink-0 rounded-2xl border-4 border-background bg-background object-cover shadow-md sm:-mt-16 sm:size-36"
                        />

                        <div class="flex min-w-0 flex-1 flex-col items-center py-2 text-center sm:items-start sm:text-left">
                            <h1 class="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold text-foreground sm:justify-start sm:text-3xl">
                                <span>{profile()?.user?.name || profile()?.name}</span>
                                <Show when={profile()?.visibilityStatus}>
                                    <span
                                        class="inline-flex shrink-0 text-primary"
                                        title={t().publicProfile.verified}
                                    >
                                        <CheckCircleIcon />
                                    </span>
                                </Show>
                            </h1>
                            <p class="text-base font-medium text-muted-foreground sm:text-lg">
                                {localizeDomain.specialty(
                                    profile()?.specialty ||
                                        t().publicProfile.defaultSpecialty,
                                )}
                            </p>

                            <div class="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
                                <div class="flex items-center gap-1 font-semibold text-foreground">
                                    <span class="text-warning">
                                        <StarIcon />
                                    </span>
                                    {formatDecimal(
                                        Number(profile()?.averageRating ?? 5),
                                    )}
                                    <span class="ml-1 font-normal text-muted-foreground">
                                        {t().publicProfile.ratingsCount(
                                            profile()?.reviewCount ?? 0,
                                        )}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1 text-muted-foreground">
                                    <MapPinIcon />{" "}
                                    {profile()?.city ||
                                        t().publicProfile.defaultLocation}
                                </div>
                            </div>
                        </div>

                        <div class="w-full sm:w-auto">
                            <Button
                                variant="primary"
                                disabled={!firstBookableService()}
                                title={
                                    !firstBookableService()
                                        ? t().publicProfile.noServicesTooltip
                                        : undefined
                                }
                                onClick={() =>
                                    firstBookableService() &&
                                    setSelectedServiceForBooking(
                                        firstBookableService(),
                                    )
                                }
                                class="flex w-full items-center justify-center gap-2 px-7 py-3 text-base shadow-lg sm:w-auto"
                            >
                                <CalendarIcon class="size-5" />{" "}
                                {t().publicProfile.bookNow}
                            </Button>
                        </div>
                    </div>
                </Card>

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    {/* COLUNA LATERAL */}
                    <div class="flex flex-col gap-6 lg:col-span-1">
                        <Card class="p-6">
                            <h3 class="mb-3 text-lg font-bold text-foreground">
                                {t().publicProfile.about}
                            </h3>
                            <p class="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                {profile()?.biography || t().publicProfile.noBio}
                            </p>
                        </Card>

                        <Show when={(qualifications() ?? []).length > 0}>
                            <Card class="flex flex-col gap-4 p-6">
                                <h3 class="flex items-center gap-2 text-lg font-bold text-foreground">
                                    <RibbonIcon size={18} class="text-primary" />
                                    {t().publicProfile.qualifications}
                                </h3>

                                <div class="flex flex-col gap-3">
                                    <For each={qualifications() ?? []}>
                                        {(q) => (
                                            <a
                                                href={q.certificateUrl || "#"}
                                                target={
                                                    q.certificateUrl
                                                        ? "_blank"
                                                        : undefined
                                                }
                                                rel="noopener noreferrer"
                                                class="group flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition-colors hover:border-primary/40 hover:bg-secondary/50"
                                            >
                                                <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                                                    <Show
                                                        when={
                                                            q.certificateUrl &&
                                                            !q.certificateUrl.endsWith(
                                                                ".pdf",
                                                            )
                                                        }
                                                        fallback={
                                                            <span class="text-xs font-bold text-muted-foreground">
                                                                PDF
                                                            </span>
                                                        }
                                                    >
                                                        <img
                                                            src={q.certificateUrl}
                                                            class="h-full w-full object-cover"
                                                            alt={q.title}
                                                        />
                                                    </Show>
                                                </div>

                                                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                                                    <span class="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                                        {q.title}
                                                    </span>
                                                    <Show when={q.institution}>
                                                        <span class="truncate text-xs text-muted-foreground">
                                                            {q.institution}
                                                        </span>
                                                    </Show>
                                                    <div class="mt-1 flex flex-wrap items-center gap-2">
                                                        <span
                                                            class={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                TYPE_COLORS[q.type] ??
                                                                "bg-secondary text-foreground"
                                                            }`}
                                                        >
                                                            {localizeDomain.qualificationType(
                                                                q.type,
                                                            )}
                                                        </span>
                                                        <Show when={q.year}>
                                                            <span class="text-xs text-muted-foreground">
                                                                {q.year}
                                                            </span>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </a>
                                        )}
                                    </For>
                                </div>
                            </Card>
                        </Show>
                    </div>

                    {/* COLUNA PRINCIPAL */}
                    <div class="flex flex-col gap-6 lg:col-span-2">
                        <Tabs
                            activeValue={activeTab()}
                            onChange={setActiveTab}
                            items={[
                                {
                                    label: t().publicProfile.tabs.services,
                                    value: "servicos",
                                },
                                {
                                    label: t().publicProfile.tabs.portfolio,
                                    value: "portfolio",
                                },
                                {
                                    label: t().publicProfile.tabs.reviews,
                                    value: "avaliacoes",
                                },
                            ]}
                        />

                        <div class="py-1">
                            <Show when={activeTab() === "servicos"}>
                                <div class="flex flex-col gap-3">
                                    <Show
                                        when={(services() ?? []).length > 0}
                                        fallback={
                                            <div class="p-8 text-center text-muted-foreground">
                                                {t().publicProfile.noServices}
                                            </div>
                                        }
                                    >
                                        <For each={services() ?? []}>
                                            {(svc: any) => {
                                                const svcName =
                                                    svc.service?.name ||
                                                    svc.name ||
                                                    t().publicProfile
                                                        .defaultServiceName;
                                                const duration =
                                                    svc.service?.durationMinutes ||
                                                    svc.durationMinutes ||
                                                    svc.duration ||
                                                    60;
                                                const priceBrl = Number(
                                                    svc.service?.price ??
                                                        svc.price ??
                                                        0,
                                                );
                                                return (
                                                    <div class="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                                                        <div class="flex flex-col">
                                                            <span class="font-bold text-foreground transition-colors group-hover:text-primary">
                                                                {localizeDomain.serviceName(
                                                                    svcName,
                                                                )}
                                                            </span>
                                                            <span class="text-sm text-muted-foreground">
                                                                {duration}{" "}
                                                                {
                                                                    t().common
                                                                        .minutesShort
                                                                }
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center gap-4">
                                                            <span
                                                                class="font-semibold text-foreground"
                                                                title={
                                                                    formatMoneyHint(
                                                                        priceBrl,
                                                                    ) ?? undefined
                                                                }
                                                            >
                                                                {formatMoney(priceBrl)}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                class="rounded-full px-4 text-xs"
                                                                onClick={() =>
                                                                    setSelectedServiceForBooking(
                                                                        svc,
                                                                    )
                                                                }
                                                            >
                                                                {t().publicProfile.book}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            <Show when={activeTab() === "portfolio"}>
                                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <Show
                                        when={(portfolio() ?? []).length > 0}
                                        fallback={
                                            <div class="col-span-full p-8 text-center text-muted-foreground">
                                                {t().publicProfile.noPortfolio}
                                            </div>
                                        }
                                    >
                                        <For each={portfolio() ?? []}>
                                            {(item) => (
                                                <div class="group aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                                                    <img
                                                        src={item.url}
                                                        alt={
                                                            t().publicProfile
                                                                .portfolioAlt
                                                        }
                                                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            <Show when={activeTab() === "avaliacoes"}>
                                <ReviewListWidget professionalId={params.id} />
                            </Show>
                        </div>
                    </div>
                </div>
            </div>

            <Show when={selectedServiceForBooking()}>
                {(svc) => (
                    <BookingModal
                        isOpen={true}
                        onClose={() => setSelectedServiceForBooking(null)}
                        professionalId={params.id as string}
                        businessId={
                            svc().businessProfessional?.business?.id ||
                            svc().businessId ||
                            ""
                        }
                        serviceId={svc().service?.id || svc().id}
                        serviceName={svc().service?.name || svc().name}
                        durationMinutes={
                            svc().service?.durationMinutes ||
                            svc().durationMinutes ||
                            svc().duration ||
                            60
                        }
                        cleanupMinutes={
                            svc().service?.cleanupMinutes || svc().cleanupMinutes || 0
                        }
                        price={svc().service?.price ?? svc().price}
                    />
                )}
            </Show>
        </Show>
    );
}