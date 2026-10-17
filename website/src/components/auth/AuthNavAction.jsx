"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth-api";
import styles from "./AuthNavAction.module.css";

const actionClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-[#1ea6ff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1ea6ff]/30 transition hover:bg-[#39b5ff] max-[900px]:min-h-8 max-[900px]:px-3 max-[900px]:py-1.5 max-[900px]:text-xs max-[480px]:min-h-7 max-[480px]:px-2.5 max-[480px]:text-[11px]";

export default function AuthNavAction() {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState({ snapshot: null, user: null, error: "" });
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

  useEffect(() => {
    if (!sessionSnapshot?.startsWith("signed-in:") || !isMenuOpen || profile.snapshot === sessionSnapshot) {
      return undefined;
    }

    let isCurrent = true;
    const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
    if (!accessToken) return undefined;

    getCurrentUser(accessToken)
      .then((currentUser) => {
        if (isCurrent) setProfile({ snapshot: sessionSnapshot, user: currentUser, error: "" });
      })
      .catch(() => {
        if (isCurrent) setProfile({ snapshot: sessionSnapshot, user: null, error: "Account details could not be loaded." });
      });

    return () => {
      isCurrent = false;
    };
  }, [isMenuOpen, profile.snapshot, sessionSnapshot]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  if (sessionSnapshot === null) {
    return <span className="h-10 w-36" aria-hidden="true" />;
  }

  if (sessionSnapshot.startsWith("signed-in:")) {
    const initial = sessionSnapshot.slice("signed-in:".length) || "S";
    const currentProfile = profile.snapshot === sessionSnapshot ? profile : null;
    const user = currentProfile?.user;
    const isAdmin = typeof user?.app_metadata?.role === "string"
      && user.app_metadata.role.toLowerCase() === "admin";
    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

    return (
      <div className={styles.profileMenu} ref={menuRef}>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#75c6ed] bg-[#1ea6ff] text-sm font-bold text-white shadow-md shadow-[#1ea6ff]/25 transition hover:bg-[#168fd0] max-[900px]:h-8 max-[900px]:w-8 max-[480px]:h-7 max-[480px]:w-7"
          aria-label="Open profile menu"
          aria-expanded={isMenuOpen}
          aria-controls="account-menu"
          title="Profile"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {initial}
        </button>
        {isMenuOpen && (
          <div className={styles.menuPanel} id="account-menu">
            <div className={styles.accountDetails}>
              <strong>{name}</strong>
              {user?.email && <span>{user.email}</span>}
              {!user && !currentProfile?.error && <span role="status">Loading account details…</span>}
              {currentProfile?.error && <span role="status">{currentProfile.error}</span>}
            </div>
            <Link href="/auth/student/dashboard" onClick={() => setIsMenuOpen(false)}>
              My profile
            </Link>
            {isAdmin && (
              <Link href="/auth/admin" onClick={() => setIsMenuOpen(false)}>
                Open administration
              </Link>
            )}
          </div>
        )}
      </div>
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