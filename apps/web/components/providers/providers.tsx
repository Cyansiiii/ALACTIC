"use client";
import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toast";
import { wagmiConfig } from "@/lib/chain/wagmi";
import { SmoothScroll } from "@/lib/motion/smooth-scroll";
import { useTheme } from "@/lib/use-theme";

const rkShared = { borderRadius: "large", fontStack: "system", overlayBlur: "small" } as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }),
  );
  const { theme } = useTheme();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={
            theme === "dark"
              ? darkTheme({ ...rkShared, accentColor: "#5a48f2" })
              : lightTheme({ ...rkShared, accentColor: "#4b3be8" })
          }
        >
          {/* "user" → Framer Motion honours prefers-reduced-motion everywhere. */}
          <MotionConfig reducedMotion="user">
            <SmoothScroll>{children}</SmoothScroll>
            <Toaster />
          </MotionConfig>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
