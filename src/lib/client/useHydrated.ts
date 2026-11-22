"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * false during SSR and before hydration, true once React controls the page.
 * Forms disable submission until hydrated so a pre-hydration native submit can
 * never send credentials or personal data in a GET query string.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
