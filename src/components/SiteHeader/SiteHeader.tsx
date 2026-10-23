/**
 * @file components/SiteHeader/SiteHeader.tsx
 * @description Header from https://cloud.e.frontier.com/Unsubscribe-form.
 * Desktop: dark audience bar + red navigation bar with dropdowns.
 * Mobile: red bar (menu, logo, Sign In) and a collapsible navigation panel.
 * The navigation stays pinned to the top while the page scrolls; the audience
 * bar is visible only at the top of the page.
 */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./SiteHeader.module.css";

type SubLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

type NavItem = {
  label: string;
  href?: string;
  children?: SubLink[];
};

const audienceLinks = [
  { label: "Residential", href: "https://frontier.com/", active: true },
  {
    label: "Small Business",
    href: "https://business.frontier.com/",
    active: false,
  },
  {
    label: "Enterprise",
    href: "https://enterprise.frontier.com/",
    active: false,
  },
  {
    label: "Wholesale",
    href: "https://wholesale.frontier.com/",
    active: false,
  },
];

const navItems: NavItem[] = [
  {
    label: "Shop",
    children: [
      { label: "Deals", href: "https://frontier.com/deals" },
      { label: "Plans", href: "https://frontier.com/shop" },
      {
        label: "Internet",
        href: "https://frontier.com/shop/internet",
        children: [
          {
            label: "7 Gig",
            href: "https://frontier.com/shop/internet/fiber-internet/7-gig",
          },
          {
            label: "5 Gig",
            href: "https://frontier.com/shop/internet/fiber-internet/5-gig",
          },
          {
            label: "2 Gig",
            href: "https://frontier.com/shop/internet/fiber-internet/2-gig",
          },
          {
            label: "1 Gig",
            href: "https://frontier.com/shop/internet/fiber-optic-internet/gig",
          },
          {
            label: "500 Mbps",
            href: "https://frontier.com/shop/internet/fiber-internet/500",
          },
        ],
      },
      { label: "Phone", href: "https://frontier.com/shop/phone" },
      { label: "TV & Streaming", href: "https://frontier.com/shop/tv" },
      {
        label: "Additional Services",
        href: "https://frontier.com/shop/additional-services",
      },
    ],
  },
  {
    label: "Why Frontier",
    children: [
      { label: "Why Frontier", href: "https://frontier.com/why-frontier" },
      {
        label: "Why Fiber",
        href: "https://frontier.com/why-frontier/why-fiber-internet",
      },
      {
        label: "Fiber Expansion",
        href: "https://frontier.com/why-frontier/why-fiber-internet/fiber-expansion",
      },
      {
        label: "Get Fiber",
        href: "https://frontier.com/why-frontier/get-fiber",
      },
    ],
  },
  {
    label: "Support",
    children: [
      { label: "Help Center", href: "https://frontier.com/helpcenter" },
      { label: "How-To Videos", href: "https://videos.frontier.com/" },
      {
        label: "Check for outage",
        href: "https://frontier.com/pages/helpcenter/internet/troubleshooting/check-for-service-outages",
      },
      {
        label: "Order/Ticket Status",
        href: "https://frontier.com/pages/helpcenter/order-ticket-status",
      },
      {
        label: "Contact Us",
        href: "https://frontier.com/contactus/contact-us",
      },
      { label: "Moving", href: "https://frontier.com/resources/movers" },
    ],
  },
  { label: "Deals", href: "https://frontier.com/shop/deals" },
];

function Caret() {
  return (
    <svg className={styles.caret} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const basePath = process.env.NEXT_PUBLIC_APP_URL ?? "";

interface SiteHeaderProps {
  showAudienceBar?: boolean;
}

export function SiteHeader({ showAudienceBar = true }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMobile() {
    setMobileOpen(false);
    setOpenMenu(null);
  }

  function toggleMenu(label: string) {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    setOpenMenu((current) => (current === label ? null : label));
  }

  return (
    <div className={`${styles.root}${scrolled ? ` ${styles.scrolled}` : ""}`}>
      {showAudienceBar && (
        <div className={styles.topbar} hidden={scrolled}>
          <nav className={styles.topbarInner} aria-label="Audience">
            {audienceLinks.map(({ label, href, active }) => (
              <a
                key={label}
                href={href}
                className={
                  active
                    ? `${styles.topLink} ${styles.topLinkActive}`
                    : styles.topLink
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.bar}>
          <button
            type="button"
            className={`${styles.hamburger}${mobileOpen ? ` ${styles.hamburgerOpen}` : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open);
              setOpenMenu(null);
            }}
          >
            <span />
          </button>

          <a
            href="https://frontier.com/"
            className={styles.logoLink}
            aria-label="Frontier, a Verizon Company"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={`${basePath}/images/svg/site-desktop-logo-verizon.svg`}
              alt=""
              width={208}
              height={48}
              priority
              className={styles.logoDesktop}
            />
            <Image
              src={`${basePath}/images/svg/site-mobile-logo-verizon.svg`}
              alt=""
              width={30}
              height={30}
              className={styles.logoMobile}
            />
          </a>

          <a
            href="https://frontier.com/login"
            className={styles.signInMobile}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign In
          </a>

          <div
            className={`${styles.collapse}${mobileOpen ? ` ${styles.collapseOpen}` : ""}`}
          >
            <div className={styles.navArea}>
              <nav aria-label="Site Navigation">
                <ul className={styles.menu}>
                  {navItems.map((item) =>
                    item.children ? (
                      <li
                        key={item.label}
                        className={`${styles.menuItem}${openMenu === item.label ? ` ${styles.menuItemOpen}` : ""}`}
                      >
                        <button
                          type="button"
                          className={styles.navButton}
                          aria-expanded={openMenu === item.label}
                          onClick={() => toggleMenu(item.label)}
                        >
                          {item.label}
                          <Caret />
                        </button>
                        <div className={styles.submenuWrap}>
                          <ul className={styles.submenu}>
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <a
                                  href={child.href}
                                  className={styles.subLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={closeMobile}
                                >
                                  {child.label}
                                </a>
                                {child.children && (
                                  <ul className={styles.nested}>
                                    {child.children.map((nested) => (
                                      <li key={nested.label}>
                                        <a
                                          href={nested.href}
                                          className={`${styles.subLink} ${styles.nestedLink}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={closeMobile}
                                        >
                                          {nested.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ) : (
                      <li key={item.label} className={styles.menuItem}>
                        <a
                          href={item.href}
                          className={styles.navLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={closeMobile}
                        >
                          {item.label}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </nav>

              <a
                href="https://frontier.com/login"
                className={styles.signInDesktop}
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign In/Register
              </a>

              {showAudienceBar && (
                <ul className={styles.audience}>
                  {audienceLinks.map(({ label, href, active }) => (
                    <li
                      key={label}
                      className={active ? styles.audienceActive : undefined}
                    >
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMobile}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
