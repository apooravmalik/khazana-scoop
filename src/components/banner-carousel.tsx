"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import styles from "./banner-carousel.module.css";

export type BannerCarouselItem = {
  id: string;
  src: string;
  alt: string;
  href: string;
  actionLabel: string;
};

type BannerCarouselProps = {
  items: BannerCarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
};

const DRAG_BUFFER = 45;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 34 } as const;

export function BannerCarousel({
  items,
  baseWidth = 1600,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: BannerCarouselProps): React.ReactElement | null {
  const shouldReduceMotion = useReducedMotion();
  const renderedItems = useMemo(() => {
    if (!loop || items.length < 2) return items;
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);
  const startPosition = loop && items.length > 1 ? 1 : 0;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(startPosition);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(() => setViewportWidth(container.clientWidth));
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(container);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!autoplay || shouldReduceMotion || renderedItems.length <= 1) return;
    if (pauseOnHover && (isHovered || isFocusedWithin)) return;

    const timer = window.setInterval(() => {
      setPosition((current) => Math.min(current + 1, renderedItems.length - 1));
    }, autoplayDelay);

    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, isFocusedWithin, isHovered, pauseOnHover, renderedItems.length, shouldReduceMotion]);

  if (items.length === 0) return null;

  const activeIndex = loop
    ? (position - 1 + items.length) % items.length
    : Math.min(position, items.length - 1);

  const goTo = (index: number): void => {
    setPosition(loop && items.length > 1 ? index + 1 : index);
  };

  const goPrevious = (): void => {
    setPosition((current) => Math.max(current - 1, 0));
  };

  const goNext = (): void => {
    setPosition((current) => Math.min(current + 1, renderedItems.length - 1));
  };

  const handleAnimationComplete = (): void => {
    if (!loop || items.length < 2) return;

    if (position === renderedItems.length - 1) {
      setIsJumping(true);
      setPosition(1);
      window.requestAnimationFrame(() => setIsJumping(false));
    } else if (position === 0) {
      setIsJumping(true);
      setPosition(items.length);
      window.requestAnimationFrame(() => setIsJumping(false));
    }
  };

  return (
    <section className={styles.section} aria-label="Featured Khazana Scoop banners">
      <div
        aria-roledescription="carousel"
        className={`${styles.carousel} ${round ? styles.round : ""}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusedWithin(false);
        }}
        onFocus={() => setIsFocusedWithin(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={containerRef}
        role="region"
        style={{ maxWidth: `${baseWidth}px` }}
      >
        <motion.div
          animate={{ x: -position * viewportWidth }}
          className={styles.track}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onAnimationComplete={handleAnimationComplete}
          onDragEnd={(_, info) => {
            if (info.offset.x < -DRAG_BUFFER || info.velocity.x < -VELOCITY_THRESHOLD) goNext();
            if (info.offset.x > DRAG_BUFFER || info.velocity.x > VELOCITY_THRESHOLD) goPrevious();
          }}
          transition={isJumping || shouldReduceMotion ? { duration: 0 } : SPRING_OPTIONS}
        >
          {renderedItems.map((item, renderIndex) => (
            <article
              aria-hidden={renderIndex !== position}
              aria-label={`Slide ${activeIndex + 1} of ${items.length}`}
              aria-roledescription="slide"
              className={styles.slide}
              key={`${item.id}-${renderIndex}`}
            >
              <Link
                aria-label={item.actionLabel}
                className={styles.slideLink}
                href={item.href}
                tabIndex={renderIndex === position ? 0 : -1}
              >
                <Image
                  alt={item.alt}
                  className={styles.image}
                  fill
                  priority={renderIndex === startPosition}
                  sizes="(min-width: 1600px) 1600px, 100vw"
                  src={item.src}
                />
              </Link>
            </article>
          ))}
        </motion.div>

        {items.length > 1 ? (
          <>
            <button aria-label="Show previous banner" className={`${styles.arrow} ${styles.previous}`} onClick={goPrevious} type="button">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button aria-label="Show next banner" className={`${styles.arrow} ${styles.next}`} onClick={goNext} type="button">
              <ChevronRight aria-hidden="true" />
            </button>
            <div className={styles.indicators} role="group" aria-label="Choose a banner">
              {items.map((item, index) => (
                <button
                  aria-current={activeIndex === index ? "true" : undefined}
                  aria-label={`Show banner ${index + 1}`}
                  className={`${styles.indicator} ${activeIndex === index ? styles.indicatorActive : ""}`}
                  key={item.id}
                  onClick={() => goTo(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

const HOME_BANNERS: BannerCarouselItem[] = [
  {
    id: "every-box-magic",
    src: "/banners/banner1-7.webp",
    alt: "Every Box Holds a Little Magic - adorable gifts, scrunchies, stationery and delightful surprises",
    href: "/products",
    actionLabel: "Shop all products from the Every Box Holds a Little Magic banner",
  },
  {
    id: "happy-place",
    src: "/banners/banner1-8.webp",
    alt: "You Just Found Your Happy Place - gifts, scrunchies, stationery and delightful surprises",
    href: "/products",
    actionLabel: "Shop all products from the Happy Place banner",
  },
  {
    id: "welcome-to-khazana-scoop",
    src: "/banners/banner1-2.webp",
    alt: "Welcome to Khazana Scoop - every scoop is packed with adorable treasures waiting to surprise you",
    href: "/mystery-scoops",
    actionLabel: "Start scooping from the Welcome to Khazana Scoop banner",
  },
  {
    id: "we-have-arrived",
    src: "/banners/banner1-1.webp",
    alt: "We Have Arrived - India's cutest destination for mystery gifts, plushies and happy surprises",
    href: "/products",
    actionLabel: "Explore Khazana Scoop products from the We Have Arrived banner",
  },
];

export function HomeBannerCarousel(): React.ReactElement {
  return (
    <BannerCarousel
      autoplay
      autoplayDelay={3000}
      baseWidth={1600}
      items={HOME_BANNERS}
      loop
      pauseOnHover
      round={false}
    />
  );
}
