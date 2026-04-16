import { createSignal, For, Show } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Tabs } from "~/components/Widgets/Tabs";
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from "~/components/Icons/Icons";

export default function EstablishmentProfile() {
    const [activeTab, setActiveTab] = createSignal("services");

    // Mock Data based on the Establishment/Company Database Entity
    const establishmentData = {
        name: "Studio Zello Beauty",
        type: "Premium Salon & Spa",
        rating: 4.8,
        reviewsCount: 842,
        about: "A premium wellness and beauty space dedicated to elevating your self-esteem. We offer a complete ecosystem of high-end services with top-tier professionals, ensuring a unique and relaxing experience.",
        location: "123 Downtown Avenue, Suite 45",
        status: "Open Now",
        openingHours: [
            { days: "Mon", hours: "Closed" },
            { days: "Tue - Fri", hours: "09:00 AM - 08:00 PM" },
            { days: "Sat", hours: "09:00 AM - 06:00 PM" }
        ],
        services: [
            { id: 101, name: "Complete Haircut", duration: "1h", price: "$ 80.00", category: "Hair" },
            { id: 102, name: "Global Color & Highlights", duration: "2h 30m", price: "$ 250.00", category: "Hair" },
            { id: 103, name: "Spa Pedicure & Manicure", duration: "1h 15m", price: "$ 65.00", category: "Nails" },
            { id: 104, name: "Zello VIP Combo (Hair + Nails)", duration: "2h 15m", price: "$ 130.00", category: "Combos" } // RF11
        ],
        team: [
            { id: 1, name: "André Agostini", role: "Master Hair Stylist", rating: 4.9, avatar: "11" },
            { id: 2, name: "Laura Costa", role: "Nail Artist", rating: 5.0, avatar: "47" },
            { id: 3, name: "Rafael Galafassi", role: "Barber & Visagist", rating: 4.7, avatar: "12" }
        ],
        gallery: [12, 22, 33, 44, 55, 66] // Mock random seeds for Unsplash
    };

    return (
        <div class="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-8 pb-20 md:py-8">

            {/* Header / Hero Section */}
            <Card class="overflow-hidden border-none shadow-sm bg-card relative">
                {/* Banner - Shows the physical space of the establishment */}
                <div class="h-48 w-full bg-secondary relative">
                    <img
                        src="https://source.unsplash.com/random/1200x400/?salon,interior"
                        alt="Salon Interior"
                        class="w-full h-full object-cover opacity-90"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>

                <div class="px-6 pb-6 pt-0 relative sm:px-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-12">
                    {/* Establishment Logo */}
                    <div class="size-32 sm:size-40 rounded-2xl border-4 border-background shadow-md bg-card flex items-center justify-center overflow-hidden">
                        <span class="text-5xl font-black text-primary">Z.</span>
                    </div>

                    <div class="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pt-2 pb-2">
                        <h1 class="text-3xl font-bold text-foreground flex items-center gap-2">
                            {establishmentData.name}
                            <span class="text-primary flex items-center" title="Verified Business">
                                <CheckCircleIcon class="size-6" />
                            </span>
                        </h1>
                        <p class="text-lg text-muted-foreground font-medium">{establishmentData.type}</p>

                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                            <div class="flex items-center gap-1 font-semibold text-foreground">
                                <span class="text-yellow-500 flex items-center"><StarIcon class="size-5" /></span> {establishmentData.rating}
                                <span class="text-muted-foreground font-normal">({establishmentData.reviewsCount} reviews)</span>
                            </div>
                            <div class="flex items-center gap-1 text-muted-foreground">
                                <MapPinIcon class="size-4" /> {establishmentData.location}
                            </div>
                        </div>
                    </div>

                    <div class="w-full sm:w-auto">
                        <Button variant="primary" class="w-full sm:w-auto py-3 px-8 text-base shadow-lg flex items-center justify-center gap-2">
                            <CalendarIcon class="size-5" /> Book Appointment
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Main Layout: Two Columns */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: About & Info */}
                <div class="flex flex-col gap-6 lg:col-span-1">
                    <Card class="p-6">
                        <h3 class="font-bold text-lg text-foreground mb-3">About Us</h3>
                        <p class="text-muted-foreground text-sm leading-relaxed">
                            {establishmentData.about}
                        </p>
                    </Card>

                    <Card class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-lg text-foreground">Opening Hours</h3>
                            <span class="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                                {establishmentData.status}
                            </span>
                        </div>
                        <div class="flex flex-col gap-3">
                            <For each={establishmentData.openingHours}>
                                {(schedule) => (
                                    <div class="flex justify-between items-center text-sm border-b border-border/50 last:border-none pb-2 last:pb-0">
                                        <span class="font-medium text-muted-foreground">{schedule.days}</span>
                                        <span class="text-foreground font-semibold">{schedule.hours}</span>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Dynamic Tabs */}
                <div class="flex flex-col gap-6 lg:col-span-2">
                    <div class="border-b border-border">
                        <Tabs
                            activeValue={activeTab()}
                            onChange={(val) => setActiveTab(val as string)}
                            items={[
                                { label: "Services", value: "services" },
                                { label: "Our Team", value: "team" },
                                { label: "Gallery", value: "gallery" },
                                { label: "Reviews", value: "reviews" }
                            ]}
                        />
                    </div>

                    {/* Tab Contents */}
                    <div class="py-2">

                        {/* TAB: SERVICES */}
                        <Show when={activeTab() === "services"}>
                            <div class="flex flex-col gap-3 animate-in fade-in duration-300">
                                <For each={establishmentData.services}>
                                    {(svc) => (
                                        <div class="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div class="flex flex-col">
                                                <div class="flex items-center gap-2">
                                                    <span class="font-bold text-foreground group-hover:text-primary transition-colors">{svc.name}</span>
                                                    <Show when={svc.category === "Combos"}>
                                                        <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Combo</span>
                                                    </Show>
                                                </div>
                                                <span class="text-sm text-muted-foreground">{svc.duration}</span>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span class="font-semibold text-foreground">{svc.price}</span>
                                                <Button variant="outline" class="rounded-full text-xs px-4">Select</Button>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>

                        {/* TAB: TEAM (Professionals working here) */}
                        <Show when={activeTab() === "team"}>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                <For each={establishmentData.team}>
                                    {(member) => (
                                        <Card class="p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors">
                                            <img
                                                src={`https://i.pravatar.cc/150?img=${member.avatar}`}
                                                alt={member.name}
                                                class="size-16 rounded-full object-cover border border-border"
                                            />
                                            <div class="flex flex-col flex-1">
                                                <span class="font-bold text-foreground">{member.name}</span>
                                                <span class="text-xs text-muted-foreground">{member.role}</span>
                                                <div class="flex items-center gap-1 text-xs font-semibold mt-1">
                                                    <StarIcon class="size-3 text-yellow-500" /> {member.rating}
                                                </div>
                                            </div>
                                            <Button variant="outline" class="rounded-full text-xs px-3 h-8">View</Button>
                                        </Card>
                                    )}
                                </For>
                            </div>
                        </Show>

                        {/* TAB: GALLERY */}
                        <Show when={activeTab() === "gallery"}>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                                <For each={establishmentData.gallery}>
                                    {(img) => (
                                        <div class="aspect-square rounded-xl bg-secondary overflow-hidden group cursor-pointer">
                                            <img
                                                src={`https://source.unsplash.com/random/300x300/?salon,spa&sig=${img}`}
                                                alt="Establishment space"
                                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>

                        {/* TAB: REVIEWS Placeholder */}
                        <Show when={activeTab() === "reviews"}>
                            <div class="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
                                <div class="size-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                                    <StarIcon class="size-8" />
                                </div>
                                <h4 class="font-bold text-foreground">Client Reviews</h4>
                                <p class="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Customer feedback helps maintain our quality standard. Reviews will appear here.
                                </p>
                            </div>
                        </Show>

                    </div>
                </div>
            </div>
        </div>
    );
}