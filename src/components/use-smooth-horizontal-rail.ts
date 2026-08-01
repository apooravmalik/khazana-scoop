"use client";

import * as React from "react";

type UseSmoothHorizontalRailOptions = {
  autoAdvanceMs?: number;
  itemSelector: string;
  loopAtHalf?: boolean;
  railId?: string;
};

function getRailOffsetMs(seed: string): number {
  return seed.split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 320;
}

export function useSmoothHorizontalRail({
  autoAdvanceMs,
  itemSelector,
  loopAtHalf = false,
  railId,
}: UseSmoothHorizontalRailOptions): {
  railRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollNext: () => void;
  scrollPrevious: () => void;
  setPaused: (paused: boolean) => void;
} {
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const animationTimeoutRef = React.useRef<number | null>(null);
  const autoAdvanceTimeoutRef = React.useRef<number | null>(null);
  const pageScrollResumeTimeoutRef = React.useRef<number | null>(null);
  const isAnimatingRef = React.useRef(false);
  const isVisibleRef = React.useRef(true);
  const isPageScrollingRef = React.useRef(false);
  const pausedRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const autoAdvanceOffsetMsRef = React.useRef(getRailOffsetMs(railId ?? itemSelector));

  const stopAnimation = React.useCallback((): void => {
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const rail = railRef.current;
    if (rail && isAnimatingRef.current) {
      rail.scrollTo({ left: rail.scrollLeft, behavior: "auto" });
    }

    isAnimatingRef.current = false;
  }, []);

  const clearAutoAdvanceTimer = React.useCallback((): void => {
    if (autoAdvanceTimeoutRef.current) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  const clearPageScrollResumeTimer = React.useCallback((): void => {
    if (pageScrollResumeTimeoutRef.current) {
      window.clearTimeout(pageScrollResumeTimeoutRef.current);
      pageScrollResumeTimeoutRef.current = null;
    }
  }, []);

  const getScrollDistance = React.useCallback((): number => {
    const rail = railRef.current;
    if (!rail) {
      return 0;
    }

    const firstCard = rail.querySelector<HTMLElement>(itemSelector);
    const styles = window.getComputedStyle(rail);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return firstCard ? firstCard.offsetWidth + gap : rail.clientWidth * 0.82;
  }, [itemSelector]);

  const animateTo = React.useCallback(
    (targetLeft: number, afterAnimation?: () => void): void => {
      const rail = railRef.current;
      if (!rail) {
        return;
      }

      stopAnimation();

      if (reducedMotionRef.current) {
        rail.scrollTo({ left: targetLeft, behavior: "auto" });
        afterAnimation?.();
        return;
      }

      isAnimatingRef.current = true;
      rail.scrollTo({ left: targetLeft, behavior: "smooth" });

      animationTimeoutRef.current = window.setTimeout(() => {
        if (railRef.current) {
          railRef.current.scrollTo({ left: targetLeft, behavior: "auto" });
        }

        isAnimatingRef.current = false;
        animationTimeoutRef.current = null;
        afterAnimation?.();
      }, 620);
    },
    [stopAnimation],
  );

  const scrollByDirection = React.useCallback(
    (direction: "previous" | "next"): void => {
      const rail = railRef.current;
      if (!rail) {
        return;
      }

      const distance = getScrollDistance();
      const maxLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const halfScrollWidth = rail.scrollWidth / 2;
      let targetLeft =
        direction === "next"
          ? Math.min(rail.scrollLeft + distance, maxLeft)
          : Math.max(rail.scrollLeft - distance, 0);

      if (loopAtHalf && direction === "next") {
        const resetAfterLoop = targetLeft >= halfScrollWidth - distance / 2;
        animateTo(targetLeft, () => {
          if (resetAfterLoop && railRef.current) {
            railRef.current.scrollLeft = 0;
          }
        });
        return;
      }

      if (loopAtHalf && direction === "previous" && rail.scrollLeft <= 4) {
        rail.scrollLeft = Math.max(0, halfScrollWidth - distance);
        targetLeft = Math.max(0, rail.scrollLeft - distance);
      }

      animateTo(targetLeft);
    },
    [animateTo, getScrollDistance, loopAtHalf],
  );

  const scheduleAutoAdvance = React.useCallback(
    (delayMs: number): void => {
      if (!autoAdvanceMs) {
        return;
      }

      clearAutoAdvanceTimer();

      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        const shouldWait =
          pausedRef.current ||
          isAnimatingRef.current ||
          isPageScrollingRef.current ||
          !isVisibleRef.current ||
          document.hidden;

        if (shouldWait) {
          scheduleAutoAdvance(Math.min(autoAdvanceMs, 720));
          return;
        }

        scrollByDirection("next");
        scheduleAutoAdvance(autoAdvanceMs + autoAdvanceOffsetMsRef.current);
      }, delayMs);
    },
    [autoAdvanceMs, clearAutoAdvanceTimer, scrollByDirection],
  );

  React.useEffect(() => {
    if (!autoAdvanceMs) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = (): void => {
      reducedMotionRef.current = reducedMotion.matches;
    };

    syncReducedMotion();
    if (reducedMotionRef.current) {
      return;
    }

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", syncReducedMotion);
    } else {
      reducedMotion.addListener(syncReducedMotion);
    }

    scheduleAutoAdvance(autoAdvanceMs + autoAdvanceOffsetMsRef.current);

    return () => {
      clearAutoAdvanceTimer();

      if (typeof reducedMotion.removeEventListener === "function") {
        reducedMotion.removeEventListener("change", syncReducedMotion);
      } else {
        reducedMotion.removeListener(syncReducedMotion);
      }
    };
  }, [autoAdvanceMs, clearAutoAdvanceTimer, scheduleAutoAdvance]);

  React.useEffect(() => {
    if (!autoAdvanceMs) {
      return;
    }

    const onWindowScroll = (): void => {
      isPageScrollingRef.current = true;
      clearPageScrollResumeTimer();

      pageScrollResumeTimeoutRef.current = window.setTimeout(() => {
        isPageScrollingRef.current = false;
        pageScrollResumeTimeoutRef.current = null;
      }, 180);
    };

    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      clearPageScrollResumeTimer();
      isPageScrollingRef.current = false;
    };
  }, [autoAdvanceMs, clearPageScrollResumeTimer]);

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(rail);

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(
    () => () => {
      clearAutoAdvanceTimer();
      clearPageScrollResumeTimer();
      stopAnimation();
    },
    [clearAutoAdvanceTimer, clearPageScrollResumeTimer, stopAnimation],
  );

  return {
    railRef,
    scrollNext: () => scrollByDirection("next"),
    scrollPrevious: () => scrollByDirection("previous"),
    setPaused: (paused: boolean) => {
      pausedRef.current = paused;
    },
  };
}
