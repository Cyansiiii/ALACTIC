/**
 * JS mirror of the motion tokens in styles/tokens.css. Keep both in sync.
 * GSAP uses the string eases; Framer Motion uses the bezier arrays / springs.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.45, 0, 0.3, 1] as const,
  in: [0.55, 0, 1, 0.45] as const,
};

/** GSAP-compatible ease names (expo.out ≈ cubic-bezier(.16,1,.3,1)). */
export const gsapEase = {
  out: "expo.out",
  inOut: "power3.inOut",
  in: "power3.in",
};

/** Seconds. */
export const duration = {
  fast: 0.16,
  base: 0.28,
  slow: 0.56,
  reveal: 0.9,
};

export const spring = {
  snappy: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
  soft: { type: "spring", stiffness: 180, damping: 26 },
  drawer: { type: "spring", stiffness: 300, damping: 34 },
} as const;
