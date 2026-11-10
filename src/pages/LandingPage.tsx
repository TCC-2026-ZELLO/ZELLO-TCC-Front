import { createEffect } from "solid-js";
import { Benefits } from "../components/LandingPage/Benefits";
import { Footer } from "../components/LandingPage/Footer";
import { Hero } from "../components/LandingPage/Hero";
import { HowItWorks } from "../components/LandingPage/HowItWorks";
import { PublicHeader } from "../components/LandingPage/Navbar";
import { t } from "../core/i18n";

export default function LandingPage() {
    createEffect(() => {
        document.title = t().landing.metaTitle;
    });

    return (
        <div class="min-h-screen overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/30 selection:text-primary">
            <PublicHeader />

            <main>
                <Hero />
                <HowItWorks />
                <Benefits />
            </main>

            <Footer />
        </div>
    );
}
