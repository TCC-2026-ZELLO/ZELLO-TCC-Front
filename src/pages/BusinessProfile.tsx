import { useNavigate, useParams } from "@solidjs/router";
import { createResource, createSignal, For, Show } from "solid-js";
import {
    CalendarIcon,
    CheckCircleIcon,
    MapPinIcon,
    StarIcon,
} from "../components/Icons/Icons";
import { ComboBookingModal } from "../components/Layout/ComboBookingModal";
import { BookingModal } from "../components/Widgets/BookingModal";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { ReviewListWidget } from "../components/Widgets/ReviewListWidget";
import { Tabs } from "../components/Widgets/Tabs";
import {
    formatDecimal,
    formatMoney,
    formatMoneyHint,
    formatPercent,
    localizeDomain,
    t,
} from "../core/i18n";
import { businessService } from "../services/business.service";
import { brl, combosService } from "../services/combos.service";

export default function EstablishmentProfile() {
    const params = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = createSignal("services");

    const [business] = createResource(() => params.id, businessService.getById);
    const [team] = createResource(() => params.id, businessService.getTeam);
    const [catalog] = createResource(() => params.id, businessService.getCatalog);
    const [combos] = createResource(
        () => params.id,
        (id: string) => combosService.list(id),
    );

    const [bookingServiceId, setBookingServiceId] = createSignal<string | null>(
        null,
    );
    const [isBookingOpen, setIsBookingOpen] = createSignal(false);
    const [selectedCombo, setSelectedCombo] = createSignal<string | null>(null);

    const handleOpenBooking = (serviceId?: string) => {
        setBookingServiceId(serviceId ?? (catalog() ?? [])[0]?.id ?? null);
        setIsBookingOpen(true);
    };

    return (
        <Show
            when={!business.loading}
            fallback={
                <div class="flex animate-pulse flex-col items-center gap-4 p-16 text-center text-muted-foreground">
                    <div class="size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
                    {t().businessProfile.loading}
                </div>
            }
        >
            <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pb-20 sm:py-8">
                {/* HEADER CARD */}
                <Card class="relative overflow-hidden border border-border bg-card p-0 shadow-sm">
                    <div class="relative h-44 w-full bg-secondary sm:h-48">
                        <Show
                            when={business()?.bannerUrl}
                            fallback={
                                <div class="h-full w-full bg-gradient-to-br from-sidebar to-primary/50" />
                            }
                        >
                            <img
                                src={business()?.bannerUrl}
                                alt={business()?.tradeName}
                                class="h-full w-full object-cover"
                            />
                        </Show>
                        <div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    </div>

                    <div class="relative flex flex-col items-center gap-5 px-6 pb-6 pt-0 sm:flex-row sm:items-center sm:px-10 sm:py-6">
                        <div class="-mt-14 flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-md sm:-mt-16 sm:size-36">
                            <Show
                                when={business()?.photoUrl}
                                fallback={
                                    <span class="select-none text-4xl font-black text-primary">
                                        {business()?.tradeName?.charAt(0)}
                                    </span>
                                }
                            >
                                <img
                                    src={business()?.photoUrl}
                                    alt={business()?.tradeName}
                                    class="h-full w-full object-cover"
                                />
                            </Show>
                        </div>

                        <div class="flex min-w-0 flex-1 flex-col items-center py-2 text-center sm:items-start sm:text-left">
                            <h1 class="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold text-foreground sm:justify-start sm:text-3xl">
                                <span>{business()?.tradeName}</span>
                                <Show when={business()?.visibilityStatus}>
                                    <span
                                        class="inline-flex shrink-0 text-primary"
                                        title={t().businessProfile.verified}
                                    >
                                        <CheckCircleIcon class="size-6" />
                                    </span>
                                </Show>
                            </h1>
                            <p class="text-base font-medium text-muted-foreground sm:text-lg">
                                {localizeDomain.segment(
                                    business()?.segment ||
                                        t().explore.businessesTab,
                                )}
                            </p>

                            <div class="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
                                <div class="flex items-center gap-1 font-semibold text-foreground">
                                    <span class="text-warning">
                                        <StarIcon class="size-5" />
                                    </span>
                                    {formatDecimal(
                                        Number(business()?.averageRating ?? 5),
                                    )}
                                    <span class="ml-1 font-normal text-muted-foreground">
                                        {t().businessProfile.reviewsCount(
                                            business()?.reviewCount ?? 0,
                                        )}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1 text-muted-foreground">
                                    <MapPinIcon class="size-4" />
                                    {business()?.city || "Curitiba"}
                                </div>
                            </div>
                        </div>

                        <div class="w-full sm:w-auto">
                            <Button
                                variant="primary"
                                disabled={(catalog() ?? []).length === 0}
                                onClick={() => handleOpenBooking()}
                                class="flex w-full items-center justify-center gap-2 px-7 py-3 text-base shadow-lg sm:w-auto"
                            >
                                <CalendarIcon class="size-5" />{" "}
                                {t().businessProfile.bookButton}
                            </Button>
                        </div>
                    </div>
                </Card>

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    {/* COLUNA LATERAL */}
                    <div class="flex flex-col gap-6 lg:col-span-1">
                        <Card class="p-6">
                            <h3 class="mb-3 text-lg font-bold text-foreground">
                                {t().businessProfile.aboutTitle}
                            </h3>
                            <p class="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                {business()?.description ||
                                    t().businessProfile.noDescription}
                            </p>
                        </Card>

                        <Show when={(combos() ?? []).length > 0}>
                            <Card class="flex items-center justify-between gap-3 border-primary/25 bg-primary/5 p-5">
                                <span class="text-sm font-bold text-foreground">
                                    {t().businessProfile.combosBadge(
                                        (combos() ?? []).length,
                                    )}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setActiveTab("combos")}
                                >
                                    {t().businessProfile.tabs.combos}
                                </Button>
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
                                    label: t().businessProfile.tabs.services,
                                    value: "services",
                                },
                                {
                                    label: t().businessProfile.tabs.combos,
                                    value: "combos",
                                    badge: (combos() ?? []).length || undefined,
                                },
                                {
                                    label: t().businessProfile.tabs.team,
                                    value: "team",
                                },
                                {
                                    label: t().businessProfile.tabs.gallery,
                                    value: "gallery",
                                },
                                {
                                    label: t().businessProfile.tabs.reviews,
                                    value: "reviews",
                                },
                            ]}
                        />

                        <div class="py-1">
                            {/* TAB: SERVIÇOS */}
                            <Show when={activeTab() === "services"}>
                                <div class="flex flex-col gap-3">
                                    <Show
                                        when={(catalog() ?? []).length > 0}
                                        fallback={
                                            <div class="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
                                                {t().businessProfile.noServices}
                                            </div>
                                        }
                                    >
                                        <For each={catalog() ?? []}>
                                            {(svc) => (
                                                <div class="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50">
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-foreground transition-colors group-hover:text-primary">
                                                            {localizeDomain.serviceName(
                                                                svc.name,
                                                            )}
                                                        </span>
                                                        <span class="text-sm text-muted-foreground">
                                                            {svc.durationMinutes}{" "}
                                                            {t().common.minutesShort}
                                                        </span>
                                                    </div>
                                                    <div class="flex items-center gap-4">
                                                        <span
                                                            class="font-semibold text-foreground"
                                                            title={
                                                                formatMoneyHint(
                                                                    Number(svc.price),
                                                                ) ?? undefined
                                                            }
                                                        >
                                                            {formatMoney(
                                                                Number(svc.price),
                                                            )}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleOpenBooking(svc.id)
                                                            }
                                                            class="rounded-full px-4 text-xs"
                                                        >
                                                            {
                                                                t().businessProfile
                                                                    .bookService
                                                            }
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: COMBOS */}
                            <Show when={activeTab() === "combos"}>
                                <div class="flex flex-col gap-3">
                                    <Show
                                        when={!combos.loading}
                                        fallback={
                                            <div class="animate-pulse p-10 text-center text-muted-foreground">
                                                {t().common.loading}
                                            </div>
                                        }
                                    >
                                        <Show
                                            when={(combos() ?? []).length > 0}
                                            fallback={
                                                <div class="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
                                                    {t().businessProfile.noCombos}
                                                </div>
                                            }
                                        >
                                            <For each={combos() ?? []}>
                                                {(combo) => (
                                                    <div class="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 sm:flex-row sm:items-center">
                                                        <div class="flex flex-col">
                                                            <span class="font-bold text-foreground transition-colors group-hover:text-primary">
                                                                {localizeDomain.serviceName(
                                                                    combo.name,
                                                                )}
                                                            </span>
                                                            <span class="text-sm text-muted-foreground">
                                                                {combo.stages
                                                                    .flatMap((stage) =>
                                                                        stage.services.map(
                                                                            (svc) =>
                                                                                localizeDomain.serviceName(
                                                                                    svc.name,
                                                                                ),
                                                                        ),
                                                                    )
                                                                    .join(" + ")}
                                                            </span>
                                                            <span class="mt-1 text-xs text-muted-foreground">
                                                                {combo.requiresMultipleProfessionals
                                                                    ? t().businessProfile.simultaneousHint(
                                                                          combo.durationMinutes,
                                                                      )
                                                                    : `${combo.durationMinutes} ${t().common.minutesShort}`}
                                                            </span>
                                                        </div>

                                                        <div class="flex items-center justify-between gap-4 sm:justify-end">
                                                            <div class="flex flex-col items-start sm:items-end">
                                                                <span class="font-semibold text-foreground">
                                                                    {brl(combo.price)}
                                                                </span>
                                                                <span class="text-xs text-muted-foreground line-through">
                                                                    {brl(
                                                                        combo.originalPrice,
                                                                    )}
                                                                </span>
                                                                <span class="text-xs font-semibold text-success">
                                                                    −
                                                                    {formatPercent(
                                                                        combo.discountPercent,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setSelectedCombo(
                                                                        combo.id,
                                                                    )
                                                                }
                                                                class="rounded-full px-4 text-xs"
                                                            >
                                                                {
                                                                    t().businessProfile
                                                                        .bookCombo
                                                                }
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </For>
                                        </Show>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: EQUIPE */}
                            <Show when={activeTab() === "team"}>
                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Show
                                        when={(team() ?? []).length > 0}
                                        fallback={
                                            <div class="col-span-full p-10 text-center text-muted-foreground">
                                                {t().businessProfile.noTeam}
                                            </div>
                                        }
                                    >
                                        <For each={team() ?? []}>
                                            {(link) => {
                                                const member = link.professional;
                                                const memberName =
                                                    member.user?.name ||
                                                    t().appointments.fallback
                                                        .professional;
                                                return (
                                                    <Card
                                                        class="flex cursor-pointer items-center gap-4 p-4 transition-all hover:border-primary/50"
                                                        onClick={() =>
                                                            navigate(
                                                                `/public_profile/${member.id}`,
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                member.photoUrl ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random`
                                                            }
                                                            alt={memberName}
                                                            class="size-14 rounded-full border border-border object-cover sm:size-16"
                                                        />
                                                        <div class="flex min-w-0 flex-1 flex-col">
                                                            <span class="truncate font-bold text-foreground">
                                                                {memberName}
                                                            </span>
                                                            <span class="truncate text-xs text-muted-foreground">
                                                                {localizeDomain.specialty(
                                                                    member.specialty ||
                                                                        t()
                                                                            .publicProfile
                                                                            .defaultSpecialty,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            class="h-8 shrink-0 rounded-full px-3 text-xs"
                                                        >
                                                            {
                                                                t().businessProfile
                                                                    .viewProProfile
                                                            }
                                                        </Button>
                                                    </Card>
                                                );
                                            }}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: GALERIA */}
                            <Show when={activeTab() === "gallery"}>
                                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <Show
                                        when={
                                            (business()?.galleryImages ?? []).length >
                                            0
                                        }
                                        fallback={
                                            <div class="col-span-full p-10 text-center text-muted-foreground">
                                                {t().businessProfile.noGallery}
                                            </div>
                                        }
                                    >
                                        <For each={business()?.galleryImages ?? []}>
                                            {(img) => (
                                                <div class="group aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                                                    <img
                                                        src={img.url}
                                                        alt={
                                                            t().businessProfile
                                                                .galleryAlt
                                                        }
                                                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: AVALIAÇÕES */}
                            <Show when={activeTab() === "reviews"}>
                                <ReviewListWidget businessId={params.id} />
                            </Show>
                        </div>
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingOpen()}
                onClose={() => setIsBookingOpen(false)}
                businessId={params.id as string}
                serviceId={bookingServiceId() ?? undefined}
                catalogOptions={catalog() ?? []}
                teamOptions={team() ?? []}
                onSuccess={() => navigate("/agendamentos")}
            />

            <Show when={selectedCombo()}>
                {(comboId) => (
                    <ComboBookingModal
                        comboId={comboId()}
                        isOpen={true}
                        onClose={() => setSelectedCombo(null)}
                        onBooked={() => navigate("/agendamentos")}
                    />
                )}
            </Show>
        </Show>
    );
}