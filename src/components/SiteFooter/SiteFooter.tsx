/**
 * @file components/SiteFooter/SiteFooter.tsx
 * @description Footer from https://cloud.e.frontier.com/Unsubscribe-form.
 * Six link columns on desktop; each column collapses on smaller screens.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./SiteFooter.module.css";

const columns: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Shop",
      links: [
        { label: "Deals", href: "https://frontier.com/shop/deals" },
        { label: "Plans", href: "https://frontier.com/shop" },
        { label: "Internet", href: "https://frontier.com/shop/internet" },
        {
          label: "Fiber Internet",
          href: "https://frontier.com/shop/internet/fiber-internet",
        },
        { label: "Video/TV", href: "https://frontier.com/shop/tv" },
        { label: "Phone", href: "https://frontier.com/shop/phone" },
        {
          label: "Additional Services",
          href: "https://frontier.com/shop/additional-services",
        },
        { label: "Moving", href: "https://frontier.com/resources/movers" },
        { label: "Availability", href: "https://frontier.com/local" },
      ],
    },
    {
      heading: "My Account",
      links: [
        {
          label: "Register",
          href: "https://frontier.com/resources/frontier-id-registration?icid=18jun18_national_homepage_register_footer_page_link",
        },
        { label: "Pay Bill", href: "https://frontier.com/login" },
        { label: "Express Pay", href: "https://login.frontier.com/expresspay" },
        { label: "Manage Account", href: "https://frontier.com/login" },
        {
          label: "MyFrontier App",
          href: "https://frontier.com/resources/myfrontier-mobile-app",
        },
        {
          label: "Refer Friends & Family",
          href: "https://www.frontiercustomerreferral.com/",
        },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Center", href: "https://frontier.com/helpcenter" },
        {
          label: "Check for outages",
          href: "https://frontier.com/helpcenter/internet/troubleshooting/check-for-service-outages",
        },
        { label: "How-To Videos", href: "https://videos.frontier.com/" },
        {
          label: "Order/Ticket Status",
          href: "https://frontier.com/helpcenter/categories/order-ticket-status",
        },
        {
          label: "Affordability Programs",
          href: "https://frontier.com/discount-programs/affordability-programs",
        },
        {
          label: "Contact Us",
          href: "https://frontier.com/contactus/contact-us",
        },
      ],
    },
    {
      heading: "Corporate",
      links: [
        { label: "Company", href: "https://newsroom.frontier.com/leadership/" },
        {
          label: "Investors",
          href: "https://investor.frontier.com/corporate-profile/default.aspx",
        },
        { label: "News", href: "https://newsroom.frontier.com/" },
        { label: "Blog", href: "https://blog.frontier.com/" },
        {
          label: "Responsibility",
          href: "https://frontier.com/corporate/responsibility/home",
        },
        {
          label: "Suppliers",
          href: "https://newsroom.frontier.com/suppliers/",
        },
        { label: "Careers", href: "https://frontier-careers.com/" },
      ],
    },
    {
      heading: "Frontier Sites",
      links: [
        { label: "Small Business", href: "https://business.frontier.com/" },
        { label: "Enterprise", href: "https://enterprise.frontier.com/" },
        { label: "Wholesale", href: "https://wholesale.frontier.com/home" },
        {
          label: "Multifamily",
          href: "https://frontier.com/resources/multifamily",
        },
        {
          label: "Frontier Business Partner Program",
          href: "https://agents.frontier.com/",
        },
        {
          label: "Phone Directories",
          href: "https://frontier.com/resources/white-pages",
        },
      ],
    },
    {
      heading: "Sales Partners",
      links: [
        { label: "Frontier Fiber", href: "https://go.frontier.com/" },
        {
          label: "Local Internet",
          href: "https://www.frontierbundles.com/availability",
        },
      ],
    },
  ];

const legalLinks = [
  { label: "Home", href: "https://frontier.com/" },
  { label: "Site Map", href: "https://frontier.com/sitemap-adhoc-page" },
  {
    label: "Policies & Notifications",
    href: "https://frontier.com/corporate/policies",
  },
  { label: "Terms & Conditions", href: "https://frontier.com/corporate/terms" },
  {
    label: "Privacy Policy",
    href: "https://frontier.com/corporate/privacy-policy",
  },
  {
    label: "California Privacy Policy",
    href: "https://frontier.com/corporate/privacy-policy-california",
  },
];

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/FrontierCorp",
    src: "/images/svg/social/x.svg",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/FrontierCorp",
    src: "/images/svg/social/facebook.svg",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/163906/",
    src: "/images/svg/social/linkedin.svg",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/user/FrontierCorp",
    src: "/images/svg/social/youtube.svg",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/frontierinternet/",
    src: "/images/svg/social/instagram.svg",
  },
];

export function SiteFooter() {
  const [openColumn, setOpenColumn] = useState<string | null>(null);

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          {columns.map(({ heading, links }) => {
            const open = openColumn === heading;
            return (
              <div key={heading} className={styles.column}>
                <button
                  type="button"
                  className={`${styles.heading}${open ? ` ${styles.headingOpen}` : ""}`}
                  aria-expanded={open}
                  onClick={() =>
                    setOpenColumn((current) =>
                      current === heading ? null : heading,
                    )
                  }
                >
                  {heading}
                  <svg
                    className={styles.chevron}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
                <ul
                  className={`${styles.linkList}${open ? ` ${styles.linkListOpen}` : ""}`}
                >
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className={styles.copyright}>© {new Date().getFullYear()} Verizon</p>

        <div className={styles.bottom}>
          <nav className={styles.legal} aria-label="Footer legal">
            {legalLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={styles.legalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.social}>
            {socialLinks.map(({ label, href, src }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}${src}`}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.socialIcon}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
