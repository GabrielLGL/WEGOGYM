"use client";

import { useState } from "react";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollReveal from "@/components/ScrollReveal";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import SubscribeSection from "@/components/sections/SubscribeSection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Aller au contenu principal
      </a>
      <BackgroundBlobs />
      <ThemeToggle />
      <ScrollReveal />

      <HeroSection
        email={email}
        name={name}
        status={status}
        setEmail={setEmail}
        setName={setName}
        onSubmit={handleSubmit}
      />
      <FeaturesSection />
      <PricingSection />
      <SubscribeSection
        email={email}
        name={name}
        status={status}
        setEmail={setEmail}
        setName={setName}
        onSubmit={handleSubmit}
      />
      <FooterSection />
    </div>
  );
}
