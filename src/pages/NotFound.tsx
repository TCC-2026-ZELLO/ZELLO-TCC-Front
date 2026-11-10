import { useNavigate } from "@solidjs/router";
import { HomeIcon, SearchIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { t } from "../core/i18n";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <main class="flex min-h-[75dvh] items-center justify-center p-4 sm:p-8">
            <Card class="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center shadow-md sm:p-10">
                <span class="rounded-full bg-primary/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
                    {t().notFound.badge}
                </span>

                <div class="flex flex-col gap-2">
                    <h1 class="text-2xl font-extrabold text-foreground sm:text-3xl">
                        {t().notFound.title}
                    </h1>
                    <p class="text-sm text-muted-foreground sm:text-base">
                        {t().notFound.description}
                    </p>
                </div>

                <div class="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button
                        variant="primary"
                        class="justify-center"
                        onClick={() => navigate("/")}
                    >
                        <HomeIcon class="mr-2 size-4" />
                        {t().notFound.backHome}
                    </Button>
                    <Button
                        variant="outline"
                        class="justify-center"
                        onClick={() => navigate("/explore")}
                    >
                        <SearchIcon class="mr-2 size-4" />
                        {t().notFound.goExplore}
                    </Button>
                </div>
            </Card>
        </main>
    );
}