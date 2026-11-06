import { AttackTeaser } from "@/components/landing/attack-teaser";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Problem } from "@/components/landing/problem";
import { Tiers } from "@/components/landing/tiers";
import { TrustStrip } from "@/components/landing/trust-strip";
import { VerifyTeaser } from "@/components/landing/verify-teaser";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Problem />
      <HowItWorks />
      <Tiers />
      <AttackTeaser />
      <VerifyTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}
