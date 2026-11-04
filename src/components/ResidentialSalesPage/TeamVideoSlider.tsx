"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ResidentialSalesPage.module.css";

const BRIGHTCOVE_EMBED_BASE =
  "https://players.brightcove.net/4821467228001/BkZGPpHw_default/index.html";

const DEFAULT_VIDEO_ID = "6355031047112";
const SLIDE_MAX_WIDTH_PX = 518;
const SLIDER_LIST_MAX_WIDTH_PX = 550;
const SLIDE_GAP_DESKTOP_PX = 32;
const SLIDE_GAP_MOBILE_PX = 16;
const MOBILE_BREAKPOINT_PX = 767;
const AUTO_ADVANCE_MS = 20000;

export type TeamVideoSlide = {
  id: string;
  title: string;
  thumbnailSrc: string;
  videoId?: string;
};

export const teamVideoSlides: TeamVideoSlide[] = [
  {
    id: "autumn",
    title: "Autumn: Team Culture",
    thumbnailSrc: "/ftr-forms/images/residential-team/autumn.jpg",
    videoId: "6359585235112",
  },
  {
    id: "david",
    title: "David: Team Mission",
    thumbnailSrc: "/ftr-forms/images/residential-team/david.jpg",
    videoId: "6359585840112",
  },
  {
    id: "norman",
    title: "Norman: Career Growth",
    thumbnailSrc: "/ftr-forms/images/residential-team/norman.jpg",
    videoId: "6359586020112",
  },
  {
    id: "raul",
    title: "Raul: Training and Support",
    thumbnailSrc: "/ftr-forms/images/residential-team/raul.jpg",
    videoId: "6359707114112",
  },
];

function brightcoveEmbedUrl(videoId: string) {
  return `${BRIGHTCOVE_EMBED_BASE}?videoId=${videoId}`;
}

function PlayIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.2643 6.66667H17.931C22.3493 6.66667 25.931 10.2484 25.931 14.6667V17.3333C25.931 21.7516 22.3493 25.3333 17.931 25.3333H15.2643C10.846 25.3333 7.26432 21.7516 7.26432 17.3333V14.6667C7.26432 10.2484 10.846 6.66667 15.2643 6.66667ZM4.59766 14.6667C4.59766 8.77563 9.37329 4 15.2643 4H17.931C23.822 4 28.5977 8.77563 28.5977 14.6667V17.3333C28.5977 23.2244 23.822 28 17.931 28H15.2643C9.37329 28 4.59766 23.2244 4.59766 17.3333V14.6667ZM21.4733 16L13.3955 11.2022V20.7978L21.4733 16Z"
        fill="#fff"
      />
    </svg>
  );
}

type TeamVideoSliderProps = {
  slides?: TeamVideoSlide[];
};

export function TeamVideoSlider({ slides = teamVideoSlides }: TeamVideoSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopSlides = [...slides, ...slides];
  const [slideIndex, setSlideIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [slideWidthPx, setSlideWidthPx] = useState(0);
  const [slideGapPx, setSlideGapPx] = useState(SLIDE_GAP_DESKTOP_PX);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [modalVideoId, setModalVideoId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash.replace("#", "");
    const slide = slides.find((entry) => entry.id === hash);
    return slide?.videoId ?? null;
  });
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openSlideVideo = useCallback((slide: TeamVideoSlide) => {
    if (!slide.videoId) return;
    setModalVideoId(slide.videoId);
    window.history.replaceState(null, "", `#${slide.id}`);
  }, []);

  const closeModal = useCallback(() => {
    setModalVideoId(null);
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}`);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function measure() {
      const listWidth = Math.min(viewport.clientWidth, SLIDER_LIST_MAX_WIDTH_PX);
      const gap =
        typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT_PX
          ? SLIDE_GAP_MOBILE_PX
          : SLIDE_GAP_DESKTOP_PX;
      const slideWidth = Math.min(SLIDE_MAX_WIDTH_PX, listWidth);
      setSlideGapPx(gap);
      setSlideWidthPx(slideWidth);
      setStepPx(slideWidth + gap);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;

    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    const measuredStep = second.offsetLeft - first.offsetLeft;
    if (measuredStep > 0) {
      setStepPx(measuredStep);
    }
  }, [slideWidthPx, slideGapPx]);

  useEffect(() => {
    if (!modalVideoId) return;
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalVideoId, closeModal]);

  useEffect(() => {
    if (isPaused || modalVideoId || slides.length <= 1) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setSlideIndex((current) => current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, modalVideoId, slides.length]);

  useEffect(() => {
    if (slideIndex !== slides.length) return;

    const resetTimer = window.setTimeout(() => {
      setTransitionEnabled(false);
      setSlideIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }, 520);

    return () => window.clearTimeout(resetTimer);
  }, [slideIndex, slides.length]);

  const trackOffsetPx = stepPx * slideIndex;

  return (
    <>
      <div
        className={styles.videoSlider}
        aria-label="Team member videos"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
      >
        <div ref={viewportRef} className={styles.videoSliderViewport}>
          <div
            className={transitionEnabled ? styles.videoSliderTrack : styles.videoSliderTrackInstant}
            style={{ transform: `translate3d(-${trackOffsetPx}px, 0, 0)` }}
          >
            {loopSlides.map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className={styles.videoSlide}
                id={index < slides.length ? slide.id : undefined}
                style={
                  slideWidthPx > 0
                    ? {
                        width: slideWidthPx,
                        flexBasis: slideWidthPx,
                        marginRight: slideGapPx,
                      }
                    : undefined
                }
              >
                <div className={styles.videoSlideFigure}>
                  <div className={styles.videoSlideFigureInner}>
                    <Image src={slide.thumbnailSrc} alt="" width={518} height={450} />
                    <div className={styles.modalPlay}>
                      <button
                        type="button"
                        className={styles.modalPlayButton}
                        aria-label={`Play video: ${slide.title}`}
                        disabled={!slide.videoId}
                        onClick={() => openSlideVideo(slide)}
                      >
                        <PlayIcon />
                      </button>
                    </div>
                  </div>
                </div>
                <article>
                  <div className={styles.h4}>{slide.title}</div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalVideoId ? (
        <div
          className={styles.videoModalOverlay}
          role="presentation"
          onClick={closeModal}
        >
          <div
            className={styles.videoModal}
            role="dialog"
            aria-modal="true"
            aria-label="Team video"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.videoModalClose}
              aria-label="Close video"
              onClick={closeModal}
            >
              ×
            </button>
            <div className={styles.videoModalPlayer}>
              <iframe
                src={brightcoveEmbedUrl(modalVideoId)}
                title="Brightcove video player"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TeamFeaturedVideo({ videoId = DEFAULT_VIDEO_ID }: { videoId?: string }) {
  return (
    <section className={styles.mainVideo} aria-label="Featured team video">
      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          <iframe
            src={brightcoveEmbedUrl(videoId)}
            title="Brightcove video player"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
