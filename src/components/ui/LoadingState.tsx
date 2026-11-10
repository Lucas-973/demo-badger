import React, { useEffect, useRef, useState } from 'react';
import { CustomScrollArea } from './CustomScrollArea';
import { ROOMS_RACK_GRID } from './roomsLayout';

type SkeletonVariant = 'pulse' | 'board' | 'tape' | 'rooms' | 'ledger' | 'settings' | 'workspace';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function skeletonVariant(moduleId: string): SkeletonVariant {
  switch (moduleId) {
    case 'overview':
      return 'pulse';
    case 'tape-chart':
      return 'tape';
    case 'rooms':
      return 'rooms';
    case 'front-desk':
      return 'board';
    case 'reservations':
    case 'billing':
      return 'ledger';
    case 'settings':
      return 'settings';
    default:
      return 'workspace';
  }
}

/**
 * True once `viewKey` has settled. Sub-navigation inside the same module
 * settles faster than a module or suite change. Reduced motion skips the wait.
 */
export function useViewReady(viewKey: string) {
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const meta = useRef({ key: viewKey, delay: 640 });

  if (meta.current.key !== viewKey) {
    const [prevSuite, prevModule] = meta.current.key.split('::');
    const [suite, moduleId] = viewKey.split('::');
    meta.current = {
      key: viewKey,
      delay: prevSuite === suite && prevModule === moduleId ? 400 : 640,
    };
  }

  useEffect(() => {
    if (prefersReducedMotion()) {
      setSettledKey(viewKey);
      return;
    }
    const timer = window.setTimeout(() => setSettledKey(viewKey), meta.current.delay);
    return () => window.clearTimeout(timer);
  }, [viewKey]);

  if (prefersReducedMotion()) return true;
  return settledKey === viewKey;
}

/**
 * Keeps an overlay mounted through its exit transition.
 * `shown` flips on the frame after mount so CSS can interpolate from the closed styles.
 */
export function useOverlayPresence(isOpen: boolean, exitMs = 220) {
  const [presence, setPresence] = useState<'closed' | 'enter' | 'open' | 'exit'>(
    isOpen ? 'enter' : 'closed'
  );

  if (isOpen && (presence === 'closed' || presence === 'exit')) {
    setPresence('enter');
  } else if (!isOpen && (presence === 'open' || presence === 'enter')) {
    setPresence('exit');
  }

  useEffect(() => {
    if (presence === 'enter') {
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPresence('open'));
      });
      return () => {
        cancelAnimationFrame(first);
        if (second) cancelAnimationFrame(second);
      };
    }
    if (presence === 'exit') {
      const timer = window.setTimeout(() => setPresence('closed'), exitMs);
      return () => window.clearTimeout(timer);
    }
  }, [presence, exitMs]);

  return {
    mounted: presence !== 'closed',
    shown: presence === 'open',
  };
}

/**
 * Simulated fetch for overlays. Stays "ready" while the overlay is closing
 * so the exit animation does not flash back to a skeleton.
 */
export function useOverlayContentReady(isOpen: boolean, delayMs: number) {
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [token, setToken] = useState(isOpen ? 1 : 0);
  const [readyToken, setReadyToken] = useState(0);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) setToken((current) => current + 1);
  }

  useEffect(() => {
    if (!isOpen || token === 0) return;
    if (prefersReducedMotion()) {
      setReadyToken(token);
      return;
    }
    const timer = window.setTimeout(() => setReadyToken(token), delayMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, token, delayMs]);

  const ready = !isOpen || (prefersReducedMotion() && isOpen) || (readyToken === token && token !== 0);
  return { ready, cycle: token };
}

function useRevealCover(resetKey: string, ready: boolean) {
  const [key, setKey] = useState(resetKey);
  const [cover, setCover] = useState(true);

  if (key !== resetKey) {
    setKey(resetKey);
    setCover(true);
  }

  useEffect(() => {
    if (!ready) return;
    const delay = prefersReducedMotion() ? 0 : 360;
    const timer = window.setTimeout(() => setCover(false), delay);
    return () => window.clearTimeout(timer);
  }, [ready, resetKey]);

  if (prefersReducedMotion()) return false;
  return cover;
}

export function LoadingRail({
  label,
  tone = 'brand',
}: {
  label: string;
  tone?: 'brand' | 'inverse';
}) {
  return (
    <div
      className={`badger-progress ${tone === 'inverse' ? 'badger-progress--inverse' : ''}`}
      role="progressbar"
      aria-label={label}
    >
      <span />
    </div>
  );
}

function Bone({
  className = '',
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`badger-bone rounded-md ${className}`}
      style={{ animationDelay: `${delay}ms`, ...style }}
    />
  );
}

function PageSkeleton({ variant }: { variant: SkeletonVariant }) {
  if (variant === 'tape') {
    const bars = [34, 58, 22, 66, 40, 18, 52, 30, 61, 26, 44, 36];
    return (
      <div className="h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Bone className="h-6 w-52" />
          <div className="flex gap-2">
            <Bone className="h-8 w-24" />
            <Bone className="h-8 w-28" />
          </div>
        </div>
        <div className="flex-1 min-h-0 rounded-lg border border-slate-200/80 overflow-hidden">
          <div className="grid grid-cols-[148px_1fr] border-b border-slate-100 bg-slate-50/60">
            <Bone className="h-4 m-3" />
            <div className="grid grid-cols-7 gap-2 p-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <Bone key={index} className="h-7" delay={index * 40} />
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {bars.map((width, index) => (
              <div key={index} className="grid grid-cols-[148px_1fr] items-center h-11">
                <Bone className="h-3.5 mx-3" delay={index * 30} />
                <div className="pr-3">
                  <Bone
                    className="h-5 rounded-full"
                    delay={index * 30}
                    style={{ width: `${width}%`, marginLeft: `${(index * 11) % 36}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div className="space-y-2 flex-1">
          <Bone className="h-3 w-28" />
          <Bone className="h-6 w-72 max-w-full" />
          <Bone className="h-3 w-56 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-8 w-28" />
          <Bone className="h-8 w-36" />
        </div>
      </div>
      <VariantBody variant={variant} />
    </div>
  );
}

function VariantBody({ variant }: { variant: SkeletonVariant }) {
  if (variant === 'pulse' || variant === 'workspace') {
    const cards = variant === 'pulse' ? 4 : 3;
    return (
      <div className="space-y-4">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cards === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200/80 p-4 space-y-3">
              <Bone className="h-3 w-24" delay={index * 50} />
              <Bone className="h-7 w-16" delay={index * 50} />
              <Bone className="h-2.5 w-28" delay={index * 50} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-slate-200/80 p-4 space-y-3">
            <Bone className="h-4 w-40" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Bone key={index} className="h-9 w-full" delay={index * 40} />
            ))}
          </div>
          <div className="lg:col-span-2 rounded-xl border border-slate-200/80 p-4 space-y-3">
            <Bone className="h-4 w-32" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Bone key={index} className="h-12 w-full" delay={index * 45} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'board') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-4">
        <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Bone className="h-9 w-9 rounded-full shrink-0" delay={index * 40} />
              <div className="flex-1 space-y-2">
                <Bone className="h-3.5 w-40" delay={index * 40} />
                <Bone className="h-2.5 w-28" delay={index * 40} />
              </div>
              <Bone className="h-5 w-16 rounded-full" delay={index * 40} />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200/80 p-4 space-y-3">
          <Bone className="h-5 w-40" />
          <Bone className="h-3 w-28" />
          <Bone className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Bone className="h-9" />
            <Bone className="h-9" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'rooms') {
    return (
      <div aria-hidden="true" className="flex h-full min-h-0 flex-col gap-2.5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <Bone className="h-7 w-16" />
          <div className="flex flex-wrap items-center gap-2">
            <Bone className="h-8 w-44 rounded sm:w-52" />
            <Bone className="h-8 w-20 rounded sm:w-40" />
            <Bone className="h-8 w-24 rounded" />
            <Bone className="h-8 w-20 rounded" />
          </div>
        </div>
        <div className="-mx-5 min-h-0 flex-1 overflow-hidden px-5 pb-3 pt-1 lg:-mx-7 lg:px-7">
          <div className={ROOMS_RACK_GRID}>
            {Array.from({ length: 120 }).map((_, index) => (
              <div key={index} className="flex min-w-0 flex-col items-center">
                <div className="p-1"><Bone className="h-11 w-7 rounded-t-sm rounded-b-none" delay={(index % 12) * 20} /></div>
                <div className="mt-0.5 flex min-h-8 justify-center pt-0.5">
                  <Bone className="h-3 w-7" delay={(index % 12) * 20} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="-mx-5 shrink-0 overflow-hidden border-t border-slate-200 px-5 py-2.5 lg:-mx-7 lg:px-7">
          <div className="flex min-w-max items-center justify-end divide-x divide-slate-200">
            {[1, 6, 3].map((count, group) => (
              <div key={group} className="flex shrink-0 items-center gap-4 px-5 first:pl-0 last:pr-0">
                {Array.from({ length: count }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2 py-1">
                    <Bone className="h-3.5 w-3.5" />
                    <Bone className="h-3 w-12" />
                    <Bone className="h-3 w-5" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className="max-w-4xl space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200/80 p-5 space-y-3">
            <Bone className="h-4 w-44" delay={index * 50} />
            <Bone className="h-3 w-72 max-w-full" delay={index * 50} />
            <Bone className="h-9 w-full max-w-lg" delay={index * 50} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="grid grid-cols-5 gap-3 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <Bone key={index} className="h-3" delay={index * 30} />
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, row) => (
        <div key={row} className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
          {Array.from({ length: 5 }).map((_, column) => (
            <Bone key={column} className="h-3.5" delay={row * 25} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingCrossfade({
  ready,
  resetKey,
  fallback,
  children,
  className = '',
}: {
  ready: boolean;
  resetKey: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const cover = useRevealCover(resetKey, ready);

  return (
    <div className={`relative ${className}`}>
      <div className={ready ? 'badger-content-in' : 'invisible'} aria-hidden={!ready}>
        {children}
      </div>
      {cover && (
        <div
          className={`absolute inset-0 z-10 bg-white transition-opacity duration-300 ease-out ${
            ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}

interface WorkspaceCanvasProps {
  viewKey: string;
  moduleId: string;
  title: string;
  layout: 'scroll' | 'fill';
  children: React.ReactNode;
}

export function WorkspaceCanvas({
  viewKey,
  moduleId,
  title,
  layout,
  children,
}: WorkspaceCanvasProps) {
  const ready = useViewReady(viewKey);
  const cover = useRevealCover(viewKey, ready);
  const variant = skeletonVariant(moduleId);

  return (
    <div className="relative flex-1 min-w-0 min-h-0 h-full bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col">
      {cover && <LoadingRail label={`Loading ${title}`} />}
      {cover && (
        <div
          className={`absolute inset-0 z-40 bg-white transition-opacity duration-300 ease-out ${
            ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          role="status"
          aria-live="polite"
          aria-busy={!ready}
        >
          <div className={layout === 'fill'
            ? `h-full px-5 pt-3.5 lg:px-7 lg:pt-5 ${moduleId === 'rooms' ? 'pb-0' : 'pb-3.5 lg:pb-5'}`
            : 'h-full p-6 lg:p-8 overflow-hidden'}>
            <PageSkeleton variant={variant} />
          </div>
        </div>
      )}

      {layout === 'fill' ? (
        <div
          className={`flex-1 min-h-0 flex flex-col px-5 pt-3.5 lg:px-7 lg:pt-5 ${
            moduleId === 'rooms' ? 'pb-0' : 'pb-3.5 lg:pb-5'
          } ${
            ready ? 'badger-content-in' : 'invisible'
          }`}
          aria-hidden={!ready}
        >
          {children}
        </div>
      ) : (
        <CustomScrollArea
          className="flex-1 min-w-0 min-h-0 h-full"
          viewportClassName="p-6 lg:p-8"
          gutter="right"
          showTrackWhenIdle={true}
        >
          <div className={ready ? 'badger-content-in' : 'invisible'} aria-hidden={!ready}>
            {children}
          </div>
        </CustomScrollArea>
      )}
    </div>
  );
}

export function BookingFormSkeleton() {
  return (
    <div className="p-5 space-y-4" role="status" aria-live="polite">
      <div className="space-y-1.5">
        <Bone className="h-3 w-32" />
        <Bone className="h-9 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Bone className="h-3 w-20" />
          <Bone className="h-9 w-full" />
        </div>
        <div className="space-y-1.5">
          <Bone className="h-3 w-16" />
          <Bone className="h-9 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-full" />
        </div>
        <div className="space-y-1.5">
          <Bone className="h-3 w-28" />
          <Bone className="h-9 w-full" />
        </div>
      </div>
      <Bone className="h-12 w-full rounded-lg" />
      <div className="flex justify-end gap-2 pt-1">
        <Bone className="h-8 w-20" />
        <Bone className="h-8 w-36" />
      </div>
    </div>
  );
}

export function CopilotThreadSkeleton() {
  return (
    <div className="p-3.5 space-y-3" role="status" aria-live="polite">
      <Bone className="h-24 w-full rounded-lg" />
      <Bone className="h-14 w-4/5 rounded-lg" delay={60} />
      <Bone className="h-16 w-full rounded-lg" delay={120} />
    </div>
  );
}

export function LauncherSkeleton() {
  return (
    <div className="p-5" role="status" aria-live="polite">
      <Bone className="h-9 w-full rounded-md" />
      <div className="mt-5 grid grid-cols-5 gap-y-4 gap-x-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2 py-1">
            <Bone className="h-10 w-10 rounded-lg" delay={index * 35} />
            <Bone className="h-2 w-12" delay={index * 35} />
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Bone className="h-12 w-12 rounded-lg" delay={index * 40} />
            <Bone className="h-2 w-14" delay={index * 40} />
          </div>
        ))}
      </div>
    </div>
  );
}
