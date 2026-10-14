"use client";

import { useEffect, useState } from "react";
import { getProgramBySlug } from "../services/programService";

export default function useProgram(slug) {
  const [result, setResult] = useState({
    slug,
    program: null,
    isLoading: Boolean(slug),
    error: "",
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!slug) return undefined;

    let isCurrent = true;

    getProgramBySlug(slug)
      .then((result) => {
        if (isCurrent) {
          setResult({ slug, program: result, isLoading: false, error: "" });
        }
      })
      .catch((loadError) => {
        if (!isCurrent) return;
        setResult({
          slug,
          program: null,
          isLoading: false,
          error:
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this program. Please try again.",
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount, slug]);

  const resultMatchesSlug = result.slug === slug;

  return {
    program: resultMatchesSlug ? result.program : null,
    isLoading: Boolean(slug) && (!resultMatchesSlug || result.isLoading),
    error: resultMatchesSlug ? result.error : "",
    retry: () => {
      setResult((current) => ({ ...current, isLoading: true, error: "" }));
      setRetryCount((count) => count + 1);
    },
  };
}
