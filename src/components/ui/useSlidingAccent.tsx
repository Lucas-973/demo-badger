import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface SlidingAccentBox {
  top: number;
  height: number;
  visible: boolean;
}

interface SlidingAccentMode {
  /** Trim this many pixels from the top and bottom of the active item. */
  insetY?: number;
  /** Fixed pill height, vertically centered on the active item. */
  fixedHeight?: number;
}

/**
 * Tracks one active item and returns a box for a single accent element.
 * The element stays mounted, so CSS can glide it from the previous item.
 */
export function useSlidingAccent(
  activeKey: string,
  layoutKey: string,
  mode: SlidingAccentMode = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const refCallbacks = useRef<Record<string, (node: HTMLElement | null) => void>>({});
  const [box, setBox] = useState<SlidingAccentBox | null>(null);

  const setItemRef = useCallback((key: string) => {
    let callback = refCallbacks.current[key];
    if (!callback) {
      callback = (node: HTMLElement | null) => {
        if (node) itemRefs.current[key] = node;
        else delete itemRefs.current[key];
      };
      refCallbacks.current[key] = callback;
    }
    return callback;
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const insetY = mode.insetY ?? 0;
    const fixedHeight = mode.fixedHeight;

    const measure = () => {
      const el = itemRefs.current[activeKey];

      if (!el || !el.isConnected) {
        setBox((prev) => {
          if (!prev || !prev.visible) return prev;
          return { ...prev, visible: false };
        });
        return;
      }

      const parent = container.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const height =
        fixedHeight != null ? fixedHeight : Math.max(8, rect.height - insetY * 2);
      const top =
        fixedHeight != null
          ? rect.top - parent.top + (rect.height - height) / 2
          : rect.top - parent.top + insetY;

      setBox((prev) => {
        if (
          prev &&
          prev.visible &&
          Math.abs(prev.top - top) < 0.5 &&
          Math.abs(prev.height - height) < 0.5
        ) {
          return prev;
        }
        return { top, height, visible: true };
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    const activeEl = itemRefs.current[activeKey];
    if (activeEl) observer.observe(activeEl);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    window.addEventListener('resize', measure);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeKey, layoutKey, mode.insetY, mode.fixedHeight]);

  return { containerRef, setItemRef, box };
}

export function SlidingAccentMark({
  box,
  className = '',
}: {
  box: SlidingAccentBox | null;
  className?: string;
}) {
  if (!box) return null;

  return (
    <span
      aria-hidden
      className={`rail-accent pointer-events-none absolute top-0 z-10 rounded-full ${className}`}
      style={{
        height: box.height,
        opacity: box.visible ? 1 : 0,
        transform: `translate3d(0, ${box.top}px, 0)`,
      }}
    />
  );
}
