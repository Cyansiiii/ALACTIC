"use client";
/**
 * Page enter transition (template re-mounts per route). Opacity only: a transform
 * here would become the containing block for GSAP pins and fixed elements.
 */
import { motion } from "motion/react";
import { duration, ease } from "@/lib/motion/tokens";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.slow, ease: ease.out }}>
      {children}
    </motion.div>
  );
}
