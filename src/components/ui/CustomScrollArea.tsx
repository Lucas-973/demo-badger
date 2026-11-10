import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface CustomScrollAreaProps {
  children: ReactNode;
  /** Classes applied to the outer container (e.g., flex-1, rounded-xl, border, bg-white) */
  className?: string;
  /** Classes applied to the inner content wrapper (e.g., p-6, space-y-4) */
  viewportClassName?: string;
  /** Which axis/axes to enable custom scrolling for */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /**
   * Gutter mode:
   * - 'right': reserves dedicated scrollbar gutter space on the right (and bottom if horizontal)
   * - 'both-edges': reserves symmetric gutter space on both left and right (ideal for narrow centered rails)
   * - 'overlay': scrollbar floats in an inset gutter without shrinking content width
   */
  gutter?: 'right' | 'both-edges' | 'overlay';
  /** Kept for backwards compatibility; scrollbar only renders when content actually overflows */
  showTrackWhenIdle?: boolean;
  /** Optional inline max-height for dropdown/popover menus */
  maxHeight?: string | number;
  /** Offset in pixels from the top of the container for the vertical scrollbar (e.g., to sit below a sticky table header) */
  verticalTopOffset?: number;
}

interface ScrollMetrics {
  scrollHeight: number;
  clientHeight: number;
  scrollWidth: number;
  clientWidth: number;
}

const MIN_THUMB_SIZE = 34;

export const CustomScrollArea: React.FC<CustomScrollAreaProps> = ({
  children,
  className = '',
  viewportClassName = '',
  orientation = 'vertical',
  gutter = 'right',
  showTrackWhenIdle = true,
  maxHeight,
  verticalTopOffset = 8,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const vTrackRef = useRef<HTMLDivElement>(null);
  const hTrackRef = useRef<HTMLDivElement>(null);
  const vThumbRef = useRef<HTMLDivElement>(null);
  const hThumbRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollHeight: 0,
    clientHeight: 0,
    scrollWidth: 0,
    clientWidth: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isTrackHoveredV, setIsTrackHoveredV] = useState(false);
  const [isTrackHoveredH, setIsTrackHoveredH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const [isDraggingH, setIsDraggingH] = useState(false);

  const dragStateRef = useRef<{
    startPointer: number;
    startScroll: number;
    thumbSize: number;
  }>({ startPointer: 0, startScroll: 0, thumbSize: MIN_THUMB_SIZE });

  const syncThumbPositions = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    if (vThumbRef.current) {
      const vTrackH = Math.max(0, el.clientHeight - (verticalTopOffset + 8));
      const rawThumbH = (el.clientHeight / Math.max(1, el.scrollHeight)) * vTrackH;
      const thumbH = Math.max(MIN_THUMB_SIZE, Math.min(vTrackH, rawThumbH));
      const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
      const maxThumb = Math.max(0, vTrackH - thumbH);
      const top = Math.min(maxThumb, Math.max(0, (el.scrollTop / maxScroll) * maxThumb));
      vThumbRef.current.style.transform = `translate3d(0, ${top}px, 0)`;
    }

    if (hThumbRef.current) {
      const hTrackW = Math.max(0, el.clientWidth - 16);
      const rawThumbW = (el.clientWidth / Math.max(1, el.scrollWidth)) * hTrackW;
      const thumbW = Math.max(MIN_THUMB_SIZE, Math.min(hTrackW, rawThumbW));
      const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
      const maxThumb = Math.max(0, hTrackW - thumbW);
      const left = Math.min(maxThumb, Math.max(0, (el.scrollLeft / maxScroll) * maxThumb));
      hThumbRef.current.style.transform = `translate3d(${left}px, 0, 0)`;
    }
  }, [verticalTopOffset]);

  const updateMetrics = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    syncThumbPositions();
    const next: ScrollMetrics = {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    };
    setMetrics((prev) => {
      if (
        prev.scrollHeight === next.scrollHeight &&
        prev.clientHeight === next.clientHeight &&
        prev.scrollWidth === next.scrollWidth &&
        prev.clientWidth === next.clientWidth
      ) {
        return prev;
      }
      return next;
    });
  }, [syncThumbPositions]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport) return;

    updateMetrics();

    const ro = new ResizeObserver(() => {
      updateMetrics();
    });
    ro.observe(viewport);
    if (content) {
      ro.observe(content);
    }

    window.addEventListener('resize', updateMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, [updateMetrics, children]);

  useEffect(() => {
    syncThumbPositions();
  }, [metrics, syncThumbPositions]);

  const enableV = orientation === 'vertical' || orientation === 'both';
  const enableH = orientation === 'horizontal' || orientation === 'both';

  // Strictly check if content actually overflows before showing any scrollbar
  const canScrollV =
    enableV && metrics.scrollHeight > metrics.clientHeight + 2;
  const canScrollH =
    enableH && metrics.scrollWidth > metrics.clientWidth + 2;

  // Vertical thumb geometry (inset by verticalTopOffset at top + 8px at bottom so rounded corners stay untouched)
  const vTrackHeight = Math.max(0, metrics.clientHeight - (verticalTopOffset + 8));
  const rawThumbHeight = canScrollV
    ? (metrics.clientHeight / metrics.scrollHeight) * vTrackHeight
    : 0;
  const vThumbHeight = canScrollV
    ? Math.max(MIN_THUMB_SIZE, Math.min(vTrackHeight, rawThumbHeight))
    : 0;

  // Horizontal thumb geometry (inset by 16px total: 8px left + 8px right)
  const hTrackWidth = Math.max(0, metrics.clientWidth - 16);
  const rawThumbWidth = canScrollH
    ? (metrics.clientWidth / metrics.scrollWidth) * hTrackWidth
    : 0;
  const hThumbWidth = canScrollH
    ? Math.max(MIN_THUMB_SIZE, Math.min(hTrackWidth, rawThumbWidth))
    : 0;

  // Vertical Thumb Pointer Drag
  const handleVThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const viewport = viewportRef.current;
    if (!viewport || !canScrollV) return;

    setIsDraggingV(true);
    dragStateRef.current = {
      startPointer: e.clientY,
      startScroll: viewport.scrollTop,
      thumbSize: vThumbHeight,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - dragStateRef.current.startPointer;
      const trackEl = vTrackRef.current;
      const currentTrackHeight = trackEl ? trackEl.clientHeight : vTrackHeight;
      const currentMaxThumbTop = Math.max(
        1,
        currentTrackHeight - dragStateRef.current.thumbSize
      );
      const currentMaxScrollTop = Math.max(
        1,
        viewport.scrollHeight - viewport.clientHeight
      );
      const scrollDelta = (deltaY / currentMaxThumbTop) * currentMaxScrollTop;
      viewport.scrollTop = dragStateRef.current.startScroll + scrollDelta;
    };

    const handlePointerUp = () => {
      setIsDraggingV(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.userSelect = '';
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Vertical Gutter Track Click-to-Jump
  const handleVTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const viewport = viewportRef.current;
    const track = vTrackRef.current;
    if (!viewport || !track || !canScrollV) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const targetThumbTop = clickY - vThumbHeight / 2;
    const ratio = Math.max(
      0,
      Math.min(1, targetThumbTop / Math.max(1, rect.height - vThumbHeight))
    );
    viewport.scrollTo({
      top: ratio * (viewport.scrollHeight - viewport.clientHeight),
      behavior: 'smooth',
    });
  };

  // Horizontal Thumb Pointer Drag
  const handleHThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const viewport = viewportRef.current;
    if (!viewport || !canScrollH) return;

    setIsDraggingH(true);
    dragStateRef.current = {
      startPointer: e.clientX,
      startScroll: viewport.scrollLeft,
      thumbSize: hThumbWidth,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStateRef.current.startPointer;
      const trackEl = hTrackRef.current;
      const currentTrackWidth = trackEl ? trackEl.clientWidth : hTrackWidth;
      const currentMaxThumbLeft = Math.max(
        1,
        currentTrackWidth - dragStateRef.current.thumbSize
      );
      const currentMaxScrollLeft = Math.max(
        1,
        viewport.scrollWidth - viewport.clientWidth
      );
      const scrollDelta = (deltaX / currentMaxThumbLeft) * currentMaxScrollLeft;
      viewport.scrollLeft = dragStateRef.current.startScroll + scrollDelta;
    };

    const handlePointerUp = () => {
      setIsDraggingH(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.userSelect = '';
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Horizontal Gutter Track Click-to-Jump
  const handleHTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const viewport = viewportRef.current;
    const track = hTrackRef.current;
    if (!viewport || !track || !canScrollH) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetThumbLeft = clickX - hThumbWidth / 2;
    const ratio = Math.max(
      0,
      Math.min(1, targetThumbLeft / Math.max(1, rect.width - hThumbWidth))
    );
    viewport.scrollTo({
      left: ratio * (viewport.scrollWidth - viewport.clientWidth),
      behavior: 'smooth',
    });
  };

  // Overflow classes on the native scroll container (with native scrollbars 100% hidden)
  const overflowClass =
    orientation === 'both'
      ? 'overflow-auto'
      : orientation === 'horizontal'
      ? 'overflow-x-auto overflow-y-hidden'
      : 'overflow-y-auto overflow-x-hidden';

  // Dedicated Gutter spacing reserved so content never shifts or collides when scrollbar appears
  const gutterSpacingClass =
    gutter === 'both-edges'
      ? 'px-[9px]'
      : gutter === 'right'
      ? `${enableV ? 'pr-[16px]' : ''} ${enableH && canScrollH ? 'pb-[16px]' : ''}`
      : '';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={maxHeight ? { maxHeight } : undefined}
      className={`relative overflow-hidden flex flex-col ${className}`}
    >
      {/* Scrollable Viewport (Native scrollbar hidden via .no-native-scrollbar so rounded corners stay intact) */}
      <div
        ref={viewportRef}
        onScroll={syncThumbPositions}
        style={maxHeight ? { maxHeight } : undefined}
        className={`no-native-scrollbar flex-1 min-h-0 min-w-0 w-full h-full ${overflowClass} ${gutterSpacingClass}`}
      >
        <div ref={contentRef} className={viewportClassName}>
          {children}
        </div>
      </div>

      {/* Custom Vertical Scrollbar — rendered ONLY when vertical content overflows */}
      {canScrollV && (
        <div
          aria-hidden="true"
          onMouseEnter={() => setIsTrackHoveredV(true)}
          onMouseLeave={() => setIsTrackHoveredV(false)}
          style={{ top: `${verticalTopOffset}px` }}
          className={`absolute bottom-2 right-1 z-30 w-[12px] flex items-center justify-center select-none transition-opacity duration-200 ${
            !showTrackWhenIdle && !isHovered && !isDraggingV && !isTrackHoveredV
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          }`}
        >
          {/* Dedicated Recessed Pill Gutter Channel */}
          <div
            ref={vTrackRef}
            onPointerDown={handleVTrackPointerDown}
            className={`relative h-full rounded-full p-[1.5px] transition-all duration-150 ${
              isTrackHoveredV || isDraggingV
                ? 'w-[11px] bg-slate-200/90 ring-1 ring-inset ring-slate-300/90 shadow-inner cursor-pointer'
                : gutter === 'overlay'
                ? 'w-[8px] bg-slate-900/10 ring-1 ring-inset ring-white/40'
                : 'w-[8px] bg-slate-900/[0.045] ring-1 ring-inset ring-slate-900/[0.06]'
            }`}
          >
            {/* Interactive Sculpted Pill Thumb */}
            <div
              ref={vThumbRef}
              onPointerDown={handleVThumbPointerDown}
              style={{
                height: `${vThumbHeight}px`,
              }}
              className={`w-full rounded-full cursor-grab active:cursor-grabbing will-change-transform transition-colors duration-150 flex items-center justify-center ${
                isDraggingV
                  ? 'bg-[#005FB8] shadow-[0_1px_6px_rgba(0,95,184,0.45)]'
                  : isTrackHoveredV
                  ? 'bg-[#005FB8] shadow-[0_1px_4px_rgba(0,95,184,0.3)]'
                  : isHovered
                  ? gutter === 'overlay'
                    ? 'bg-slate-600/80 shadow-sm'
                    : 'bg-slate-400/95'
                  : 'bg-slate-400/70'
              }`}
            >
              {/* Tactile grip indicator when hovered or dragging */}
              {(isTrackHoveredV || isDraggingV) && vThumbHeight >= 38 && (
                <div className="flex flex-col gap-[2px] opacity-80 pointer-events-none">
                  <span className="w-1 h-[1.5px] rounded-full bg-white" />
                  <span className="w-1 h-[1.5px] rounded-full bg-white" />
                  <span className="w-1 h-[1.5px] rounded-full bg-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Horizontal Scrollbar — rendered ONLY when horizontal content overflows */}
      {canScrollH && (
        <div
          aria-hidden="true"
          onMouseEnter={() => setIsTrackHoveredH(true)}
          onMouseLeave={() => setIsTrackHoveredH(false)}
          className={`absolute left-2 right-2 bottom-1 z-30 h-[12px] flex items-center justify-center select-none transition-opacity duration-200 ${
            !showTrackWhenIdle && !isHovered && !isDraggingH && !isTrackHoveredH
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          }`}
        >
          <div
            ref={hTrackRef}
            onPointerDown={handleHTrackPointerDown}
            className={`relative w-full rounded-full p-[1.5px] transition-all duration-150 ${
              isTrackHoveredH || isDraggingH
                ? 'h-[11px] bg-slate-200/90 ring-1 ring-inset ring-slate-300/90 shadow-inner cursor-pointer'
                : gutter === 'overlay'
                ? 'h-[8px] bg-slate-900/10 ring-1 ring-inset ring-white/40'
                : 'h-[8px] bg-slate-900/[0.045] ring-1 ring-inset ring-slate-900/[0.06]'
            }`}
          >
            <div
              ref={hThumbRef}
              onPointerDown={handleHThumbPointerDown}
              style={{
                width: `${hThumbWidth}px`,
              }}
              className={`h-full rounded-full cursor-grab active:cursor-grabbing will-change-transform transition-colors duration-150 flex items-center justify-center ${
                isDraggingH
                  ? 'bg-[#005FB8] shadow-[0_1px_6px_rgba(0,95,184,0.45)]'
                  : isTrackHoveredH
                  ? 'bg-[#005FB8] shadow-[0_1px_4px_rgba(0,95,184,0.3)]'
                  : isHovered
                  ? gutter === 'overlay'
                    ? 'bg-slate-600/80 shadow-sm'
                    : 'bg-slate-400/95'
                  : 'bg-slate-400/70'
              }`}
            >
              {(isTrackHoveredH || isDraggingH) && hThumbWidth >= 38 && (
                <div className="flex gap-[2px] opacity-80 pointer-events-none">
                  <span className="h-1 w-[1.5px] rounded-full bg-white" />
                  <span className="h-1 w-[1.5px] rounded-full bg-white" />
                  <span className="h-1 w-[1.5px] rounded-full bg-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
