"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const actionClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-[#1ea6ff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1ea6ff]/30 transition hover:bg-[#39b5ff] max-[900px]:min-h-8 max-[900px]:px-3 max-[900px]:py-1.5 max-[900px]:text-xs max-[480px]:min-h-7 max-[480px]:px-2.5 max-[480px]:text-[11px]";

export default function AuthNavAction() {
  const sessionSnapshot = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("innoknowvex-auth-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("innoknowvex-auth-change", onChange);
      };
    },
    () => {
      if (!window.sessionStorage.getItem("innoknowvex_access_token")) return "signed-out";
      return `signed-in:${window.sessionStorage.getItem("innoknowvex_profile_initial") || "S"}`;
    },
    () => null,
  );

  if (sessionSnapshot === null) {
    return <span className="h-10 w-36" aria-hidden="true" />;
  }

  if (sessionSnapshot.startsWith("signed-in:")) {
    const initial = sessionSnapshot.slice("signed-in:".length) || "S";

    return (
      <Link
        href="/auth/student/dashboard"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#75c6ed] bg-[#1ea6ff] text-sm font-bold text-white shadow-md shadow-[#1ea6ff]/25 transition hover:bg-[#168fd0] max-[900px]:h-8 max-[900px]:w-8 max-[480px]:h-7 max-[480px]:w-7"
        aria-label="Open student dashboard"
        title="Open student dashboard"
      >
        {initial}
      </Link>
    );
  }

  return (
    <Link
      href="/auth/student/login"
      className={actionClassName}
      aria-label="Log in or sign up"
    >
      Log In / Sign Up
    </Link>
  );
}