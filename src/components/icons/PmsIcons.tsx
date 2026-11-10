import React, { useId } from 'react';
import { ModuleId } from '../../types/pms';

interface IconProps {
  active?: boolean;
  className?: string;
}

/**
 * High-craft Fluent / Enterprise vector icon suite for the Primary Rail and Secondary Sidebar.
 *
 * All rail modules across all 14 Suite Apps share a unified visual language:
 * - Inactive: Crisp #424242 monoline geometry (1.65px stroke, balanced negative space).
 * - Active: Solid cobalt-steel (#2B6CB0) geometric forms with true SVG mask cutouts.
 */
export const PmsModuleIcon: React.FC<{ moduleId: ModuleId } & IconProps> = ({
  moduleId,
  active = false,
  className = 'w-6 h-6',
}) => {
  const uid = useId().replace(/:/g, '');
  const inactiveStroke = '#424242';
  const activeFill = '#2886DE';

  switch (moduleId) {
    /**
     * 1. OVERVIEW / PULSE (QRS beat running into a live node)
     * The trace ends at the node center so the two read as one gesture at 24px.
     * Distinct from the engineering monitor, which is a screen with a chin.
     */
    case 'overview': {
      const trace = 'M3.55 12.2H7.55L8.9 12.2L11.35 5.4L14.15 19L16.05 12.2H19.05';
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path
              d={trace}
              stroke={activeFill}
              strokeWidth="2.05"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="19.05" cy="12.2" r="1.7" fill={activeFill} />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d={trace}
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="19.05" cy="12.2" r="1.5" fill={inactiveStroke} />
        </svg>
      );
    }

    /**
     * 2. FRONT DESK / MODULAR GRID (2x2 modular grid with top-right rotated diamond)
     */
    case 'front-desk':
    case 'pos-tables':
    case 'chn-grid': {
      const maskId = `frontdesk-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <line x1="11.2" y1="3.5" x2="11.2" y2="20.5" stroke="black" strokeWidth="1.65" />
                <line x1="3.5" y1="12.2" x2="20.5" y2="12.2" stroke="black" strokeWidth="1.65" />
              </mask>
            </defs>
            <path
              d="M4 5.2C4 4.4268 4.6268 3.8 5.4 3.8H11.2V12.2H19.6V18.2C19.6 18.9732 18.9732 19.6 18.2 19.6H5.4C4.6268 19.6 4 18.9732 4 18.2V5.2Z"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
            <rect
              x="16.1"
              y="3.1"
              width="6.4"
              height="6.4"
              rx="1.2"
              transform="rotate(45 16.1 3.1)"
              fill={activeFill}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4.25 5.5C4.25 4.80964 4.80964 4.25 5.5 4.25H11.25V12.25H19.25V18C19.25 18.6904 18.6904 19.25 18 19.25H5.5C4.80964 19.25 4.25 18.6904 4.25 18V5.5Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M4.25 12.25H11.25V19.25"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <rect
            x="16.15"
            y="3.35"
            width="6"
            height="6"
            rx="1.15"
            transform="rotate(45 16.15 3.35)"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
        </svg>
      );
    }

    /**
     * 3. TAPE CHART / TIMELINE (Interactive Room Rack & Staggered Gantt Timeline Schedule)
     */
    case 'tape-chart':
    case 'evt-diary':
    case 'spa-schedule': {
      const maskId = `tapechart-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                {/* Header divider */}
                <line x1="3" y1="8.2" x2="21" y2="8.2" stroke="black" strokeWidth="1.6" />
                {/* Room column divider */}
                <line x1="8" y1="8.2" x2="8" y2="20.5" stroke="black" strokeWidth="1.55" />
                {/* Left room row ticks */}
                <line x1="5.1" y1="11.6" x2="6.4" y2="11.6" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="5.1" y1="15.8" x2="6.4" y2="15.8" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
                {/* Staggered horizontal Gantt reservation tape bars */}
                <rect x="9.8" y="10.3" width="6.2" height="2.6" rx="1.3" fill="black" />
                <rect x="12" y="14.5" width="6.4" height="2.6" rx="1.3" fill="black" />
              </mask>
            </defs>
            {/* Top calendar/timeline header pegs */}
            <path
              d="M8 2.8V5M16 2.8V5"
              stroke={activeFill}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* Solid board body with knocked-out Gantt timeline grid */}
            <rect
              x="3.5"
              y="4.2"
              width="17"
              height="15.8"
              rx="2.2"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          {/* Top timeline date pegs */}
          <path
            d="M8 2.85V4.85M16 2.85V4.85"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          {/* Outer schedule rack frame */}
          <rect
            x="3.75"
            y="4.25"
            width="16.5"
            height="15.5"
            rx="2"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          {/* Top date header bar & left room column divider */}
          <path
            d="M3.75 8.25H20.25M8.25 8.25V19.75"
            stroke={inactiveStroke}
            strokeWidth="1.55"
          />
          {/* Room row indicators in left column */}
          <path
            d="M5.5 11.6H6.6M5.5 15.8H6.6"
            stroke={inactiveStroke}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          {/* Staggered Gantt stay tape bars */}
          <rect
            x="10"
            y="10.35"
            width="5.6"
            height="2.5"
            rx="1.25"
            stroke={inactiveStroke}
            strokeWidth="1.5"
          />
          <rect
            x="12.2"
            y="14.55"
            width="5.8"
            height="2.5"
            rx="1.25"
            stroke={inactiveStroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    }

    /**
     * 4. RESERVATIONS (Perforated Stay Pass Voucher with Confirmed Check & Overlapping Hotel Key Emblem)
     */
    case 'reservations': {
      const maskId = `reservations-mask-${uid}`;
      const keyMaskId = `reservations-key-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                {/* Top voucher stub slot */}
                <rect x="6.7" y="5.3" width="6.6" height="1.8" rx="0.9" fill="black" />
                {/* Perforated ticket waist divider */}
                <path
                  d="M6.6 9.75H8.7M11.3 9.75H13.4"
                  stroke="black"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                {/* Confirmed booking checkmark */}
                <path
                  d="M6.9 14.5L8.75 16.35L12.15 12.75"
                  stroke="black"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Negative-space halo cutout for overlapping hotel key badge */}
                <circle cx="17.6" cy="13.3" r="4.25" fill="black" />
                <rect x="15.8" y="15.5" width="5.8" height="6.2" rx="1.2" fill="black" />
              </mask>
              <mask id={keyMaskId}>
                <rect width="24" height="24" fill="white" />
                <circle cx="17.6" cy="13.3" r="1.15" fill="black" />
              </mask>
            </defs>
            {/* Solid Perforated Reservation Ticket Pass */}
            <path
              d="M5.4 3.2H14.6C15.7 3.2 16.6 4.1 16.6 5.2V8.05C15.65 8.05 14.9 8.81 14.9 9.75C14.9 10.69 15.65 11.45 16.6 11.45V17.8C16.6 18.9 15.7 19.8 14.6 19.8H5.4C4.3 19.8 3.4 18.9 3.4 17.8V11.45C4.35 11.45 5.1 10.69 5.1 9.75C5.1 8.81 4.35 8.05 3.4 8.05V5.2C3.4 4.1 4.3 3.2 5.4 3.2Z"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
            {/* Foreground Hotel Room Key Emblem */}
            <circle
              cx="17.6"
              cy="13.3"
              r="3.05"
              fill={activeFill}
              mask={`url(#${keyMaskId})`}
            />
            <path
              d="M17.6 15.9V20.35M17.6 18.15H20.15M17.6 20.35H19.65"
              stroke={activeFill}
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <defs>
            <mask id={maskId}>
              <rect width="24" height="24" fill="white" />
              {/* Halo knockout around foreground hotel key */}
              <circle cx="17.6" cy="13.3" r="4.1" fill="black" />
              <rect x="15.9" y="15.5" width="5.6" height="6" rx="1.2" fill="black" />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            {/* Monoline Perforated Reservation Ticket Pass */}
            <path
              d="M5.5 3.5H14.5C15.49 3.5 16.3 4.31 16.3 5.3V8.1C15.39 8.1 14.65 8.84 14.65 9.75C14.65 10.66 15.39 11.4 16.3 11.4V17.7C16.3 18.69 15.49 19.5 14.5 19.5H5.5C4.51 19.5 3.7 18.69 3.7 17.7V11.4C4.61 11.4 5.35 10.66 5.35 9.75C5.35 8.84 4.61 8.1 3.7 8.1V5.3C3.7 4.31 4.51 3.5 5.5 3.5Z"
              stroke={inactiveStroke}
              strokeWidth="1.65"
              strokeLinejoin="round"
            />
            {/* Top voucher header bar */}
            <line
              x1="7.1"
              y1="6.3"
              x2="12.9"
              y2="6.3"
              stroke={inactiveStroke}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Perforated ticket waist divider */}
            <path
              d="M6.8 9.75H8.7M11.3 9.75H13.2"
              stroke={inactiveStroke}
              strokeWidth="1.55"
              strokeLinecap="round"
            />
            {/* Confirmed booking checkmark */}
            <path
              d="M7 14.5L8.8 16.3L12.1 12.8"
              stroke={inactiveStroke}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* Foreground Hotel Room Key Emblem */}
          <circle
            cx="17.6"
            cy="13.3"
            r="2.65"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <path
            d="M17.6 15.95V20.25M17.6 18.1H20.05M17.6 20.25H19.55"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    /**
     * 4b. LEDGER BOOK / MENUS / COSTING (Symmetrical twin-pane open ledger book)
     */
    case 'fin-ledger':
    case 'pos-menus':
    case 'inv-costing':
    case 'fis-sped':
    case 'stf-training': {
      const maskId = `reservations-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <line x1="12" y1="3.5" x2="12" y2="20.5" stroke="black" strokeWidth="1.8" />
              </mask>
            </defs>
            <path
              d="M4.5 5.6C4.5 4.72 5.22 4 6.1 4H10.6C11.37 4 12 4.63 12 5.4V19.6C12 18.94 11.46 18.4 10.8 18.4H6.1C5.22 18.4 4.5 17.68 4.5 16.8V5.6ZM19.5 5.6C19.5 4.72 18.78 4 17.9 4H13.4C12.63 4 12 4.63 12 5.4V19.6C12 18.94 12.54 18.4 13.2 18.4H17.9C18.78 18.4 19.5 17.68 19.5 16.8V5.6Z"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4.75 5.75C4.75 4.92157 5.42157 4.25 6.25 4.25H10.5C11.3284 4.25 12 4.92157 12 5.75V18.75C12 18.1977 11.5523 17.75 11 17.75H6.25C5.42157 17.75 4.75 17.0784 4.75 16.25V5.75Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M19.25 5.75C19.25 4.92157 18.5784 4.25 17.75 4.25H13.5C12.6716 4.25 12 4.92157 12 5.75V18.75C12 18.1977 12.4477 17.75 13 17.75H17.75C18.5784 17.75 19.25 17.0784 19.25 16.25V5.75Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    /**
     * 5. ROOMS (Open guest-room door on a threshold)
     * The slab swings clear of the jamb so the mark still reads as a doorway at 24px.
     * Active fills the slab and knocks the lever out; the jamb stays a heavier stroke.
     * Stockrooms and spa cabins keep the catalog + cylinder mark.
     */
    case 'rooms': {
      const maskId = `rooms-door-${uid}`;
      const jamb = 'M15.9 20.7V5.05C15.9 4.1 15.13 3.35 14.2 3.35H8.7';
      const slab = 'M8.7 4.35L3.85 6.25V18.85L8.7 20.7Z';
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <path
                  d="M4.7 12.35H7.25"
                  stroke="black"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </mask>
            </defs>
            <path
              d="M3.6 20.7H20.6"
              stroke={activeFill}
              strokeWidth="2.05"
              strokeLinecap="round"
            />
            <path
              d={jamb}
              stroke={activeFill}
              strokeWidth="2.05"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={slab}
              fill={activeFill}
              stroke={activeFill}
              strokeWidth="1.65"
              strokeLinejoin="round"
              mask={`url(#${maskId})`}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3.6 20.7H20.6"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d={jamb}
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={slab}
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M4.85 12.35H7.2"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    /**
     * 5b. STOCK / CABINS (Catalog monolith with overlapping 2-tier cylinder badge)
     */
    case 'inv-warehouses':
    case 'spa-cabins': {
      const maskId = `stock-cabins-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <rect x="6.5" y="5.2" width="6.6" height="2" rx="1" fill="black" />
                <path
                  d="M5.6 17.3H12"
                  stroke="black"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M10.4 13.2C10.4 11.4 12.9 10.3 15.8 10.3C18.7 10.3 21.2 11.4 21.2 13.2V19.2C21.2 21 18.7 22.1 15.8 22.1C12.9 22.1 10.4 21 10.4 19.2V13.2Z"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="4.2"
              y="2.4"
              width="11.2"
              height="17.8"
              rx="2.2"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
            <ellipse cx="15.8" cy="13.3" rx="4.1" ry="1.55" fill={activeFill} />
            <path
              d="M11.7 14.55C12.55 15.2 14.07 15.55 15.8 15.55C17.53 15.55 19.05 15.2 19.9 14.55V16.65C19.9 17.55 18.06 18.25 15.8 18.25C13.54 18.25 11.7 17.55 11.7 16.65V14.55Z"
              fill={activeFill}
            />
            <path
              d="M11.7 17.85C12.55 18.5 14.07 18.85 15.8 18.85C17.53 18.85 19.05 18.5 19.9 17.85V19.35C19.9 20.25 18.06 20.95 15.8 20.95C13.54 20.95 11.7 20.25 11.7 19.35V17.85Z"
              fill={activeFill}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <defs>
            <mask id={maskId}>
              <rect width="24" height="24" fill="white" />
              <path
                d="M10.4 13C10.4 11.2 12.8 10.1 15.8 10.1C18.8 10.1 21.2 11.2 21.2 13V19.5C21.2 21.2 18.8 22.2 15.8 22.2C12.8 22.2 10.4 21.2 10.4 19.5V13Z"
                fill="black"
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <rect
              x="4.5"
              y="3"
              width="10.8"
              height="16.8"
              rx="2"
              stroke={inactiveStroke}
              strokeWidth="1.65"
            />
            <line
              x1="7.2"
              y1="6.4"
              x2="12.6"
              y2="6.4"
              stroke={inactiveStroke}
              strokeWidth="1.65"
              strokeLinecap="round"
            />
          </g>
          <ellipse
            cx="15.8"
            cy="13.2"
            rx="3.9"
            ry="1.5"
            stroke={inactiveStroke}
            strokeWidth="1.6"
          />
          <path
            d="M11.9 13.2V18.8C11.9 19.63 13.65 20.3 15.8 20.3C17.95 20.3 19.7 19.63 19.7 18.8V13.2"
            stroke={inactiveStroke}
            strokeWidth="1.6"
          />
          <path
            d="M11.9 16C11.9 16.83 13.65 17.5 15.8 17.5C17.95 17.5 19.7 16.83 19.7 16"
            stroke={inactiveStroke}
            strokeWidth="1.6"
          />
        </svg>
      );
    }

    /**
     * 6. BILLING / FOLIOS / INVOICES (Document with folded dog-ear corner and overlapping briefcase badge)
     */
    case 'billing':
    case 'fin-payables':
    case 'evt-beo':
    case 'evt-sales':
    case 'inv-procurement':
    case 'fis-nfse':
    case 'fis-nfe': {
      const maskId = `billing-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <path
                  d="M14.2 2V6.6C14.2 7.26 14.74 7.8 15.4 7.8H20.5"
                  stroke="black"
                  strokeWidth="1.65"
                  fill="none"
                />
                <rect x="1.8" y="11.7" width="12.2" height="9.8" rx="2.1" fill="black" />
                <rect x="4.9" y="9.4" width="6" height="3.5" rx="1.4" fill="black" />
              </mask>
            </defs>
            <path
              d="M7.2 4.1C7.2 3.16 7.96 2.4 8.9 2.4H14.5L19.8 7.7V18.2C19.8 19.14 19.04 19.9 18.1 19.9H8.9C7.96 19.9 7.2 19.14 7.2 18.2V4.1Z"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
            <path
              d="M6.3 11.4C6.3 10.85 6.75 10.4 7.3 10.4H8.5C9.05 10.4 9.5 10.85 9.5 11.4V13H6.3V11.4Z"
              stroke={activeFill}
              strokeWidth="1.5"
            />
            <rect
              x="3.1"
              y="12.9"
              width="9.6"
              height="7.3"
              rx="1.35"
              fill={activeFill}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <defs>
            <mask id={maskId}>
              <rect width="24" height="24" fill="white" />
              <rect x="2" y="11.5" width="11.8" height="9.8" rx="2" fill="black" />
              <rect x="5" y="9.5" width="5.8" height="3.2" rx="1.2" fill="black" />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <path
              d="M7.5 4.4C7.5 3.63 8.13 3 8.9 3H14.4L19.5 8.1V18.1C19.5 18.87 18.87 19.5 18.1 19.5H8.9C8.13 19.5 7.5 18.87 7.5 18.1V4.4Z"
              stroke={inactiveStroke}
              strokeWidth="1.65"
              strokeLinejoin="round"
            />
            <path
              d="M14.25 3V7.25C14.25 7.8 14.7 8.25 15.25 8.25H19.5"
              stroke={inactiveStroke}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>
          <path
            d="M6.2 13V11.5C6.2 10.95 6.65 10.5 7.2 10.5H8.6C9.15 10.5 9.6 10.95 9.6 11.5V13"
            stroke={inactiveStroke}
            strokeWidth="1.55"
          />
          <rect
            x="3.25"
            y="13"
            width="9.3"
            height="6.8"
            rx="1.35"
            stroke={inactiveStroke}
            strokeWidth="1.6"
          />
        </svg>
      );
    }

    /**
     * 7. TREASURY / YIELD / BI ANALYTICS (Rising bar columns with floating coin/spark emblem)
     */
    case 'finances':
    case 'fin-treasury':
    case 'fin-budget':
    case 'rev-pace':
    case 'bi-executive':
    case 'bi-str':
    case 'bi-commercial': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3.5" y="12.5" width="4" height="7.5" rx="1.2" fill={activeFill} />
            <rect x="9.8" y="8.5" width="4" height="11.5" rx="1.2" fill={activeFill} />
            <rect x="16.1" y="4" width="4" height="16" rx="1.2" fill={activeFill} />
            <path
              d="M4.5 9.5L9.5 5.5L13 7.2"
              stroke={activeFill}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect
            x="3.75"
            y="12.75"
            width="3.7"
            height="7"
            rx="1"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <rect
            x="10.1"
            y="8.75"
            width="3.7"
            height="11"
            rx="1"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <rect
            x="16.45"
            y="4.25"
            width="3.7"
            height="15.5"
            rx="1"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <path
            d="M4.5 9.2L9.2 5.2L12.8 6.8"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    /**
     * 8. DINING CLOCHE / HOSPITALITY SERVICE (POS Outlets, Room Service, Catering)
     */
    case 'pos-outlets':
    case 'pos-room-service':
    case 'evt-catering': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="6.2" r="1.7" fill={activeFill} />
            <path
              d="M4 16.2C4 11.78 7.58 8.2 12 8.2C16.42 8.2 20 11.78 20 16.2H4Z"
              fill={activeFill}
            />
            <rect x="2.5" y="17.6" width="19" height="2.2" rx="1.1" fill={activeFill} />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="6.2" r="1.4" stroke={inactiveStroke} strokeWidth="1.6" />
          <path
            d="M4.5 16.2C4.5 12.06 7.86 8.7 12 8.7C16.14 8.7 19.5 12.06 19.5 16.2H4.5Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M3 18.5H21"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    /**
     * 9. GLOBAL CHANNELS / NETWORK / WEB PORTAL (Globe & connected nodes)
     */
    case 'chn-otas':
    case 'chn-gds':
    case 'web-funnel':
    case 'web-corporate': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="8.5" stroke={activeFill} strokeWidth="2.1" />
            <ellipse cx="12" cy="12" rx="4" ry="8.5" fill={activeFill} fillOpacity="0.22" stroke={activeFill} strokeWidth="1.8" />
            <path d="M4 9.5H20M4 14.5H20" stroke={activeFill} strokeWidth="1.8" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="8.25" stroke={inactiveStroke} strokeWidth="1.65" />
          <ellipse cx="12" cy="12" rx="3.8" ry="8.25" stroke={inactiveStroke} strokeWidth="1.6" />
          <path d="M4.2 9.5H19.8M4.2 14.5H19.8" stroke={inactiveStroke} strokeWidth="1.55" />
        </svg>
      );
    }

    /**
     * 10. GUEST PROFILES / GROUPS / WORKFORCE (Twin user silhouettes & VIP badge)
     */
    case 'crm-profiles':
    case 'evt-groups':
    case 'spa-therapists':
    case 'stf-rosters':
    case 'inv-suppliers': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="9.2" cy="7.8" r="3.4" fill={activeFill} />
            <path
              d="M3.2 18.6C3.2 15.5 5.8 13.4 9.2 13.4C12.6 13.4 15.2 15.5 15.2 18.6V19.6H3.2V18.6Z"
              fill={activeFill}
            />
            <circle cx="16.6" cy="8.6" r="2.5" fill={activeFill} />
            <path
              d="M16.2 13.6C18.9 13.9 20.8 15.6 20.8 18.3V19.4H16.8V18.2C16.8 16.3 16.1 14.8 15 13.7C15.4 13.6 15.8 13.6 16.2 13.6Z"
              fill={activeFill}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="9.2" cy="8" r="3.1" stroke={inactiveStroke} strokeWidth="1.65" />
          <path
            d="M3.5 19C3.5 15.9 6 13.8 9.2 13.8C12.4 13.8 14.9 15.9 14.9 19"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <circle cx="16.5" cy="8.8" r="2.3" stroke={inactiveStroke} strokeWidth="1.6" />
          <path
            d="M16.5 13.8C18.9 14.1 20.5 15.8 20.5 18.4"
            stroke={inactiveStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    /**
     * 11. DYNAMIC PRICING / PROMOS / LOYALTY SPARKLE (Diamond & Star Emblem)
     */
    case 'rev-pricing':
    case 'rev-compset':
    case 'chn-promos':
    case 'crm-loyalty':
    case 'crm-reputation':
    case 'web-promos':
    case 'web-addons':
    case 'stf-commissions': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path
              d="M12 3.2L14.55 8.65L20.5 9.45L16.15 13.6L17.25 19.5L12 16.65L6.75 19.5L7.85 13.6L3.5 9.45L9.45 8.65L12 3.2Z"
              fill={activeFill}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3.75L14.4 8.85L20 9.6L15.9 13.5L16.95 19.05L12 16.35L7.05 19.05L8.1 13.5L4 9.6L9.6 8.85L12 3.75Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    /**
     * 12. PAYMENTS / RECEIVABLES / POS CASHIER (Terminal Card & Shield)
     */
    case 'fin-receivables':
    case 'fin-reconciliation':
    case 'pos-cashier':
    case 'web-payments':
    case 'spa-retail':
    case 'spa-dayuse': {
      const maskId = `card-mask-${uid}`;
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" stroke="black" strokeWidth="2" />
                <rect x="6" y="13.8" width="5" height="2" rx="1" fill="black" />
              </mask>
            </defs>
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2.4"
              fill={activeFill}
              mask={`url(#${maskId})`}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect
            x="3.25"
            y="5.25"
            width="17.5"
            height="13.5"
            rx="2.2"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <line x1="3.25" y1="9.5" x2="20.75" y2="9.5" stroke={inactiveStroke} strokeWidth="1.65" />
          <line
            x1="6.5"
            y1="14.5"
            x2="10.5"
            y2="14.5"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    /**
     * 13. ENGINEERING / IOT / KDS / OPERATIONS (Pulse Monitor & Smart Telemetry)
     */
    case 'pos-kds':
    case 'eng-workorders':
    case 'eng-iot':
    case 'eng-utilities':
    case 'chn-health':
    case 'stf-attendance':
    case 'stf-mobile':
    case 'bi-operations': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="4" width="18" height="14" rx="2.4" fill={activeFill} />
            <path
              d="M6.5 11H9.2L10.8 7.8L13.2 14.2L14.8 11H17.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8.5 20.5H15.5" stroke={activeFill} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect
            x="3.25"
            y="4.25"
            width="17.5"
            height="13.5"
            rx="2.2"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
          <path
            d="M6.8 11H9.3L10.9 8L13.1 14L14.7 11H17.2"
            stroke={inactiveStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 20.5H15" stroke={inactiveStroke} strokeWidth="1.65" strokeLinecap="round" />
        </svg>
      );
    }

    /**
     * 14. MESSAGING / CAMPAIGNS / TRANSFERS (Omnichannel Chat & Dispatch)
     */
    case 'crm-messaging':
    case 'crm-campaigns':
    case 'inv-requisitions': {
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path
              d="M4 6.2C4 4.98 4.98 4 6.2 4H17.8C19.02 4 20 4.98 20 6.2V14.8C20 16.02 19.02 17 17.8 17H9.2L4.8 20.2C4.4 20.5 4 20.2 4 19.7V6.2Z"
              fill={activeFill}
            />
            <path d="M8 9.2H16M8 12.2H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4.25 6.25C4.25 5.15 5.15 4.25 6.25 4.25H17.75C18.85 4.25 19.75 5.15 19.75 6.25V14.75C19.75 15.85 18.85 16.75 17.75 16.75H9.2L4.9 19.9C4.55 20.15 4.25 19.9 4.25 19.45V6.25Z"
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 9.2H15.8M8.2 12.2H12.8"
            stroke={inactiveStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    /**
     * 15. SETTINGS / CONFIGURATION / RULES / CERTIFICATES (8-tooth precision Fluent gear)
     */
    case 'settings':
    default: {
      const maskId = `settings-mask-${uid}`;
      const gearPath =
        'M10.45 2.85C10.58 2.35 11.03 2 11.55 2H12.45C12.97 2 13.42 2.35 13.55 2.85L13.94 4.34C14.48 4.53 14.99 4.8 15.45 5.14L16.92 4.65C17.41 4.49 17.95 4.67 18.25 5.09L18.77 5.83C19.07 6.25 19.05 6.82 18.72 7.21L17.74 8.39C18.01 8.89 18.21 9.43 18.33 10L19.77 10.52C20.25 10.7 20.57 11.16 20.57 11.68V12.32C20.57 12.84 20.25 13.3 19.77 13.48L18.33 14C18.21 14.57 18.01 15.11 17.74 15.61L18.72 16.79C19.05 17.18 19.07 17.75 18.77 18.17L18.25 18.91C17.95 19.33 17.41 19.51 16.92 19.35L15.45 18.86C14.99 19.2 14.48 19.47 13.94 19.66L13.55 21.15C13.42 21.65 12.97 22 12.45 22H11.55C11.03 22 10.58 21.65 10.45 21.15L10.06 19.66C9.52 19.47 9.01 19.2 8.55 18.86L7.08 19.35C6.59 19.51 6.05 19.33 5.75 18.91L5.23 18.17C4.93 17.75 4.95 17.18 5.28 16.79L6.26 15.61C5.99 15.11 5.79 14.57 5.67 14L4.23 13.48C3.75 13.3 3.43 12.84 3.43 12.32V11.68C3.43 11.16 3.75 10.7 4.23 10.52L5.67 10C5.79 9.43 5.99 8.89 6.26 8.39L5.28 7.21C4.95 6.82 4.93 6.25 5.23 5.83L5.75 5.09C6.05 4.67 6.59 4.49 7.08 4.65L8.55 5.14C9.01 4.8 9.52 4.53 10.06 4.34L10.45 2.85Z';
      if (active) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <defs>
              <mask id={maskId}>
                <rect width="24" height="24" fill="white" />
                <circle cx="12" cy="12" r="3.35" fill="black" />
              </mask>
            </defs>
            <path d={gearPath} fill={activeFill} mask={`url(#${maskId})`} />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d={gearPath}
            stroke={inactiveStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3.1"
            stroke={inactiveStroke}
            strokeWidth="1.65"
          />
        </svg>
      );
    }
  }
};

/**
 * Custom-crafted contextual Secondary Sidebar icons with subtle duotone layering
 * to match the Primary Rail icon language across all 14 Suite Apps.
 */
export const PmsSubNavIcon: React.FC<{ itemId: string; active?: boolean; className?: string }> = ({
  itemId,
  active = false,
  className = 'w-4 h-4',
}) => {
  const color = active ? '#316BAA' : '#424242';

  // Matches Annex 2 & Annex 4 card/window icon (solid top header bar + left badge box + 2 right lines)
  if (
    itemId === 'all-reservations' ||
    itemId === 'all-bookings' ||
    itemId.includes('account') ||
    itemId.includes('folio') ||
    itemId.includes('cash') ||
    itemId.includes('tax') ||
    itemId.includes('pos') ||
    itemId.includes('bank') ||
    itemId.includes('pay') ||
    itemId.includes('nf') ||
    itemId.includes('bar')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke={color} strokeWidth="1.4" />
        <path
          d="M2.5 5.5C2.5 4.39543 3.39543 3.5 4.5 3.5H15.5C16.6046 3.5 17.5 4.39543 17.5 5.5V7.2H2.5V5.5Z"
          fill={color}
        />
        <rect x="4.8" y="9" width="2.8" height="5" rx="0.5" stroke={color} strokeWidth="1.25" />
        <path d="M9.6 9.8H14.8M9.6 12.4H13.6" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    );
  }

  if (
    itemId === 'arriving' ||
    itemId.includes('arrival') ||
    itemId.includes('walk-in') ||
    itemId.includes('approved') ||
    itemId.includes('recon') ||
    itemId.includes('emitted')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke={color} strokeWidth="1.4" />
        <path
          d="M2.5 5.5C2.5 4.39543 3.39543 3.5 4.5 3.5H15.5C16.6046 3.5 17.5 4.39543 17.5 5.5V7H2.5V5.5Z"
          fill={color}
        />
        <path d="M7 11.5L9.2 13.7L13.5 9.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (
    itemId === 'inhouse' ||
    itemId.includes('in-house') ||
    itemId.includes('group') ||
    itemId.includes('attendant') ||
    itemId.includes('crm') ||
    itemId.includes('vip') ||
    itemId.includes('roster') ||
    itemId.includes('therapist') ||
    itemId.includes('vendor')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="7.5" cy="7" r="2.6" stroke={color} strokeWidth="1.4" />
        <path d="M2.8 15.8C2.8 13.4 4.9 11.8 7.5 11.8C10.1 11.8 12.2 13.4 12.2 15.8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="13.5" cy="7.8" r="2" stroke={color} strokeWidth="1.35" />
        <path d="M14 11.8C15.9 12.1 17.2 13.4 17.2 15.4" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    );
  }

  if (itemId === 'leaving' || itemId.includes('departure')) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M11 3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V14.5C3.5 15.6046 4.39543 16.5 5.5 16.5H11" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M8 10H16.5M16.5 10L13.5 7M16.5 10L13.5 13" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (
    itemId === 'waitlist' ||
    itemId.includes('waitlist') ||
    itemId.includes('schedule') ||
    itemId.includes('clock') ||
    itemId.includes('timeline') ||
    itemId.includes('pace') ||
    itemId.includes('pickup')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.4" />
        <path d="M10 6.2V10.2L12.8 11.8" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (
    itemId.includes('role') ||
    itemId.includes('audit') ||
    itemId.includes('policies') ||
    itemId.includes('cert') ||
    itemId.includes('guard') ||
    itemId.includes('lgpd') ||
    itemId.includes('parity')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path
          d="M10 2.5L3.75 5.2V9.8C3.75 13.85 6.42 17.48 10 18.5C13.58 17.48 16.25 13.85 16.25 9.8V5.2L10 2.5Z"
          stroke={color}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="9.8" r="1.6" fill={color} />
      </svg>
    );
  }

  if (
    itemId.includes('connector') ||
    itemId.includes('channel') ||
    itemId.includes('catalog') ||
    itemId.includes('ota') ||
    itemId.includes('gds') ||
    itemId.includes('wh-') ||
    itemId.includes('inv-') ||
    itemId.includes('sped')
  ) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <ellipse cx="10" cy="5.2" rx="6.25" ry="2.4" stroke={color} strokeWidth="1.4" />
        <path d="M3.75 5.2V10C3.75 11.33 6.55 12.4 10 12.4C13.45 12.4 16.25 11.33 16.25 10V5.2" stroke={color} strokeWidth="1.4" />
        <path d="M3.75 10V14.8C3.75 16.13 6.55 17.2 10 17.2C13.45 17.2 16.25 16.13 16.25 14.8V10" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="2.2" stroke={color} strokeWidth="1.4" />
      <path d="M6.5 7.5H13.5M6.5 10.5H13.5M6.5 13.5H10.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Waffle 9-dot app switcher icon for the topbar left corner
 */
export const WaffleGridIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <circle cx="3" cy="3" r="1.35" />
    <circle cx="8" cy="3" r="1.35" />
    <circle cx="13" cy="3" r="1.35" />
    <circle cx="3" cy="8" r="1.35" />
    <circle cx="8" cy="8" r="1.35" />
    <circle cx="13" cy="8" r="1.35" />
    <circle cx="3" cy="13" r="1.35" />
    <circle cx="8" cy="13" r="1.35" />
    <circle cx="13" cy="13" r="1.35" />
  </svg>
);

/**
 * Custom Badger Hospitality Crest Logo (Topbar)
 * Pure white (#FFFFFF) and cobalt blue (#005FB8) geometric badger mark
 * designed for high-contrast legibility directly on the topbar.
 */
export const BadgerLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {/* Badger Ears (White Outer Silhouette with Blue Inner Tuft) */}
    <path
      d="M6.2 12.8L4.8 6.8C4.5 5.5 5.7 4.4 6.9 4.95L12.2 7.2L6.2 12.8Z"
      fill="#FFFFFF"
    />
    <path
      d="M25.8 12.8L27.2 6.8C27.5 5.5 26.3 4.4 25.1 4.95L19.8 7.2L25.8 12.8Z"
      fill="#FFFFFF"
    />
    <path d="M7.2 10.1L6.4 6.8L9.8 8.2L7.2 10.1Z" fill="#005FB8" />
    <path d="M24.8 10.1L25.6 6.8L22.2 8.2L24.8 10.1Z" fill="#005FB8" />

    {/* Geometric Badger Head Shield (Pure White Base) */}
    <path
      d="M11.0 7.0C13.7 6.1 18.3 6.1 21.0 7.0L27.0 16.0C27.7 17.05 27.45 18.5 26.4 19.3L19.3 25.2C17.4 26.8 14.6 26.8 12.7 25.2L5.6 19.3C4.55 18.5 4.3 17.05 5.0 16.0L11.0 7.0Z"
      fill="#FFFFFF"
    />

    {/* Left & Right Blue Badger Mask Stripes (Framing the Central White Blaze & Cheek Flares) */}
    <path
      d="M10.8 7.3L14.25 6.75L13.75 21.3L9.6 19.5L7.9 14.9L10.8 7.3Z"
      fill="#005FB8"
    />
    <path
      d="M21.2 7.3L17.75 6.75L18.25 21.3L22.4 19.5L24.1 14.9L21.2 7.3Z"
      fill="#005FB8"
    />

    {/* Crisp White Eyes */}
    <polygon points="9.6,14.2 12.5,15.1 11.7,16.6 9.0,15.7" fill="#FFFFFF" />
    <polygon points="22.4,14.2 19.5,15.1 20.3,16.6 23.0,15.7" fill="#FFFFFF" />

    {/* Blue Badger Snout / Nose Keystone */}
    <path
      d="M13.3 21.4H18.7L17.0 24.5C16.55 25.3 15.45 25.3 15.0 24.5L13.3 21.4Z"
      fill="#005FB8"
    />
  </svg>
);
