import BackgroundBlobs from "@/components/BackgroundBlobs";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollReveal from "@/components/ScrollReveal";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import SubscribeSection from "@/components/sections/SubscribeSection";
import FooterSection from "@/components/sections/FooterSection";
import { getSupabase } from "@/lib/supabase";

// ISR : revalide la page toutes les heures (count inscrits mis à jour sans requête client)
export const revalidate = 3600;

async function getSubscriberCount(): Promise<number | null> {
  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });
    return count;
  } catch {
    return null;
  }
}

export default async function Home() {
  const subscriberCount = await getSubscriberCount();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Aller au contenu principal
      </a>
      <BackgroundBlobs />
      <ThemeToggle />
      <ScrollReveal />

      <main id="main-content">
        <HeroSection subscriberCount={subscriberCount} />
        <FeaturesSection />
        <PricingSection />
        <SubscribeSection />
      </main>
      <FooterSection />
    </div>
  );
}
