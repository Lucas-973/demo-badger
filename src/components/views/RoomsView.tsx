import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Layers,
  BedDouble,
  Footprints,
  LogIn,
  Brush,
  Wrench,
  History,
  LayoutGrid,
  Grid3X3,
  Users,
  UserRound,
  Baby,
  Filter,
  X,
  Check,
} from 'lucide-react';
import { Reservation, Room, RoomStatus } from '../../types/pms';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import type { ComboboxOption } from '../ui/Combobox';
import { RoomHistoryDialog } from '../modals/RoomHistoryDialog';
import { CheckInDialog } from '../modals/CheckInDialog';
import { ROOMS_RACK_GRID } from '../ui/roomsLayout';

interface RoomsViewProps {
  activeSubItemId?: string;
  rooms: Room[];
  reservations?: Reservation[];
  onOpenNewBooking: (room: Room) => void;
  onChangeRoomStatus: (roomId: string, status: RoomStatus) => void;
  onCheckIn: (reservationId: string) => void;
}

interface AnchorBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type DoorState = 'vacant' | 'occupied' | 'dirty' | 'ooo';
type Movement = 'in' | 'out' | null;
type RoomFilter = 'ALL' | DoorState | 'check-in' | 'check-out';

interface RoomDisplay {
  door: DoorState;
  open: boolean;
  movement: Movement;
}

const DOOR_LABEL: Record<DoorState, string> = {
  vacant: 'Vacant',
  occupied: 'Occupied',
  dirty: 'Dirty',
  ooo: 'Out of order',
};

const ROOM_FILTERS: { id: Exclude<RoomFilter, 'ALL'>; label: string }[] = [
  { id: 'vacant', label: 'Vacant' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'check-in', label: 'Check-in' },
  { id: 'check-out', label: 'Check-out' },
  { id: 'dirty', label: 'Dirty' },
  { id: 'ooo', label: 'Out of order' },
];

function deriveRoomDisplay(room: Room, stay?: DerivedStayMeta): RoomDisplay {
  const movement: Movement = stay?.isArrival ? 'in' : stay?.isDeparture ? 'out' : null;
  // A guest in the room (or one checking out) means Occupied — never Dirty.
  // Dirty therefore only applies to empty rooms, which may still have a check-in.
  const occupied = Boolean(stay?.isOccupied) || movement === 'out';
  const door: DoorState =
    room.status === 'out-of-order'
      ? 'ooo'
      : occupied
        ? 'occupied'
        : room.status === 'vacant-dirty' ||
            room.status === 'occupied-dirty' ||
            room.status === 'inspect'
          ? 'dirty'
          : 'vacant';
  return {
    door,
    open: door === 'vacant',
    movement,
  };
}

function matchesRoomFilter(display: RoomDisplay, filter: RoomFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'check-in') return display.movement === 'in';
  if (filter === 'check-out') return display.movement === 'out';
  return display.door === filter;
}

function describeRoom(display: RoomDisplay): string {
  const parts: string[] = [DOOR_LABEL[display.door]];
  if (display.movement === 'in') parts.push('check-in today');
  if (display.movement === 'out') parts.push('check-out today');
  return parts.join(', ');
}

function RoomDoor({ display, small = false }: { display: RoomDisplay; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`room-door ${small ? 'room-door--sm' : ''}`}
      data-state={display.door}
      data-open={display.open}
    >
      <span className="room-door__frame">
        <span className="room-door__opening">
          <span className="room-door__leaf">
            <span className="room-door__knob" />
          </span>
        </span>
      </span>
    </span>
  );
}

/**
 * Movement arrow: a hairline shaft that fades in from its tail into a small
 * open chevron, always heading right — into the door for a check-in (drawn
 * on its left), away from it for a check-out (drawn on its right). Its colour
 * is the state the room is about to take: red (occupied) after a check-in,
 * amber (dirty) after a check-out.
 */
function MoveArrow({ movement, small = false }: { movement: 'in' | 'out'; small?: boolean }) {
  const gradientId = `room-move-trail-${React.useId().replace(/:/g, '')}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 16"
      className={`shrink-0 ${small ? 'h-[9px] w-[14px]' : 'h-4 w-6'} ${
        movement === 'in' ? 'room-move room-move--in' : 'room-move room-move--out'
      }`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={gradientId} x1="2" y1="0" x2="20" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.6" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M2 8h18.5" stroke={`url(#${gradientId})`} strokeWidth={small ? 2.2 : 1.75} />
      <path d="M16.5 4.5 20.5 8l-4 3.5" strokeWidth={small ? 2.2 : 1.75} />
    </svg>
  );
}

const STATUS_SQUARE_COLOR: Record<DoorState, string> = {
  vacant: 'bg-[#53a97c]',
  occupied: 'bg-[#e05e5e]',
  dirty: 'bg-[#e59a1b]',
  ooo: 'bg-[#779bde]',
};

function FilterGlyph({ id }: { id: Exclude<RoomFilter, 'ALL'> }) {
  return (
    <span aria-hidden="true" className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
      {id === 'check-in' || id === 'check-out' ? (
        <MoveArrow small movement={id === 'check-in' ? 'in' : 'out'} />
      ) : (
        <span className={`h-3 w-3 rounded-[2px] ${STATUS_SQUARE_COLOR[id]}`} />
      )}
    </span>
  );
}

/*
 * Fixed 86px cells spread edge to edge. 86px is the narrowest width that
 * fits every room name in two lines ("Bangalô / Vista da Serra"), so every
 * plate keeps the same footprint. Each door (28px) is centred in its cell,
 * 29px in from the cell edge. The grid is pulled out by 13px of that, so the
 * outer doors sit a steady 16px inside the page title and toolbar edges, and
 * the widest labels and arrows still keep ~15px clear of the card edge. The
 * scroll viewport carries the card's 28px padding so nothing is clipped.
 */
const COMPACT_GRID =
  'flex flex-wrap items-start gap-1';

const COMPACT_ROOM_STYLE: Record<DoorState, string> = {
  vacant: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  occupied: 'border-[#e05e5e] bg-[#fce9e9] text-red-800 hover:bg-red-100',
  dirty: 'border-[#e59a1b] bg-[#faf1cb] text-amber-900 hover:bg-amber-100',
  ooo: 'border-[#779bde] bg-[#eef3fc] text-blue-800 hover:bg-blue-100',
};

interface DerivedStayMeta {
  isOccupied: boolean;
  isArrival: boolean;
  isDeparture: boolean;
  isVacant: boolean;
  displayGuestName?: string;
  adults: number;
  children: number;
}

function deriveRoomStayMeta(room: Room, reservations: Reservation[]): DerivedStayMeta {
  const activeRes = reservations.find(
    (r) => r.roomNumber === room.number && r.status !== 'checked-out'
  );

  const hasVacantStatus = room.status === 'vacant-clean' || room.status === 'vacant-dirty';
  const isArrival =
    activeRes?.status === 'arriving' || Boolean(room.guestName?.includes('(Arriving)'));
  const isDeparture =
    activeRes?.status === 'departing' ||
    Boolean(room.guestName?.includes('(Departing)')) ||
    room.checkOut === new Date().toLocaleDateString('en-CA');
  const guestRaw =
    hasVacantStatus && !isArrival && !isDeparture
      ? undefined
      : room.guestName || activeRes?.guestName;
  const isInHouseReservation =
    activeRes?.status === 'checked-in' || activeRes?.status === 'departing';
  const isOccupied =
    room.status === 'occupied-clean' ||
    room.status === 'occupied-dirty' ||
    isInHouseReservation;
  const isVacant = !isOccupied && !isArrival && room.status !== 'out-of-order';

  const cleanName = guestRaw
    ? guestRaw.replace(' (Arriving)', '').replace(' (Departing)', '')
    : undefined;

  return {
    isOccupied,
    isArrival,
    isDeparture,
    isVacant,
    displayGuestName: cleanName,
    adults: isInHouseReservation ? activeRes.adults : 0,
    children: isInHouseReservation ? activeRes.children : 0,
  };
}

function getFloorLabel(floor: number): string {
  if (floor === 6) return 'Chalets & Villas';
  if (floor === 5) return 'Floor 5 • Penthouse & Villas';
  return `Floor ${floor}`;
}

function useAnchorBox(activeKey: string, revision: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [box, setBox] = useState<AnchorBox | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const el = itemRefs.current[activeKey];
      if (!el) return;
      const parent = container.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const next = {
        left: rect.left - parent.left - container.clientLeft + container.scrollLeft,
        top: rect.top - parent.top - container.clientTop + container.scrollTop,
        width: rect.width,
        height: rect.height,
      };
      setBox((prev) => {
        if (
          prev &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
        ) {
          return prev;
        }
        return next;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    container.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      container.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [activeKey, revision]);

  const setItemRef = (key: string) => (node: HTMLButtonElement | null) => {
    itemRefs.current[key] = node;
  };

  return { containerRef, setItemRef, box };
}

function SlidingTrack({
  activeKey,
  revision,
  children,
}: {
  activeKey: string;
  revision: string;
  children: (
    setItemRef: (key: string) => (node: HTMLButtonElement | null) => void
  ) => React.ReactNode;
}) {
  const { containerRef, setItemRef, box } = useAnchorBox(activeKey, revision);

  return (
    <div
      ref={containerRef}
      className="no-native-scrollbar relative flex w-max max-w-full items-center overflow-x-auto rounded-md border border-slate-200 bg-slate-100 p-0.5"
    >
      {box && (
        <span
          aria-hidden
          className="rooms-pill pointer-events-none absolute left-0 top-0 rounded bg-white shadow-sm"
          style={{
            width: box.width,
            height: box.height,
            transform: `translate3d(${box.left}px, ${box.top}px, 0)`,
          }}
        />
      )}
      {children(setItemRef)}
    </div>
  );
}

function RoomFilterSection<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ComboboxOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  return (
    <fieldset className="min-w-0 border-b border-slate-100 pb-4 last:border-0">
      <legend className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </legend>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={`mb-0.5 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors hover:bg-slate-50 ${
              selected ? 'font-medium text-slate-900' : 'text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onChange(
                selected
                  ? value.filter((item) => item !== option.value)
                  : options.map((item) => item.value).filter((item) => item === option.value || value.includes(item))
              )}
              className="h-3.5 w-3.5 shrink-0 accent-[#005FB8]"
            />
            {option.icon && <span aria-hidden="true" className="inline-flex shrink-0">{option.icon}</span>}
            <span className="min-w-0 flex-1">{option.label}</span>
            <span className="text-[11px] tabular-nums text-slate-400">{option.meta}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

interface RoomPlateProps {
  room: Room;
  compact: boolean;
  index: number;
  display: RoomDisplay;
  guestName?: string;
  detailsOpen: boolean;
  flash: boolean;
  onOpenDetails: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function RoomPlate({
  room,
  compact,
  index,
  display,
  guestName,
  detailsOpen,
  flash,
  onOpenDetails,
}: RoomPlateProps) {
  const delay = `${Math.min(index, 12) * 16}ms`;
  const summary = describeRoom(display);
  const hasLongLabel = room.number.length > 5;
  const tooltip = [room.number, room.type, summary, guestName].filter(Boolean).join(' · ');

  return (
    <div
      className={`rooms-rise relative min-w-0 rounded-md transition-colors ${detailsOpen ? 'z-50' : ''} ${
        compact ? `shrink-0 ${hasLongLabel ? 'w-[152px] max-w-full' : 'w-12'}` : 'flex flex-col items-center'
      }`}
      style={{ animationDelay: delay }}
    >
      <div className={`relative ${compact ? 'w-full' : ''}`}>
        <button
          type="button"
          data-room-id={room.id}
          title={`${tooltip}. Click to view room details.`}
          aria-controls={detailsOpen ? 'room-details' : undefined}
          aria-haspopup="dialog"
          aria-expanded={detailsOpen}
          aria-label={tooltip}
          onClick={onOpenDetails}
          className={`relative flex cursor-pointer select-none flex-col items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] ${
            compact
              ? `min-h-12 w-full justify-center border px-1.5 py-1 ${hasLongLabel ? '' : 'aspect-square'} ${COMPACT_ROOM_STYLE[display.door]}`
              : "p-1 before:absolute before:-inset-1 before:content-['']"
          }`}
        >
          {flash && (
            <span
              className="rooms-flash-ring pointer-events-none absolute inset-0 rounded-md"
              style={{ ['--rooms-flash' as string]: '#005FB8' }}
            />
          )}

          {!compact && <RoomDoor display={display} />}

          {compact && (
            <span className="max-w-full break-words text-center font-display text-[11px] font-semibold leading-[14px] [overflow-wrap:anywhere]">
              {room.number}
            </span>
          )}
          {compact && display.movement && (
            <span
              aria-hidden="true"
              className="absolute bottom-0.5 right-1 text-[8px] font-bold leading-[10px] tracking-wide text-slate-700"
            >
              {display.movement === 'in' ? 'IN' : 'OUT'}
            </span>
          )}
        </button>
        {!compact && display.movement && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-[18px] ${
              display.movement === 'in' ? 'right-full' : 'left-full'
            }`}
          >
            <MoveArrow movement={display.movement} />
          </span>
        )}
      </div>
      {!compact && (
        <span className="mt-0.5 min-h-8 max-w-full break-words text-center font-display text-[13px] font-normal leading-4 text-[#005FB8] line-clamp-2">
          {room.number}
        </span>
      )}
    </div>
  );
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  reservations = [],
  onOpenNewBooking,
  onChangeRoomStatus,
  onCheckIn,
}) => {
  // Empty array = no filter. Values inside one filter are OR'd; filters are AND'd.
  const [statusFilters, setStatusFilters] = useState<Exclude<RoomFilter, 'ALL'>[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [characteristicFilters, setCharacteristicFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [groupByFloor, setGroupByFloor] = useState(false);
  const [compact, setCompact] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const filtersPopoverRef = useRef<HTMLElement>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRoom, setHistoryRoom] = useState<Room | null>(null);
  const [checkInRoomId, setCheckInRoomId] = useState<string | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const roomTriggerRef = useRef<HTMLButtonElement | null>(null);
  const roomPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    filtersPopoverRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!filtersPopoverRef.current?.contains(target) && !filtersButtonRef.current?.contains(target)) {
        setFiltersOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setFiltersOpen(false);
      filtersButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filtersOpen]);

  const closeRoomDetails = () => {
    setSelectedRoomId(null);
    roomTriggerRef.current?.focus();
  };

  useEffect(() => {
    if (!selectedRoomId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRoomId(null);
        roomTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRoomId]);

  useLayoutEffect(() => {
    const anchor = roomTriggerRef.current;
    const panel = roomPopoverRef.current;
    const container = anchor?.parentElement;
    if (!selectedRoomId || !anchor || !panel || !container) return;
    let scrollViewport: HTMLElement | null = anchor.parentElement;
    while (scrollViewport && !/(auto|scroll)/.test(getComputedStyle(scrollViewport).overflowY)) {
      scrollViewport = scrollViewport.parentElement;
    }


    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const viewport = window.visualViewport;
      const bounds = scrollViewport?.getBoundingClientRect();
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportTop = viewport?.offsetTop ?? 0;
      const leftEdge = Math.max(viewportLeft, bounds?.left ?? viewportLeft) + 8;
      const topEdge = Math.max(viewportTop, bounds?.top ?? viewportTop) + 8;
      const rightEdge = Math.min(viewportLeft + (viewport?.width ?? window.innerWidth), bounds?.right ?? Infinity) - 8;
      const bottomEdge = Math.min(viewportTop + (viewport?.height ?? window.innerHeight), bounds?.bottom ?? Infinity) - 8;
      if (!anchor.isConnected || rect.bottom <= topEdge || rect.top >= bottomEdge || rect.right <= leftEdge || rect.left >= rightEdge) {
        panel.style.visibility = 'hidden';
        return;
      }

      panel.style.width = `${Math.max(0, Math.min(288, rightEdge - leftEdge))}px`;
      panel.style.setProperty('--popover-max-height', `${Math.max(0, bottomEdge - topEdge)}px`);
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const gap = 12;
      const fitsRight = rect.right + gap + width <= rightEdge;
      const fitsLeft = rect.left - gap - width >= leftEdge;
      const fitsAbove = rect.top - gap - height >= topEdge;
      const nearBottom = rect.top - 16 + height > bottomEdge;
      const side = nearBottom && fitsAbove ? 'above' : fitsRight ? 'right' : fitsLeft ? 'left' : fitsAbove ? 'above' : 'below';
      const left = side === 'right' ? rect.right + gap : side === 'left' ? rect.left - width - gap : rect.left + rect.width / 2 - width / 2;
      const top = side === 'above' ? rect.top - height - gap : side === 'below' ? rect.bottom + gap : rect.top - 16;
      const clampedLeft = Math.max(leftEdge, Math.min(left, rightEdge - width));
      const clampedTop = Math.max(topEdge, Math.min(top, bottomEdge - height));
      panel.style.left = `${clampedLeft - containerRect.left}px`;
      panel.style.top = `${clampedTop - containerRect.top}px`;
      panel.dataset.side = side;
      const pointer = panel.querySelector<HTMLElement>('[data-room-pointer]');
      if (pointer) {
        const horizontal = side === 'above' || side === 'below';
        pointer.style.left = horizontal
          ? `${Math.max(16, Math.min(rect.left + rect.width / 2 - clampedLeft, width - 16))}px`
          : side === 'right' ? '-5px' : `${width - 5}px`;
        pointer.style.top = horizontal
          ? side === 'above' ? `${height - 5}px` : '-5px'
          : `${Math.max(16, Math.min(rect.top + rect.height / 2 - clampedTop, height - 16))}px`;
        pointer.style.transform = horizontal
          ? `translateX(-50%) rotate(${side === 'above' ? -45 : 135}deg)`
          : `translateY(-50%) rotate(${side === 'right' ? 45 : 225}deg)`;
      }
      panel.style.visibility = 'visible';
    };

    position();
    panel.focus({ preventScroll: true });
    const observer = new ResizeObserver(position);
    observer.observe(panel);
    if (scrollViewport) observer.observe(scrollViewport);
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.contains(target) && !anchor.contains(target)) setSelectedRoomId(null);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('resize', position);
      document.removeEventListener('pointerdown', closeOnOutside);
    };
  }, [selectedRoomId]);

  const stayMetaByRoomId = useMemo(() => {
    const map: Record<string, DerivedStayMeta> = {};
    rooms.forEach((room) => {
      map[room.id] = deriveRoomStayMeta(room, reservations);
    });
    return map;
  }, [rooms, reservations]);

  const displayByRoomId = useMemo(() => {
    const map: Record<string, RoomDisplay> = {};
    rooms.forEach((room) => {
      map[room.id] = deriveRoomDisplay(room, stayMetaByRoomId[room.id]);
    });
    return map;
  }, [rooms, stayMetaByRoomId]);

  const filterCounts = useMemo(() => {
    const counts = {} as Record<Exclude<RoomFilter, 'ALL'>, number>;
    ROOM_FILTERS.forEach(({ id }) => {
      counts[id] = rooms.filter((room) => matchesRoomFilter(displayByRoomId[room.id], id)).length;
    });
    return counts;
  }, [rooms, displayByRoomId]);

  const categories = useMemo(() => Array.from(new Set(rooms.map((room) => room.type))), [rooms]);

  const statusOptions = useMemo<ComboboxOption<Exclude<RoomFilter, 'ALL'>>[]>(
    () =>
      ROOM_FILTERS.map(({ id, label }) => ({
        value: id,
        label,
        icon: <FilterGlyph id={id} />,
        meta: filterCounts[id],
      })),
    [filterCounts]
  );

  const categoryOptions = useMemo<ComboboxOption[]>(
    () =>
      categories.map((category) => ({
        value: category,
        label: category,
        meta: rooms.filter((room) => room.type === category).length,
      })),
    [rooms, categories]
  );

  const characteristicOptions = useMemo<ComboboxOption[]>(
    () => Array.from(new Set(rooms.flatMap((room) => room.characteristics || [])))
      .sort((a, b) => a.localeCompare(b))
      .map((characteristic) => ({
        value: characteristic,
        label: characteristic,
        meta: rooms.filter((room) => room.characteristics?.includes(characteristic)).length,
      })),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rooms.filter((room) => {
      if (
        statusFilters.length > 0 &&
        !statusFilters.some((filter) => matchesRoomFilter(displayByRoomId[room.id], filter))
      ) {
        return false;
      }

      if (categoryFilters.length > 0 && !categoryFilters.includes(room.type)) return false;
      if (
        characteristicFilters.length > 0 &&
        !characteristicFilters.some((characteristic) => room.characteristics?.includes(characteristic))
      ) return false;

      if (query) {
        const meta = stayMetaByRoomId[room.id];
        const matchesNumber = room.number.toLowerCase().includes(query);
        const matchesType = room.type.toLowerCase().includes(query);
        const matchesGuest =
          room.guestName?.toLowerCase().includes(query) ||
          meta?.displayGuestName?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesType && !matchesGuest) return false;
      }
      return true;
    });
  }, [rooms, statusFilters, categoryFilters, characteristicFilters, searchQuery, stayMetaByRoomId, displayByRoomId]);

  const footerKpiGroups = useMemo(() => {
    const guests = filteredRooms.reduce(
      (totals, room) => {
        const stay = stayMetaByRoomId[room.id];
        return {
          adults: totals.adults + stay.adults,
          children: totals.children + stay.children,
        };
      },
      { adults: 0, children: 0 }
    );
    const guestCountHint = 'In-house guests with a checked-in or departing reservation in the shown rooms';

    return [
      {
        label: 'Room total',
        items: [
          { label: 'Rooms', value: filteredRooms.length, icon: <LayoutGrid className="h-3.5 w-3.5" />, hint: 'Rooms matching the current filters' },
        ],
      },
      {
        label: 'Door statuses',
        items: ROOM_FILTERS.map(({ id, label }) => ({
          label,
          value: filteredRooms.filter((room) => matchesRoomFilter(displayByRoomId[room.id], id)).length,
          icon: <FilterGlyph id={id} />,
          hint: `${label} rooms matching the current filters`,
        })),
      },
      {
        label: 'Guest totals',
        items: [
          { label: 'Guests', value: guests.adults + guests.children, icon: <Users className="h-3.5 w-3.5" />, hint: guestCountHint },
          { label: 'Adults', value: guests.adults, icon: <UserRound className="h-3.5 w-3.5" />, hint: guestCountHint },
          { label: 'Children', value: guests.children, icon: <Baby className="h-3.5 w-3.5" />, hint: guestCountHint },
        ],
      },
    ];
  }, [filteredRooms, displayByRoomId, stayMetaByRoomId]);

  const groupedFloors = useMemo(() => {
    const map = new Map<number, Room[]>();
    filteredRooms.forEach((room) => {
      const list = map.get(room.floor) || [];
      list.push(room);
      map.set(room.floor, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredRooms]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );
  const [outOfOrderReason, ...noteParagraphs] = (selectedRoom?.notes?.trim() ?? '').split('\n\n');
  const outOfOrderNotes = noteParagraphs.join('\n\n').trim();
  const checkInRoom = rooms.find((room) => room.id === checkInRoomId);

  const filtersActive =
    statusFilters.length > 0 ||
    categoryFilters.length > 0 ||
    characteristicFilters.length > 0 ||
    Boolean(searchQuery);

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const activeFilters = [
    {
      group: 'Status', options: statusOptions, values: statusFilters,
      remove: (value: string) => setStatusFilters((current) => current.filter((item) => item !== value)),
    },
    {
      group: 'Category', options: categoryOptions, values: categoryFilters,
      remove: (value: string) => setCategoryFilters((current) => current.filter((item) => item !== value)),
    },
    {
      group: 'Characteristic', options: characteristicOptions, values: characteristicFilters,
      remove: (value: string) => setCharacteristicFilters((current) => current.filter((item) => item !== value)),
    },
  ].flatMap(({ group, options, values, remove }) => values.map((value) => ({
    id: `${group}:${value}`,
    label: `${group}: ${options.find((option) => option.value === value)?.label ?? value}`,
    remove: () => remove(value),
  })));
  if (searchQuery.trim()) {
    activeFilters.push({ id: 'search', label: `Search: ${searchQuery.trim()}`, remove: clearSearch });
  }

  const listKey = `${statusFilters.join(',')}|${categoryFilters.join(',')}|${characteristicFilters.join(',')}|${searchQuery}|${
    groupByFloor ? 'wing' : 'grid'
  }|${compact ? 'compact' : 'doors'}`;
  const gridClassName = compact ? COMPACT_GRID : ROOMS_RACK_GRID;

  const clearFilters = () => {
    setStatusFilters([]);
    setCategoryFilters([]);
    setCharacteristicFilters([]);
    clearSearch();
  };

  const handleRoomClick = (event: React.MouseEvent<HTMLButtonElement>, room: Room) => {
    event.stopPropagation();

    roomTriggerRef.current = event.currentTarget;
    setHistoryOpen(false);
    setFiltersOpen(false);
    setSelectedRoomId((current) => current === room.id ? null : room.id);
  };

  const renderPlate = (room: Room, index: number) => (
    <RoomPlate
      key={room.id}
      room={room}
      compact={compact}
      index={index}
      display={displayByRoomId[room.id]}
      guestName={stayMetaByRoomId[room.id]?.displayGuestName}
      detailsOpen={selectedRoomId === room.id}
      flash={false}
      onOpenDetails={(event) => handleRoomClick(event, room)}
    />
  );


  return (
    <div data-view="rooms" className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">UH Map</h1>

        <div className="flex flex-wrap items-center gap-2">
          <form role="search" className="relative" onSubmit={(event) => {
            event.preventDefault();
            setSelectedRoomId(null);
            setSearchQuery(searchInput.trim());
          }}>
            <label htmlFor="rooms-search" className="sr-only">
              Search rooms
            </label>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="rooms-search"
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search anything"
              spellCheck={false}
              className="w-44 rounded border border-slate-300 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#005FB8] focus:outline-none sm:w-52"
            />
            {(searchInput || searchQuery) && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          <SlidingTrack activeKey={groupByFloor ? 'wing' : 'grid'} revision="view">
            {(setItemRef) => (
              <>
                <button
                  ref={setItemRef('grid')}
                  type="button"
                  title="Grid"
                  aria-pressed={!groupByFloor}
                  onClick={() => setGroupByFloor(false)}
                  className={`relative z-10 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    !groupByFloor ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  ref={setItemRef('wing')}
                  type="button"
                  title="Group by Floor / Wing"
                  aria-pressed={groupByFloor}
                  onClick={() => setGroupByFloor(true)}
                  className={`relative z-10 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    groupByFloor ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">By Wing</span>
                </button>
              </>
            )}
          </SlidingTrack>

          <button
            type="button"
            title="Show rooms as compact squares"
            aria-pressed={compact}
            onClick={() => {
              setSelectedRoomId(null);
              setCompact((value) => !value);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] ${
              compact
                ? 'border-blue-200 bg-blue-50 text-[#005FB8]'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Compact</span>
          </button>
          <div className="relative">
          <button
            ref={filtersButtonRef}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="rooms-filters"
            aria-haspopup="dialog"
            onClick={() => {
              setSelectedRoomId(null);
              setFiltersOpen((open) => !open);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] ${
              filtersOpen
                ? 'border-blue-200 bg-blue-50 text-[#005FB8]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div aria-label="Active room filters" className="flex min-h-9 shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 pb-2.5 text-xs">
        <span className="mr-1 flex items-center gap-1.5 font-medium text-slate-500"><Filter aria-hidden="true" className="h-3.5 w-3.5" />Filters</span>
            {activeFilters.map((filter) => (
              <button key={filter.id} type="button" onClick={filter.remove} aria-label={`Remove ${filter.label}`} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[#005FB8] hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]">
                <span className="min-w-0 break-words">{filter.label}</span>
                <X aria-hidden="true" className="h-3 w-3 shrink-0" />
              </button>
            ))}
            <button type="button" onClick={clearFilters} className="rounded px-2 py-1 font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]">Clear all</button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <CustomScrollArea
          className="-ml-5 -mr-5 min-h-0 min-w-0 flex-1 lg:-ml-7 lg:-mr-7"
          viewportClassName="pb-3 pl-5 pr-5 pt-1 lg:pl-7 lg:pr-7"
          gutter="overlay"
          showTrackWhenIdle={false}
        >
          <div key={listKey}>
            {filteredRooms.length === 0 ? (
              <div className="px-6 py-16 text-center text-xs text-slate-500">
                <p>No rooms match the current filter.</p>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-xs font-medium text-[#005FB8] hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : groupByFloor ? (
              <div className="space-y-4">
                {groupedFloors.map(([floor, floorRooms]) => (
                  <section key={floor}>
                    <div className="mb-1.5 flex items-center gap-2 px-0.5">
                      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {getFloorLabel(floor)}
                      </h2>
                      <span className="font-mono text-[10px] tabular-nums text-slate-400">
                        {floorRooms.length}
                      </span>
                      <div className="h-px flex-1 bg-slate-200/80" />
                    </div>
                    <div className={gridClassName}>
                      {floorRooms.map((room, index) => renderPlate(room, index))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={gridClassName}>
                {filteredRooms.map((room, index) => renderPlate(room, index))}
              </div>
            )}
          </div>
        </CustomScrollArea>

        {selectedRoom && roomTriggerRef.current?.parentElement && createPortal(
          <div
            ref={roomPopoverRef}
            id="room-details"
            role="dialog"
            aria-labelledby="room-details-title"
            tabIndex={-1}
            style={{ visibility: 'hidden' }}
            className="group absolute z-[100] w-72 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white text-xs shadow-[0_8px_32px_-8px_rgba(15,23,42,0.25),0_2px_8px_rgba(15,23,42,0.06)] outline-none"
          >
            <span
              aria-hidden="true"
              data-room-pointer
              className="pointer-events-none absolute h-2 w-2 border-b border-l border-slate-200 bg-white"
            />
            <div style={{ maxHeight: 'var(--popover-max-height, calc(100dvh - 24px))' }} className="overflow-y-auto rounded-xl">
              <header className="flex items-start gap-2.5 px-4 pb-3 pt-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-100">
                  <RoomDoor display={displayByRoomId[selectedRoom.id]} small />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="room-details-title" className="break-words font-display text-sm font-semibold leading-5 text-slate-900">{selectedRoom.number}</h2>
                  <p className="mt-0.5 leading-4 text-slate-500">{selectedRoom.type}</p>
                </div>
                <button
                  type="button"
                  aria-label="Close room details"
                  onClick={closeRoomDetails}
                  className="-mr-1 -mt-1 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </header>
              <div className="mx-4 flex items-center gap-1.5 border-b border-slate-100 pb-3 text-[11px] font-medium text-slate-600">
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_SQUARE_COLOR[displayByRoomId[selectedRoom.id].door]}`} />
                {DOOR_LABEL[displayByRoomId[selectedRoom.id].door]}
              </div>
              {selectedRoom.status === 'out-of-order' && (
                <dl className="mx-4 space-y-3 border-b border-slate-100 py-3">
                  <div className="space-y-1">
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Reason</dt>
                    <dd className="whitespace-pre-wrap break-words text-xs font-semibold leading-5 text-slate-800">
                      {outOfOrderReason || 'No reason recorded.'}
                    </dd>
                  </div>
                  {outOfOrderNotes && (
                    <div className="space-y-1">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Notes</dt>
                      <dd className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">{outOfOrderNotes}</dd>
                    </div>
                  )}
                </dl>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-4 py-4">
                <div className="space-y-1.5">
                  <dt className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                    Floor
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums text-slate-900">{selectedRoom.floor}</dd>
                </div>
                <div className="space-y-1.5 border-l border-slate-100 pl-4">
                  <dt className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-500">
                    <Users aria-hidden="true" className="h-3.5 w-3.5" />
                    Maximum guests
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums text-slate-900">{selectedRoom.maxGuests ?? 'Not specified'}</dd>
                </div>
                <div className="col-span-2 space-y-2 rounded-lg bg-slate-50 p-3">
                  <dt className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <BedDouble aria-hidden="true" className="h-3.5 w-3.5" />
                    Bed layout
                  </dt>
                  <dd className="break-words text-[13px] font-medium leading-5 text-slate-800">
                    {selectedRoom.bedLayout ?? 'Not specified'}
                  </dd>
                </div>
              </dl>
              {stayMetaByRoomId[selectedRoom.id].isArrival && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => {
                      setCheckInRoomId(selectedRoom.id);
                      closeRoomDetails();
                      setIsCheckInOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                  >
                    <LogIn aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Check-in
                  </button>
                </div>
              )}
              {selectedRoom.status === 'out-of-order' && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeRoomStatus(selectedRoom.id, 'vacant-dirty');
                      closeRoomDetails();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                  >
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Finish out of order
                  </button>
                </div>
              )}
              {displayByRoomId[selectedRoom.id].door === 'dirty' && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeRoomStatus(selectedRoom.id, 'vacant-clean');
                      closeRoomDetails();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                  >
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Set clean
                  </button>
                </div>
              )}
              {displayByRoomId[selectedRoom.id].door === 'vacant' && (
                <div className="space-y-2 border-t border-slate-100 px-4 py-3">
                  <div className="space-y-0.5">
                    {!stayMetaByRoomId[selectedRoom.id].isArrival && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(null);
                          onOpenNewBooking(selectedRoom);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                      >
                        <Footprints aria-hidden="true" className="h-4 w-4 shrink-0" />
                        Walk-In
                      </button>
                    )}
                    {[
                      { label: 'Set dirty', icon: Brush, status: 'vacant-dirty' as const },
                      { label: 'Set out-of-order', icon: Wrench, status: 'out-of-order' as const },
                    ].map(({ label, icon: Icon, status }) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          onChangeRoomStatus(selectedRoom.id, status);
                          closeRoomDetails();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                      >
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2 border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => {
                        setHistoryRoom(selectedRoom);
                        closeRoomDetails();
                        setHistoryOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8]"
                    >
                      <History aria-hidden="true" className="h-4 w-4 shrink-0" />
                      Room history
                    </button>
              </div>
            </div>
          </div>,
          roomTriggerRef.current.parentElement
        )}

        {filtersButtonRef.current?.parentElement && createPortal(
        <aside
            ref={filtersPopoverRef}
            id="rooms-filters"
            role="dialog"
            aria-labelledby="rooms-filters-title"
            aria-hidden={!filtersOpen}
            data-open={filtersOpen}
            {...(!filtersOpen ? { inert: '' } : {})}
            className="rooms-filter-panel"
          >
            <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#005FB8]"><Filter aria-hidden="true" className="h-4 w-4" /></span>
                <div>
                  <h2 id="rooms-filters-title" className="text-base font-semibold text-slate-900">Filters</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Refine the rooms shown in the grid.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!filtersActive}
                  onClick={clearFilters}
                  className="text-xs font-medium text-[#005FB8] hover:underline disabled:text-slate-300 disabled:no-underline"
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => {
                    setFiltersOpen(false);
                    filtersButtonRef.current?.focus();
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CustomScrollArea
              className="min-h-0 flex-1"
              viewportClassName="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:gap-6"
              gutter="overlay"
              showTrackWhenIdle={false}
            >
              <RoomFilterSection
                label="Status"
                options={statusOptions}
                value={statusFilters}
                onChange={setStatusFilters}
              />
              <RoomFilterSection
                label="Category"
                options={categoryOptions}
                value={categoryFilters}
                onChange={setCategoryFilters}
              />
              <RoomFilterSection
                label="Characteristics"
                options={characteristicOptions}
                value={characteristicFilters}
                onChange={setCharacteristicFilters}
              />
            </CustomScrollArea>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <p role="status" className="text-xs text-slate-500"><span className="font-semibold text-slate-900">{filteredRooms.length}</span> of {rooms.length} rooms shown</p>
              <button type="button" onClick={() => { setFiltersOpen(false); filtersButtonRef.current?.focus(); }} className="rounded-lg bg-[#005FB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004f99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] focus-visible:ring-offset-2">Done</button>
            </div>
            </div>
        </aside>,
        filtersButtonRef.current.parentElement
        )}
      </div>

      {checkInRoom && createPortal(
        <CheckInDialog
          isOpen={isCheckInOpen}
          room={checkInRoom}
          reservation={reservations.find((reservation) => reservation.roomNumber === checkInRoom.number && reservation.status === 'arriving')}
          isOccupied={stayMetaByRoomId[checkInRoom.id].isOccupied || reservations.some((reservation) =>
            reservation.roomNumber === checkInRoom.number && (reservation.status === 'checked-in' || reservation.status === 'departing')
          )}
          onClose={() => setIsCheckInOpen(false)}
          onConfirm={onCheckIn}
        />,
        document.body
      )}

      {historyRoom && createPortal(
        <RoomHistoryDialog
          isOpen={historyOpen}
          room={historyRoom}
          reservations={reservations}
          onClose={() => setHistoryOpen(false)}
        />,
        document.body
      )}

      <footer
        aria-label="Filtered room summary"
        className="no-native-scrollbar sticky bottom-0 z-10 -mx-5 shrink-0 overflow-x-auto border-t border-slate-200 bg-white px-5 py-2.5 lg:-mx-7 lg:px-7"
      >
        <div className="flex min-w-max items-center justify-end divide-x divide-slate-200">
          {footerKpiGroups.map((group) => (
            <dl
              key={group.label}
              aria-label={group.label}
              className="flex shrink-0 items-center gap-4 px-5 first:pl-0 last:pr-0"
            >
              {group.items.map(({ label, value, icon, hint }) => (
                <div key={label} title={hint} className="flex items-center gap-2 text-xs leading-5">
                  <dt className="flex items-center gap-2 whitespace-nowrap text-slate-500">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center"
                    >
                      {icon}
                    </span>
                    {label}
                  </dt>
                  <dd className="font-semibold tabular-nums text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </footer>
    </div>
  );
};
