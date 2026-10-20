"use client";

import { useEffect, useState } from "react";
import { userFacingError } from "../lib/user-facing-error";

export default function usePublicCollection(loadCollection) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const result = await loadCollection();
        if (isCurrent) setItems(result);
      } catch (loadError) {
        if (isCurrent) {
          setError(userFacingError(loadError, "We couldn’t load this content. Please try again."));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCurrent = false;
    };
  }, [loadCollection, retryCount]);

  return {
    items,
    isLoading,
    error,
    retry: () => setRetryCount((count) => count + 1),
  };
}
