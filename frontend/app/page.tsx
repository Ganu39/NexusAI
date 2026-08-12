import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductActions } from "@/components/landing/product-actions";
import { TrustedTech } from "@/components/landing/trusted-tech";
import { Features } from "@/components/landing/features";
import { ProductPreview } from "@/components/landing/product-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AiCapabilities } from "@/components/landing/ai-capabilities";
import { WhyNexusAi } from "@/components/landing/why-nexusai";
import { Roadmap } from "@/components/landing/roadmap";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col overflow-hidden">
        <Hero />
        <ProductActions />
        <TrustedTech />
        <Features />
        <ProductPreview />
        <HowItWorks />
        <AiCapabilities />
        <WhyNexusAi />
        <Roadmap />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
