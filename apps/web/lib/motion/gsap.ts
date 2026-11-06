"use client";
/**
 * Single place GSAP plugins are registered. Import gsap/ScrollTrigger from here,
 * never from "gsap" directly, so registration always happens once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
