# ALACTIC — Frontend Design Brief

> Verifiable refund agent. An AI answers claim questions; the money rules live in a smart contract.
> **It can be fooled, but it cannot steal.** Sponsors shown in UI: **0G** (verifiable inference) and **ENS** (agent identity). No others.

## 1. Reference research (Step 0)

| Reference | Opened? | What I could extract |
|---|---|---|
| dribbble.com/shots/27154718 (fintech hero, 3D) | **No.** Dribbble serves a bot challenge (HTTP 202, empty body) to both the fetch tool and curl. | Nothing verifiable. |
| dribbble.com/shots/25414022 (fintech landing, 3D) | **No.** Same block. | Nothing verifiable. |
| dribbble.com/shots/25359072 (Intelliphy) | **No.** Same block. | Nothing verifiable. |
| stellofi.com | Partly. SPA shell plus the shipped CSS/JS bundle. | Text face TT Norms Pro, Inter fallback. Mono JetBrains Mono. Near-white neutrals (#F5F5F5, #E5E5E5) with one deep ink-indigo (#2B2644). Green and red at about 30% alpha for success and error tints. Radii: `rounded-xl`/`2xl`, pill buttons. A 3D environment map in the bundle. `useScroll` parallax, a marquee. Easing `cubic-bezier(.16,1,.3,1)` (expo-out). |
| payzoll.finance | Partly. SPA shell plus bundle. | Serif display face (`--font-arc-serif`) with an Inter body: an editorial contrast. Warm paper palette (#F7F4EE, #FDFBF7) with ink navy (#16182B) and a muted gold (#F3D79C). Negative tracking on headings (-0.02em to -0.03em, -1px at 40px). Large radii (24/32px cards, about 70px hero containers). IntersectionObserver reveals. Expo-out easing used throughout, plus `(.45,0,.3,1)` for in-out moves. |

**Screenshots supplied by the user (replace the blocked Dribbble fetches):**

| Shot | Extracted |
|---|---|
| "Fancy" crypto-exchange hero | Pure black field. Large bold grotesk headline, left-aligned, 3 lines, tight leading. Diagonal glowing light-bars as the hero object, with cool white light, mesh texture and depth-of-field blur. Pill-shaped nav buttons: dark ghost plus white solid. Pill input fused with an indigo-gradient CTA. Icon-button pair (language, theme) in the top right. |
| Intelliphy (AI platform, long page) | Hairline grid that divides the page into labeled rows. **Bracketed micro-labels** `[ About ]`, `[ Model Selection ]`. A single vivid electric-blue block used as a CTA tile. A glass/acrylic hexagon ring as the 3D object, with blue refraction. A radial "sunburst" data chart. A roadmap with dashed arcs and numbered nodes (M1–M4). A dark navy stats band with oversized numbers. A footer with bracketed column headings. |
| GalacticScape | Centered hero over a deep teal starfield. An **iridescent chrome orb rising from the bottom edge**, cropped, with green and violet sheen. Fine light-streak arcs. Glass side panels holding links. |

The ENS name is **`ops.alactic.eth`** (user decision; records keep the PRD's `veriops.*` key shape under an `alactic.*` prefix).

## 2. What we borrow

- **Expo-out as the house easing** (`.16,1,.3,1`). Both live references use it. It reads as "confident, settles fast."
- **Tight negative tracking on big display type** (-0.03em to -0.04em at hero sizes). Body text stays at 0.
- **Generous radii and soft containers.** 20–32px cards and a large rounded hero frame, from Payzoll.
- **A neutral field with one ink color plus a low-alpha status tint.** From Stellofi. Status is a tint plus an icon plus a label, never a loud fill.
- **Editorial type contrast:** a characterful display face over a neutral grotesk body.
- **Mono for every hash and address**, as Stellofi does with JetBrains Mono.
- **From Intelliphy:** a hairline grid, bracketed mono labels, a roadmap of dashed arcs and nodes (reused for the tier ladder), and an oversized-number stats band (reused for max-loss).
- **From "Fancy":** a black hero, a left-aligned bold headline, pill buttons, and a fused input+CTA pill (reused for the "Ask a claim question" hero input).
- **From GalacticScape:** an iridescent object cropped by the viewport edge, and thin orbital light-streaks.
- **Restrained marquee and scroll parallax.** One of each, not everywhere.

## 3. What we do differently

- **Dark-first.** Both references are light. ALACTIC's subject is security, so the default is a deep blue-black "vault night" with grain. A light variant still ships.
- **The 3D object is a single argument, not decoration.** It is a closed vault-orb: a faceted glass core inside a thin ring of committed-list "leaves." Attack particles fly in, hit the shell, and deflect. It never opens. The object recurs as the how-it-works scene state.
- **Two accents with semantic jobs:**
  - **Accent (action / brand):** electric iris `#7C6CFF` for CTAs, focus and links.
  - **Verified:** mint `#3DDC97`, used **only** when data says verified.
  - Plus a separate **revert/danger** red `#FF5A6A`, and **unknown/unverified** amber `#F5B544`. These are status colors, not accents.
- **Failure is a feature.** The attack and revert states get first-class, dramatic but legible design (terminal, error name in mono, "money did not move" counter), where fintech sites usually hide failure.
- **Honesty UI patterns:** an explicit "inference NOT verified" state, an "unknown" check state, mock-data labels in dev, and a limitations note in the footer.

## 4. Visual system

**Typography**
- Display: **Clash Display** (Fontshare, self-hosted woff2 via `next/font/local`). Weights 500/600.
- Editorial accent: **Instrument Serif italic** for one or two emphasis words per headline ("cannot *steal*"). This is the unique part of the pairing: a geometric grotesk with a serif italic, plus mono labels.
- Text: **Geist Sans** (via next/font).
- Mono: **Geist Mono** for hashes, addresses, error names and the terminal.
- Fluid scale (clamp, 320→1440px): `display-2xl` clamp(3rem, 8vw, 7.5rem) at -0.045em; `display-xl` clamp(2.5rem, 5.5vw, 5rem); `h1` clamp(2rem, 4vw, 3.5rem); `h2`; `h3`; `body-lg` 1.125rem/1.6; `body` 1rem/1.6; `small` 0.875rem/1.5; `mono-sm` 0.8125rem.

**Color tokens** (one file: `apps/web/lib/design/tokens.ts`, mirrored to CSS variables in `globals.css`)
- Dark: `bg #07080D`, `surface #0E1018`, `surface-2 #151826`, `border rgba(255,255,255,.08)`, `fg #EDEEF5`, `fg-muted #9096AE` (AA on bg).
- Light: `bg #F6F5F1` (warm paper, a nod to Payzoll), `surface #FFFFFF`, `fg #0D0F1A`.
- Glass: `surface/60%` + `backdrop-blur(16px)` + 1px inner highlight border + an SVG grain overlay at 4% opacity.
- Gradients: a radial iris→transparent glow behind the hero object only, and a faint conic sheen on the primary CTA.

**Depth:** three shadow levels plus a "glow" shadow tinted with the accent for focused or active surfaces only.

**Motion tokens:** `ease.out = (.16,1,.3,1)`, `ease.inOut = (.45,0,.3,1)`, `ease.spring = {stiffness: 380, damping: 32}`. Durations: `fast 160ms`, `base 280ms`, `slow 560ms`, `reveal 900ms`.

**Ownership rule:** GSAP owns scroll-linked transforms (pin, scrub, parallax, split-text). Framer Motion owns mount/exit, layout, gestures and drawers. The two never touch the same element's same property.

## 5. Signature 3D object

- R3F scene: an icosahedron "core" using `MeshTransmissionMaterial` (low samples on mid-tier GPUs), a thin torus ring with instanced "leaf" tiles (the committed list), and a small instanced particle field for "attacks" that curve in and bounce off a fresnel shell.
- Drei `Environment` with a small preset HDR (no custom heavy textures), soft key and rim lights.
- Mouse parallax at about 4°, plus scroll-linked rotation through GSAP driving a ref (no React re-render).
- Loaded with `next/dynamic({ ssr:false })`. A static AVIF poster renders first with the same framing, so there is no layout shift.
- Mobile or low-power/`saveData`: poster plus a CSS-animated glow only. Reduced motion: static poster.
