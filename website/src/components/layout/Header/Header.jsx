"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AuthNavAction from "../../auth/AuthNavAction";
import brandLogo from "../../../assets/images/hero/logo.png";
import styles from "./Header.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "ORVEXA", href: "/#orvexa-title" },
  { label: "About", href: "/About/About" },
  { label: "Contact", href: "/#contact" },
];

export default function Header({ fixed = false, activeItem = "" }) {
  const [selectedItem, setSelectedItem] = useState(activeItem);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header
      className={`${styles.navbar} ${fixed ? styles.fixed : ""}`}
      ref={headerRef}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Innoknowvex home">
          <Image
            src={brandLogo}
            alt="INNOKNOWVEX"
            width={400}
            height={70}
            priority
            className={styles.logo}
          />
        </Link>

        <nav
          id="main-navigation"
          className={styles.links}
          data-open={menuOpen}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.label === selectedItem ? styles.activeLink : styles.link}
              aria-current={item.label === selectedItem ? "page" : undefined}
              onClick={() => {
                setSelectedItem(item.label);
                setMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <AuthNavAction />
          <button
            className={styles.mobileMenuButton}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
