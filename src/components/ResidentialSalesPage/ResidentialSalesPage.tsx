/**
 * @file components/ResidentialSalesPage/ResidentialSalesPage.tsx
 * @description Residential Outside Sales team landing page (parity with cloud.e.frontier.com/residential-sales-team).
 */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ResidentialSalesPage.module.css";
import { TeamFeaturedVideo, TeamVideoSlider } from "./TeamVideoSlider";

const sections = [
  { id: "why", label: "Why Frontier?" },
  { id: "benefits", label: "Benefits" },
  { id: "about", label: "About you" },
  { id: "team", label: "Hear from the team", shortLabel: "The team" },
  { id: "apply", label: "Apply now" },
] as const;

export function ResidentialSalesPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id as (typeof sections)[number]["id"]);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );

    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.root}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroContainer}>
            <div className={styles.titleWrapper}>
              <h1 id="hero-heading" className={`${styles.h1} ${styles.heroHeading}`}>
                <span>Frontier Fiber takes you further</span>
              </h1>
              <p className={`${styles.h4} ${styles.heroText}`}>
                Join our Outside Sales team today and unlock six-figure earning potential and career growth
                tomorrow.
              </p>
              <div>
                <a
                  href="https://careers.frontier.com/careers/?query=Outside%20Sales&amp;utm_source=outsidesales"
                  className={styles.btnPrimary}
                >
                  Apply now
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroImg}>
          <Image
            src="/ftr-forms/images/Residential-hero-mobile.jpg"
            alt=""
            width={1440}
            height={500}
            priority
            className={styles.heroPhoto}
          />
        </div>
      </section>

      <section className={styles.bkgGray100}>
        <div className={styles.contain}>
          <nav className={styles.tabLinks} aria-label="Page sections">
            <div className={styles.tabLinksRow}>
              {sections.map(({ id, label, shortLabel }) => (
                <a
                  key={id}
                  className={`${styles.tabLink} ${styles.h5} ${activeSection === id ? styles.tabLinkActive : ""}`}
                  href={`#${id}`}
                  aria-current={activeSection === id ? "location" : undefined}
                  onClick={() => setActiveSection(id)}
                >
                  {shortLabel ? (
                    <>
                      <span className={styles.viewLg}>{label}</span>
                      <span className={styles.viewSm}>{shortLabel}</span>
                    </>
                  ) : (
                    label
                  )}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <section id="why" className={`${styles.pageRoot} ${styles.bkgGray100}`}>
        <div className={`${styles.contain} ${styles.newsBlock}`}>
          <div className={styles.headingBorder}>
            <div className={styles.whyTitleWrap}>
              <div className={styles.h2}>Why Frontier?</div>
            </div>
          </div>
          <div className={styles.flexApart}>
            <div className={styles.newsSubTitle}>
              <div className={styles.h2}>We are the largest pure-play fiber broadband provider in the U.S.</div>
            </div>
            <div className={styles.newsDescription}>
              <p className={styles.p1}>
                and this is just the beginning. We’re committed to bringing fiber-fast internet to 10 million
                locations, and we’re two-thirds of the way there. With your drive and our innovative solutions,
                you’ll be the key to unlocking this transformation, one home at a time. Harness your skills to
                secure new customers and watch your career soar with Frontier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className={styles.pageRoot}>
        <div className={styles.contain}>
          <div className={`${styles.bannerTitle} ${styles.center}`}>
            <h2 className={styles.h2}>The benefits of joining the team</h2>
          </div>
          <div className={styles.flexRowCards}>
            <article className={styles.card}>
              <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.1243 12.8753H27.4996V15.8753H15.125C14.8488 15.8753 14.625 16.0991 14.625 16.3753V18.0001C14.625 18.2763 14.8488 18.5001 15.125 18.5001H24.8746C26.8076 18.5001 28.3746 20.0671 28.3746 22.0001V23.625C28.3746 25.558 26.8076 27.125 24.8746 27.125H22.1243V30.0001H19.1243V27.125H12.5V24.125H24.8746C25.1508 24.125 25.3746 23.9011 25.3746 23.625V22.0001C25.3746 21.724 25.1508 21.5001 24.8746 21.5001H15.125C13.192 21.5001 11.625 19.9331 11.625 18.0001V16.3753C11.625 14.4423 13.192 12.8753 15.125 12.8753H19.1243V10.0005H22.1243V12.8753Z" fill="#96FFF5" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0.5 16C0.5 7.16344 7.66344 0 16.5 0H24.5C33.3366 0 40.5 7.16344 40.5 16V24C40.5 32.8366 33.3366 40 24.5 40H16.5C7.66344 40 0.5 32.8366 0.5 24V16ZM16.5 4H24.5C31.1274 4 36.5 9.37258 36.5 16V24C36.5 30.6274 31.1274 36 24.5 36H16.5C9.87258 36 4.5 30.6274 4.5 24V16C4.5 9.37258 9.87258 4 16.5 4Z" fill="#96FFF5" />
              </svg>
              <h3 className={styles.h3}>Competitive pay</h3>
              <p className={styles.p1}>Earn around $95,000 with an annual upside of over $200,000.</p>
            </article>
            <article className={styles.card}>
              <svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.5 21.6C0.5 9.67065 10.1706 0 22.1 0H26.9C38.8294 0 48.5 9.67065 48.5 21.6V26.4C48.5 38.3294 38.8294 48 26.9 48H22.1C10.1706 48 0.5 38.3294 0.5 26.4V21.6ZM22.1 4.8H26.9C36.1784 4.8 43.7 12.3216 43.7 21.6V26.4C43.7 35.6784 36.1784 43.2 26.9 43.2L26.9 20.4L33.5 27L37.1 23.4L24.5 10.8L11.9 23.4L15.5 27L22.1 20.4L22.1 43.2C12.8216 43.2 5.3 35.6784 5.3 26.4V21.6C5.3 12.3216 12.8216 4.8 22.1 4.8Z" fill="#96FFF5" />
              </svg>
              <h3 className={styles.h3}>Career growth</h3>
              <p className={styles.p1}>
                Ramp &amp; training pay, tuition assistance, performance-based promotions, and succession planning.
              </p>
            </article>
            <article className={styles.card}>
              <svg width="49" height="40" viewBox="0 0 49 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0.5 0V4H32.5C39.1274 4 44.5 9.37258 44.5 16V24C44.5 30.6274 39.1274 36 32.5 36H24.5C17.8726 36 12.5 30.6274 12.5 24H8.5C8.5 32.8366 15.6634 40 24.5 40H32.5C41.3366 40 48.5 32.8366 48.5 24V16C48.5 7.16344 41.3366 0 32.5 0H0.5Z" fill="#96FFF5" />
                <path d="M2.5 8V12H13.1828C13.7096 10.5095 14.5225 9.15419 15.5556 8H2.5Z" fill="#96FFF5" />
                <path d="M4.5 16H12.5V20H4.5V16Z" fill="#96FFF5" />
                <path d="M30.1243 12.8753H35.4996V15.8753H23.125C22.8488 15.8753 22.625 16.0991 22.625 16.3753V18.0001C22.625 18.2763 22.8488 18.5001 23.125 18.5001H32.8746C34.8076 18.5001 36.3746 20.0671 36.3746 22.0001V23.625C36.3746 25.558 34.8076 27.125 32.8746 27.125H30.1243V30.0001H27.1243V27.125H20.5V24.125H32.8746C33.1508 24.125 33.3746 23.9011 33.3746 23.625V22.0001C33.3746 21.724 33.1508 21.5001 32.8746 21.5001H23.125C21.192 21.5001 19.625 19.9331 19.625 18.0001V16.3753C19.625 14.4423 21.192 12.8753 23.125 12.8753H27.1243V10.0005H30.1243V12.8753Z" fill="#96FFF5" />
              </svg>
              <h3 className={styles.h3}>Immediate benefits</h3>
              <p className={styles.p1}>
                Medical, dental, vision, and prescription plans from day one. 20 days paid time off + 10 holidays.
              </p>
            </article>
            <article className={styles.card}>
              <svg width="45" height="40" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M21.2994 38.9807C21.5995 39.2808 22.0496 39.4309 22.4998 39.4309C22.9499 39.4309 23.4 39.2808 23.7751 38.9807C24.0608 38.7767 24.3687 38.5282 24.6867 38.2716C24.9533 38.0564 25.227 37.8356 25.5007 37.6303C30.002 34.1793 36.1539 29.3778 39.0048 25.6267C41.7806 22.0256 44.2563 18.3495 44.2563 13.2479C44.2563 7.39616 39.68 0.869183 32.3277 0.569092H32.2527C27.7513 0.569092 24.5254 2.66973 22.4998 4.17018C20.3991 2.66973 17.2482 0.569092 12.7468 0.569092H12.6718C5.31955 0.869183 0.743164 7.39616 0.743164 13.2479C0.743164 18.3495 3.29394 22.0256 6.06978 25.6267C8.99566 29.3778 15.0725 34.1793 19.5739 37.6303C20.174 38.0805 20.7742 38.5306 21.2994 38.9807ZM4.71937 13.2479C4.71937 9.79689 7.49521 4.84539 12.7468 4.62032C16.4229 4.62032 19.0487 6.64593 20.6242 7.99634L21.1493 8.37146C21.8996 8.89661 22.8749 8.89661 23.5501 8.37146C23.6626 8.29643 23.7751 8.20265 23.8877 8.10887C24.0002 8.0151 24.1127 7.92132 24.2253 7.8463L24.2623 7.81855C26.0597 6.47035 28.5262 4.62032 32.1027 4.62032C37.3543 4.84539 40.1301 9.79689 40.1301 13.2479C40.1301 17.0741 38.1045 20 35.7038 23.1509C33.153 26.4519 27.0011 31.2534 22.9499 34.4043C22.7998 34.4794 22.5748 34.6294 22.4247 34.7795C22.2747 34.7044 22.0496 34.5544 21.8996 34.4043C21.7456 34.2846 21.5886 34.1626 21.4289 34.0385C19.5817 32.6027 17.3706 30.8841 15.2796 29.1311L16.638 27.7727C17.4189 28.117 18.2825 28.3082 19.1908 28.3082H19.8574C23.3552 28.3082 26.1908 25.4727 26.1908 21.9749V14.9749H19.1908C15.693 14.9749 12.8574 17.8104 12.8574 21.3082V21.9749C12.8574 22.9488 13.0772 23.8713 13.47 24.6956C13.536 24.8342 13.5993 24.9648 13.664 25.0902L19.3804 19.3738L20.7946 20.788L18.6852 22.8974L18.6851 22.8972L13.7559 27.8264C11.872 26.1749 10.2008 24.5474 9.14571 23.1509C6.74498 20 4.71937 17.0741 4.71937 13.2479Z" fill="#96FFF5" />
              </svg>
              <h3 className={styles.h3}>Inclusive policies</h3>
              <p className={styles.p1}>Same-sex spouse benefits, paid parental leave, and adoption assistance.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.pageRoot} ${styles.bkgGray100}`}>
        <div className={`${styles.contain} ${styles.center} ${styles.bannerTitle} ${styles.bannerTitleFull}`}>
          <h3 className={`${styles.h4} ${styles.whiteText} ${styles.careerPromoHeading}`}>
            In less than 12 months, you’ll be eligible for promotions within Outside Sales. Plus, with 11 other sales
            divisions and over 25 roles across the organization, the opportunities to advance your sales career are
            endless.
          </h3>
        </div>
        <div className={styles.centeredImage}>
          <Image
            src="/ftr-forms/images/Residential-centered.png"
            alt="Career growth illustration"
            width={1240}
            height={540}
          />
        </div>
      </section>

      <div className={styles.rootPb} id="about">
        <div className={styles.contain}>
          <div className={styles.oneHalfMini}>
            <div className={styles.figure}>
              <Image
                src="/ftr-forms/images/Residential-about.jpg"
                alt=""
                width={600}
                height={426}
              />
            </div>
            <article>
              <div>
                <h3 className={styles.h3}>What you&apos;ll bring</h3>
                <ul className={styles.p1}>
                  <li>
                    You have engaging interpersonal skills and build connections with potential customers through
                    friendly and engaging interactions.
                  </li>
                  <li>
                    You learn as you go, listen to customer needs and craft tailored pitches to sell Frontier&apos;s
                    services.
                  </li>
                  <li>
                    You have strong passion for success and show your drive to succeed by actively pursuing and closing
                    sales.
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </div>

      <section id="team" className={`${styles.pageRoot} ${styles.meet}`}>
        <div className={styles.contain}>
          <div className={`${styles.bannerTitle} ${styles.center}`}>
            <h2 className={styles.h2}>Hear from the team</h2>
            <p className={styles.p1}>
              At Frontier, your wellness comes first. We offer a supportive, inclusive work environment. Our team
              thrives on collaboration, innovation, and a shared commitment to transforming connectivity.
            </p>
          </div>
          <TeamFeaturedVideo />
          <TeamVideoSlider />
        </div>
      </section>

      <section id="apply" className={`${styles.pageRoot} ${styles.bkgColorSecondary}`}>
        <div className={`${styles.bannerTitle} ${styles.splitTitle}`}>
          <div className={styles.title}>
            <h3 className={styles.h3}>Your future begins here</h3>
          </div>
          <div className={styles.description}>
            <div className={styles.p1}>
              Ready to take the next step? Click below to visit our full job site for more details!
            </div>
            <div>
              <a
                href="https://careers.frontier.com/careers/?query=Outside%20Sales&amp;utm_source=outsidesales"
                className={`${styles.btn} ${styles["btn-tertiary"]}`}
              >
                Apply now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
