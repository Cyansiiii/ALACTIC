"use client";
/**
 * Pinned 5-step sequence. GSAP owns the pin + progress bar (scroll choreography);
 * Framer Motion owns the scene swap (UI state). On mobile or with reduced motion
 * the steps render as a plain stacked list.
 */
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useLenis } from "@/lib/motion/smooth-scroll";
import { duration, ease } from "@/lib/motion/tokens";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";
import { SceneAsk, SceneExplain, SceneReceipt, SceneSnapshot, SceneVault } from "./how-scenes";
import { SectionHeader } from "./section-header";

const STEPS = [
  { title: "Ask", body: "Connect a wallet, sign in, and describe the problem in plain words.", Scene: SceneAsk, tag: "You" },
  { title: "AI explains, with a 0G receipt", body: "Retrieval over a hashed knowledge base. Inference on 0G Compute returns a TEE-attested receipt for the exact model and prompt.", Scene: SceneExplain, tag: "0G" },
  { title: "Snapshot decides the amount", body: "The policy engine reads your leaf from the Merkle snapshot committed before claims opened. The model never produces an amount, address or tier.", Scene: SceneSnapshot, tag: "Policy" },
  { title: "Vault enforces", body: "A capped, expiring session key calls the vault. The contract checks proof, caps, uses and the claimed set, then pays exactly the committed amount.", Scene: SceneVault, tag: "Sepolia" },
  { title: "Receipt verifies", body: "A hash-chained receipt, signed by the key published on ENS, is tied to the on-chain payout. Anyone can re-check it.", Scene: SceneReceipt, tag: "ENS" },
];

export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduced;

  return (
    <section id="how" aria-labelledby="how-title" className="relative border-t border-line">
      {pinned ? <Pinned /> : <Stacked />}
    </section>
  );
}

function StepList({ active, onSelect }: { active: number; onSelect?: (i: number) => void }) {
  return (
    <ol className="relative mt-10 space-y-1">
      {STEPS.map((s, i) => (
        <li key={s.title}>
          <button
            type="button"
            onClick={() => onSelect?.(i)}
            aria-current={i === active ? "step" : undefined}
            className={cn(
              "group flex w-full gap-5 rounded-lg px-4 py-3.5 text-left transition-colors duration-[var(--dur-base)]",
              i === active ? "bg-surface-2/70" : "hover:bg-surface-2/40",
            )}
          >
            <span className={cn("mt-0.5 font-mono text-micro transition-colors", i === active ? "text-accent" : "text-fg-subtle")}>0{i + 1}</span>
            <span className="flex-1">
              <span className={cn("block font-display text-h3 font-medium transition-colors", i === active ? "text-fg" : "text-fg-muted")}>{s.title}</span>
              <motion.span
                initial={false}
                animate={{ height: i === active ? "auto" : 0, opacity: i === active ? 1 : 0 }}
                transition={{ duration: duration.slow, ease: ease.out }}
                className="block overflow-hidden"
              >
                <span className="block pt-2 text-small text-fg-muted">{s.body}</span>
              </motion.span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function Stage({ active }: { active: number }) {
  const { Scene, tag } = STEPS[active];
  return (
    <div className="glass relative aspect-[5/4] w-full overflow-hidden rounded-xl p-6 md:p-10">
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-50" />
      <div className="absolute left-6 top-5 flex items-center gap-2 md:left-8">
        <span className="label-bracket">Step 0{active + 1}</span>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-fg-muted">{tag}</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: duration.slow, ease: ease.out }}
          className="relative h-full pt-6"
        >
          <Scene />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Pinned() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const getLenis = useLenis();

  useGSAP(
    () => {
      trigger.current = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${STEPS.length * 85}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          gsap.set(bar.current, { scaleY: self.progress });
          const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
      return () => trigger.current?.kill();
    },
    { scope: root },
  );

  const select = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const y = st.start + ((i + 0.5) / STEPS.length) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
  };

  return (
    <div ref={root} className="flex h-[100svh] items-center">
      <div className="container-x grid w-full grid-cols-[0.95fr_1.05fr] items-center gap-16 pt-[var(--nav-h)]">
        <div className="relative">
          <SectionHeader id="how-title" label="How it works" title={<>Five steps. The AI touches <em className="font-serif font-normal italic">one.</em></>} />
          <div className="relative">
            <div aria-hidden className="absolute -left-4 top-10 bottom-0 w-px bg-line">
              <div ref={bar} className="h-full w-full origin-top scale-y-0 bg-gradient-to-b from-accent to-verified" />
            </div>
            <StepList active={active} onSelect={select} />
          </div>
        </div>
        <Stage active={active} />
      </div>
    </div>
  );
}

function Stacked() {
  return (
    <div className="container-x section-y">
      <SectionHeader id="how-title" label="How it works" title={<>Five steps. The AI touches <em className="font-serif font-normal italic">one.</em></>} />
      <ol className="mt-12 space-y-14">
        {STEPS.map(({ title, body, Scene, tag }, i) => (
          <li key={title} className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="flex items-center gap-3">
                <span className="font-mono text-micro text-accent">0{i + 1}</span>
                <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-fg-muted">{tag}</span>
              </p>
              <h3 className="mt-3 font-display text-h2 font-semibold text-fg">{title}</h3>
              <p className="mt-3 text-fg-muted">{body}</p>
            </div>
            <div className="glass min-h-[22rem] rounded-xl p-5">
              <Scene />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
