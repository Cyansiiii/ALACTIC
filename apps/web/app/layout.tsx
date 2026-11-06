import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { CursorFollower } from "@/components/layout/cursor";
import { Footer } from "@/components/layout/footer";
import { InlineScript } from "@/components/layout/inline-script";
import { MockIndicator } from "@/components/layout/mock-indicator";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers/providers";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  preload: true,
});

// All fonts are self-hosted (no build-time fetch from Google). Geist ships in the `geist` package.
const instrument = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ALACTIC · The refund agent that cannot steal", template: "%s · ALACTIC" },
  description:
    "An AI that handles money, but cannot pay anyone outside a committed list. Verifiable inference on 0G, agent identity on ENS, rules enforced by the vault.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06070b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${clash.variable} ${instrument.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[200] rounded-full bg-fg px-4 py-2 text-fg-inverse focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
          <MockIndicator />
          <CursorFollower />
        </Providers>
      </body>
    </html>
  );
}
