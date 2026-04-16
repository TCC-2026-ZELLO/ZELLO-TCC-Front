import { createSignal, For } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { SearchIcon, MapPinIcon, StarIcon, FilterIcon } from "~/components/Icons/Icons";

export default function Explore() {
    const [searchQuery, setSearchQuery] = createSignal("");
    const [activeFilter, setActiveFilter] = createSignal("trending");
    const [searchType, setSearchType] = createSignal<"professionals" | "establishments">("professionals");

    const professionals = [
        { id: 1, name: "Rafael Galafassi", specialty: "Barber & Visagist", rating: 4.9, distance: "2.1 km", price: "$$" },
        { id: 2, name: "Laura Costa", specialty: "Nail Artist", rating: 5.0, distance: "1.2 km", price: "$" },
        { id: 3, name: "André Agostini", specialty: "Master Hair Stylist", rating: 4.9, distance: "4.5 km", price: "$$$" },
    ];

    const establishments = [
        { id: 101, name: "Studio Zello Beauty", specialty: "Premium Salon & Spa", rating: 4.8, distance: "3.5 km", price: "$$$" },
        { id: 102, name: "Urban Men Barbershop", specialty: "Barbershop", rating: 4.6, distance: "1.8 km", price: "$$" },
    ];

    const currentResults = () => searchType() === "professionals" ? professionals : establishments;

    return (
        <div class="flex flex-col gap-8 p-4 md:p-8"> {/* O gap-8 aqui garante que nada se sobreponha verticalmente */}

            {/* Header and Search Type Toggle */}
            <div class="flex flex-col gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-foreground">Discover Services</h1>
                    <p class="text-sm text-muted-foreground font-medium">Find the best beauty and wellness experts near you.</p>
                </div>

                <div class="flex bg-secondary/50 p-1.5 rounded-xl w-fit border border-border/50">
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${searchType() === 'professionals' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setSearchType('professionals')}
                    >
                        Professionals
                    </button>
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${searchType() === 'establishments' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setSearchType('establishments')}
                    >
                        Establishments
                    </button>
                </div>
            </div>

            {/* Search Bar & Primary Filters */}
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="relative w-full md:w-96">
                    <span class="absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
                        <SearchIcon class="size-4" />
                    </span>
                    <input
                        type="text"
                        placeholder={searchType() === "professionals" ? "Search for a professional..." : "Search for a salon..."}
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                        class="w-full rounded-xl border border-input bg-card py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <Button variant="outline" class="rounded-xl px-5 flex items-center gap-2 h-10 border-border">
                    <FilterIcon class="size-4" /> Filters
                </Button>
            </div>

            {/* Quick Filter Pills (RF16) - ESTRUTURA REFORÇADA PARA EVITAR OVERLAP */}
            <div class="w-full">
                <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mb-4"> {/* Padding bottom interno e margem negativa para compensar */}
                    <button
                        onClick={() => setActiveFilter('trending')}
                        class={`flex-none px-5 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${activeFilter() === 'trending' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-secondary'}`}
                    >
                        🔥 Trending
                    </button>
                    <button
                        onClick={() => setActiveFilter('price_asc')}
                        class={`flex-none px-5 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${activeFilter() === 'price_asc' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-secondary'}`}
                    >
                        💸 Lowest Price
                    </button>
                    <button
                        onClick={() => setActiveFilter('rating')}
                        class={`flex-none px-5 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${activeFilter() === 'rating' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-secondary'}`}
                    >
                        ⭐ Top Rated
                    </button>
                    <button
                        onClick={() => setActiveFilter('today')}
                        class={`flex-none px-5 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${activeFilter() === 'today' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-secondary'}`}
                    >
                        ⚡ Available Today
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4 items-start">

                {/* Interactive Map (RF15) */}
                <div class="col-span-1 hidden lg:flex flex-col overflow-hidden rounded-2xl border border-border bg-card h-[600px] sticky top-8 shadow-sm">
                    <div class="bg-secondary/30 w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                        <MapPinIcon class="size-10 mb-3 opacity-20" />
                        <span class="font-bold text-foreground">Interactive Map</span>
                        <p class="text-xs mt-2 leading-relaxed opacity-70">
                            Geolocation services enabled.<br/>
                            Showing results within 10km radius.
                        </p>
                    </div>
                </div>

                {/* Results Grid */}
                <div class="col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2 xl:col-span-3">
                    <For each={currentResults()}>
                        {(item) => (

                            <Card class="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary/40 group border-border/60">
                                <div class="h-40 bg-secondary relative overflow-hidden">
                                    <img
                                        src={`https://source.unsplash.com/random/400x300/?${item.specialty.split(' ')[0]},beauty&sig=${item.id}`}
                                        alt="Cover"
                                        class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div class="absolute top-4 right-4 bg-background/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black text-foreground shadow-lg border border-border/50">
                                        <StarIcon class="size-3.5 text-yellow-500" /> {item.rating}
                                    </div>
                                </div>
                                <div class="p-5 flex flex-col gap-2">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-black text-foreground text-lg truncate pr-2">{item.name}</h3>
                                        <span class="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{item.price}</span>
                                    </div>
                                    <p class="text-sm text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">{item.specialty}</p>
                                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 font-medium">
                                        <MapPinIcon class="size-3.5 opacity-60" /> {item.distance} away from you
                                    </div>
                                </div>
                            </Card>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}