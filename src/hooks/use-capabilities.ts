"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

type Capabilities = {
  reducedMotion: boolean;
  lowPower: boolean;
};

/**
 * Client capability probe for the WebGL hero. Reactive (updates if the user
 * toggles reduced-motion or crosses the mobile breakpoint). Renders the static
 * fallback on the server / first paint via the `false` server snapshots.
 */
export function useCapabilities(): Capabilities {
  // Cautious server/first-paint defaults: assume reduced-motion + mobile so the
  // WebGL scene never mounts until the client confirms it's safe to.
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const smallViewport = useMediaQuery("(max-width: 768px)", true);

  // Hardware hints (non-reactive): stable primitive snapshot, no listeners.
  const weakHardware = useSyncExternalStore(
    noopSubscribe,
    () => {
      const cores = navigator.hardwareConcurrency ?? 8;
      const memory = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory ?? 8;
      return cores <= 4 || memory <= 4;
    },
    () => false,
  );

  return { reducedMotion, lowPower: smallViewport || weakHardware };
}
