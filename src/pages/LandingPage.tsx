import { createEffect } from "solid-js";
import { PublicHeader } from "../components/LandingPage/Navbar";
import { Hero } from "../components/LandingPage/Hero";
import { HowItWorks } from "../components/LandingPage/HowItWorks";
import { Benefits } from "../components/LandingPage/Benefits";
import { Footer } from "../components/LandingPage/Footer";

export default function LandingPage() {
    createEffect(() => {
        document.title = "Zello - Encontre os melhores profissionais de beleza";
    });

    return (
        <div class="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-primary">
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
