/**
 * Mutable, non-React store shared between GSAP/DOM listeners and the R3F frame
 * loop. Writing here never re-renders React; useFrame reads it every frame.
 */
export const heroMotion = {
  /** 0 → 1 as the hero scrolls out of view (driven by ScrollTrigger). */
  scroll: 0,
  /** Normalized pointer, -1 → 1 (desktop only). */
  pointerX: 0,
  pointerY: 0,
  /** Set false under reduced motion: scene renders one still frame. */
  animate: true,
};
