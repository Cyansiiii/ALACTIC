"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AgentBadge } from "@/components/ens/agent-badge";
import { WalletButton } from "@/components/wallet/wallet-button";
import { duration, ease, spring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export const NAV_LINKS = [
  { href: "/app", label: "Claim" },
  { href: "/verify", label: "Verify" },
  { href: "/attack", label: "Attack" },
  { href: "/approver", label: "Approver" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev && !menuOpen);
  });

  // Close the mobile menu when the route changes (state adjustment during render).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: duration.slow, ease: ease.out }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-slow)]",
            scrolled || menuOpen ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent",
          )}
        >
          <nav aria-label="Primary" className="container-x flex h-[var(--nav-h)] items-center gap-6">
            <Logo />

            <ul className="ml-4 hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <li key={l.href} className="relative">
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn("relative z-10 block rounded-full px-3.5 py-2 text-small transition-colors", active ? "text-fg" : "text-fg-muted hover:text-fg")}
                    >
                      {l.label}
                    </Link>
                    {active && (
                      <motion.span layoutId="nav-active" transition={spring.snappy} className="absolute inset-0 rounded-full border border-line bg-surface-2" aria-hidden />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex items-center gap-2">
              <AgentBadge className="hidden lg:block" />
              <ThemeToggle />
              <WalletButton className="hidden sm:block" />
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full border border-line bg-surface-2/60 md:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <motion.path animate={{ d: menuOpen ? "M3 3l10 10" : "M2 5h12" }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <motion.path animate={{ d: menuOpen ? "M13 3L3 13" : "M2 11h12" }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
            className="fixed inset-0 z-40 bg-bg/95 pt-[var(--nav-h)] backdrop-blur-xl md:hidden"
          >
            <motion.ul
              className="container-x flex flex-col gap-1 pt-8"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {NAV_LINKS.map((l) => (
                <motion.li key={l.href} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} transition={{ duration: duration.slow, ease: ease.out }}>
                  <Link
                    href={l.href}
                    aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                    className="flex items-baseline justify-between border-b border-line py-5 font-display text-h1 text-fg"
                  >
                    {l.label}
                    <span className="font-mono text-micro text-fg-subtle">{l.href}</span>
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-8 flex flex-wrap items-center gap-3">
                <WalletButton size="md" />
                <AgentBadge align="left" />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
