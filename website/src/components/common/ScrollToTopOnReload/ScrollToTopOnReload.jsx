"use client";

import { useLayoutEffect } from "react";

export default function ScrollToTopOnReload() {
  useLayoutEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];

    if (navigationEntry?.type === "reload") {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
