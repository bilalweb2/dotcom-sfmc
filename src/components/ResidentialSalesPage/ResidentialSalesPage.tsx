/**
 * @file components/ResidentialSalesPage/ResidentialSalesPage.tsx
 * @description Page component for the Pending Disco upgrade landing page.
 * Renders the hero, offer section, and legal footer.
 * Header and site footer are provided by the parent layout (PageLayout).
 * On submit the form data is POST-ed to /api/disconnecting-processing and, on success,
 * the user is redirected to the pending deactivation confirmation page.
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ResidentialSalesPage.module.css";

const sections = [
  { id: "why-frontier", label: "Why Frontier?" },
  { id: "benefits", label: "Benefits" },
  { id: "about-you", label: "About you" },
  { id: "hear-from-the-team", label: "The team" },
  { id: "apply-now", label: "Apply now" },
];

const videoSlides = [
  { id: "raul", title: "Raul: Training and Support" },
  { id: "autumn", title: "Autumn: Team Culture" },
  { id: "david", title: "David: Team Mission" },
  { id: "norman", title: "Norman: Career Growth" },
];

export function ResidentialSalesPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id);
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
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroContainer}>
            <div className={styles.titleWrapper}>
              <h1 id="hero-heading" className={`${styles.h1} ${styles.heroHeading}`}>
                <span>Frontier Fiber takes you further</span>
              </h1>
              <p className={`${styles.h4} ${styles.heroText}`}>Join our Outside Sales team today and unlock 
                six-figure earning potential and career growth tomorrow.</p>
                <div><a href="https://careers.frontier.com/careers/?query=Outside%20Sales&amp;utm_source=outsidesales" 
                className={styles.btnPrimary}>Apply now</a></div>
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
<section className={styles.navSection}>
      <nav className={`${styles.contain} ${styles.sectionNav}`} aria-label="Page sections">
        <div className={styles.sectionNavInner}>
          {sections.map(({ id, label }) => (
            <a
              key={id}
              className={`${styles.sectionNavLink} ${styles.h5} ${activeSection === id ? styles.sectionNavLinkActive : ""}`}
              href={`#${id}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setActiveSection(id)}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
</section>
      <section id="why-frontier" className={styles.whySection} aria-labelledby="why-heading">
        <div className={styles.sectionInner}>
          <h2 id="why-heading" className={`${styles.whyHeading} ${styles.h2}`}>Why Frontier?</h2>
          <div className={styles.whyContent}>
            <h3 className={styles.h2}>We are the largest pure-play fiber broadband provider in the U.S.</h3>
            <p className={styles.newsDescription}>
              and this is just the beginning. We’re committed to bringing fiber-fast internet to 10 million locations, and we’re two-thirds of the way there. With your drive and our innovative solutions, you’ll be the key to unlocking this transformation, one home at a time. Harness your skills to secure new customers and watch your career soar with Frontier.
            </p>
          </div>
        </div>
      </section>

      <section id="benefits" className={styles.benefitsSection} aria-labelledby="benefits-heading">
        <div className={styles.sectionInner}>
          <h2 id="benefits-heading" className={`${styles.sectionHeading} ${styles.h2}`}>The benefits of joining the team</h2>
          <div className={styles.benefitGrid}>
            <article className={styles.benefitItem}>
              <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="7" />
                <path d="M15.5 8.5h-5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4h-5M12 6.5v2m0 7v2" />
              </svg>
              <h3 className={styles.h3}>Competitive pay</h3>
              <p className={styles.p1}>Earn around $95,000 with an annual upside of over $200,000.</p>
            </article>
            <article className={styles.benefitItem}>
              <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 17V7m-4 4 4-4 4 4" />
              </svg>
              <h3 className={styles.h3}>Career growth</h3>
              <p className={styles.p1}>Ramp and training pay, tuition assistance, performance-based promotions, and succession planning.</p>
            </article>
            <article className={styles.benefitItem}>
              <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h13a5 5 0 0 1 0 10H8" />
                <path d="M3 10h10a3 3 0 0 1 0 6H8m-5-6V6m0 10v2m8-10v2m0 6v2" />
              </svg>
              <h3 className={styles.h3}>Immediate benefits</h3>
              <p className={styles.p1}>Medical, dental, vision, and prescription plans from day one. 20 days paid time off + 10 holidays.</p>
            </article>
            <article className={styles.benefitItem}>
              <svg className={styles.benefitIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 8.5c0 5-8.5 11-8.5 11s-8.5-6-8.5-11A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 2.5Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h3 className={styles.h3}>Inclusive policies</h3>
              <p className={styles.p1}>Same-sex spouse benefits, paid parental leave, and adoption assistance.</p>
            </article>
          </div>
        </div>
        <div className={styles.careerGrowth}>
          <div className={styles.careerGrowthInner}>
            <p className={`${styles.careerGrowthCopy} ${styles.h4}`}>
              In less than 12 months, you’ll be eligible for promotions within Outside Sales. Plus, with 11 other sales divisions and over 25 roles across the organization, the opportunities to advance your sales career are endless.
            </p>
            <div className={styles.centeredImage}>
              <Image
                src="/ftr-forms/images/Residential-centered.png"
                alt="Career growth illustration"
                width={1240}
                height={540}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about-you" className={styles.aboutSection} aria-labelledby="about-heading">
<div className={styles.contain}>
    <div className={styles.oneHalfMini}>
      <div className={styles.figure}>
        <Image src="/ftr-forms/images/Residential-about.jpg" alt="About you illustration"
        width={600}
        height={426}
        >
        </Image>
        </div>
      <article>
        <div>
          <h3 className={styles.h3}>What you'll bring</h3>
            <ul className={styles.p1}>
              <li>You have engaging interpersonal skills and build connections with potential customers through friendly and engaging interactions.</li>
              <li>You learn as you go, listen to customer needs and craft tailored pitches to sell Frontier's services.</li>
              <li>You have strong passion for success and show your drive to succeed by actively pursuing and closing sales.</li>
            </ul>
        </div>
      </article>
      </div>
    </div>
      </section>

      <section id="hear-from-the-team" className={styles.teamSection} aria-labelledby="team-heading">
<div className={styles.contain} id="meet">
      <div className={styles.bannerTitle} >
        <h2 className={styles.h2}>Hear from the team</h2>
        <p className={styles.p1}  >
          At Frontier, your wellness comes first. We offer a supportive, inclusive work environment. Our team thrives on collaboration, innovation, and a shared commitment to transforming connectivity.
        </p>
      </div>

      <section className={styles.mainVideo}>
        <div className={styles.videoContainer}>
          <div className={styles.videoWrapper}>
            <iframe src="https://players.brightcove.net/4821467228001/BkZGPpHw_default/index.html?videoId=6355031047112" allow="encrypted-media" allowFullScreen title="Brightcove video player"></iframe>
          </div>
        </div>
      </section>

    </div>
      </section>

      <section id="apply-now" className={styles.applySection} aria-labelledby="apply-heading">
<div className={styles.bannerTitle + " " + styles.splitTitle}>
        <div className={styles.title}>
            <h3 className={styles.h3}>
              Your future begins here
            </h3>
        </div>
        <div className={styles.description}>
          <div className={styles.p1}>Ready to take the next step? Click below to visit our full job site for more details!</div>  
          <div>         
             <a href="https://careers.frontier.com/careers/?query=Outside%20Sales&amp;utm_source=outsidesales" className={styles.btn + " " + styles["btn-tertiary"]}>Apply now</a>
          </div>
        </div>
      </div>
      </section>

    </div>
  );
}
