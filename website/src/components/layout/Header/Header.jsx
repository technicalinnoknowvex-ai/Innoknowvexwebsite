"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AuthNavAction from "../../auth/AuthNavAction";
import brandLogo from "../../../assets/images/hero/logo.png";
import styles from "./Header.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/#programs" },
  { label: "ORVEXA", href: "/#orvexa-title" },
  { label: "About", href: "/#about" },
  { label: "Resources", href: "/#resources" },
  { label: "Contact", href: "/#contact" },
];

export default function Header({ fixed = false, activeItem = "" }) {
  const [selectedItem, setSelectedItem] = useState(activeItem);

  return (
    <header className={`${styles.navbar} ${fixed ? styles.fixed : ""}`}>
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

        <nav className={styles.links} aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.label === selectedItem ? styles.activeLink : styles.link}
              aria-current={item.label === selectedItem ? "page" : undefined}
              onClick={() => setSelectedItem(item.label)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AuthNavAction />
      </div>
    </header>
  );
}
