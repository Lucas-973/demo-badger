import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import {
  LauncherSkeleton,
  LoadingCrossfade,
  LoadingRail,
  useOverlayContentReady,
  useOverlayPresence,
} from '../ui/LoadingState';

export type SuiteAppId =
  | 'pms'
  | 'finances'
  | 'pos'
  | 'events'
  | 'revenue'
  | 'channels'
  | 'crm'
  | 'spa'
  | 'inventory'
  | 'engineering'
  | 'fiscal'
  | 'staff'
  | 'booking-engine'
  | 'analytics';

export interface SuiteAppDefinition {
  id: SuiteAppId;
  name: string;
  topBarTitle: string;
  category: string;
  description: string;
}

export const SUITE_APPS: SuiteAppDefinition[] = [
  {
    id: 'pms',
    name: 'Front Office',
    topBarTitle: 'Badger PMS',
    category: 'Property Operations',
    description: 'Reception, Tape Chart, Rooms & Guest Folios',
  },
  {
    id: 'finances',
    name: 'Finances',
    topBarTitle: 'Badger Finances & ERP',
    category: 'Back Office & Treasury',
    description: 'General Ledger, AP/AR, Cash Flow, DRE & Night Audit Treasury',
  },
  {
    id: 'pos',
    name: 'POS & F&B',
    topBarTitle: 'Badger POS & Dining',
    category: 'Food & Beverage',
    description: 'Restaurants, Room Service, Bar Tabs & Kitchen Display',
  },
  {
    id: 'events',
    name: 'Events & MICE',
    topBarTitle: 'Badger Banquets & MICE',
    category: 'Conferences & Catering',
    description: 'Function Rooms, Banquet Event Orders (BEO) & Group Blocks',
  },
  {
    id: 'revenue',
    name: 'Revenue AI',
    topBarTitle: 'Badger Revenue & Yield',
    category: 'Commercial Strategy',
    description: 'Dynamic BAR Pricing, Forecast Pace & Rate Shopper',
  },
  {
    id: 'channels',
    name: 'Channels',
    topBarTitle: 'Badger Channel Manager',
    category: 'Distribution',
    description: '2-Way OTA Sync (Booking.com, Expedia, Airbnb & GDS)',
  },
  {
    id: 'crm',
    name: 'Guest CRM',
    topBarTitle: 'Badger Guest CRM & Loyalty',
    category: 'Marketing & Loyalty',
    description: 'VIP Profiles, Loyalty Points, WhatsApp & Email Automation',
  },
  {
    id: 'spa',
    name: 'Spa & Club',
    topBarTitle: 'Badger Spa & Leisure',
    category: 'Wellness & Recreation',
    description: 'Therapist Schedules, Treatment Cabins & Day-Use Passes',
  },
  {
    id: 'inventory',
    name: 'Purchasing',
    topBarTitle: 'Badger Stock & Procurement',
    category: 'Supply Chain',
    description: 'Warehouse Inventory, F&B Costing, Recipes & Supplier POs',
  },
  {
    id: 'engineering',
    name: 'Maintenance',
    topBarTitle: 'Badger Engineering & Assets',
    category: 'Facilities',
    description: 'Preventive Maintenance, Work Orders & Smart Room IoT',
  },
  {
    id: 'fiscal',
    name: 'Fiscal & Tax',
    topBarTitle: 'Badger Fiscal Hub',
    category: 'Tax Compliance',
    description: 'Automated NF-e, NFS-e, SPED Fiscal & Municipal ISS',
  },
  {
    id: 'staff',
    name: 'Workforce',
    topBarTitle: 'Badger Staff & Rosters',
    category: 'Human Resources',
    description: 'Shift Scheduling, Attendant Mobile App & Commission Split',
  },
  {
    id: 'booking-engine',
    name: 'Direct Web',
    topBarTitle: 'Badger Direct Booking',
    category: 'E-Commerce',
    description: 'Direct Website Booking Funnel, Vouchers & Corporate Portal',
  },
  {
    id: 'analytics',
    name: 'BI Insights',
    topBarTitle: 'Badger Hospitality BI',
    category: 'Executive Intelligence',
    description: 'Multi-Property USALI Statements, RevPAR & GOPPAR Benchmarks',
  },
];

/**
 * Custom-crafted, original Hospitality Suite Icons.
 * Uses cohesive sculpted squircle tiles + bespoke domain metaphors
 * (Reception Bell & Keycard, Vault & Yield Curve, Dining Cloche, Banquet Chandelier,
 * Spa Stones, RFID Lock, Tax Seal, etc.) with zero Microsoft Office letter-badge clones.
 */
export const SuiteAppGraphicIcon: React.FC<{ id: SuiteAppId; className?: string }> = ({
  id,
  className = 'w-10 h-10',
}) => {
  switch (id) {
    case 'pms':
      // Front Office: Sculpted Cobalt Tile + Reception Concierge Bell & Golden Keycard
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#pmsBg)" />
          {/* Reception Bell Dome */}
          <path
            d="M11 25C11 20.0294 15.0294 16 20 16C24.9706 16 29 20.0294 29 25H11Z"
            fill="white"
          />
          <rect x="18" y="12.5" width="4" height="2" rx="1" fill="#93C5FD" />
          <rect x="9.5" y="25" width="21" height="3" rx="1.5" fill="#BFDBFE" />
          {/* Floating Gold VIP Keycard Accent */}
          <rect
            x="22"
            y="8"
            width="11"
            height="7.5"
            rx="2"
            transform="rotate(12 22 8)"
            fill="#FBBF24"
            stroke="#005FB8"
            strokeWidth="1.2"
          />
          <circle cx="25.5" cy="11.8" r="1" fill="#78350F" />
          <defs>
            <linearGradient id="pmsBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#005FB8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'finances':
      // Finances & ERP: Emerald Treasury Tile + Stacked Gold Coins & Rising Cashflow Wave
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#finBg)" />
          {/* Rising Yield Bars */}
          <rect x="11" y="21" width="4" height="8" rx="1.5" fill="#A7F3D0" fillOpacity="0.65" />
          <rect x="17" y="16" width="4" height="13" rx="1.5" fill="#A7F3D0" fillOpacity="0.85" />
          <rect x="23" y="11" width="4" height="18" rx="1.5" fill="white" />
          {/* Gold Treasury Coin Emblem */}
          <circle cx="27.5" cy="25.5" r="5.5" fill="#FBBF24" stroke="#065F46" strokeWidth="1.4" />
          <path
            d="M27.5 22.8V28.2M26 24.3C26 23.6 29 23.6 29 24.8C29 25.9 26 25.6 26 26.8C26 27.8 29 27.7 29 26.9"
            stroke="#78350F"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="finBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'pos':
      // POS & F&B: Warm Terracotta Tile + Fine Dining Cloche Platter & Steam
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#posBg)" />
          {/* Cloche Handle */}
          <circle cx="20" cy="12.5" r="2" fill="#FED7AA" />
          {/* Cloche Dome */}
          <path
            d="M10.5 24.5C10.5 19.2533 14.7533 15 20 15C25.2467 15 29.5 19.2533 29.5 24.5H10.5Z"
            fill="white"
          />
          {/* Platter Base */}
          <rect x="8.5" y="25.5" width="23" height="2.8" rx="1.4" fill="#FFEDD5" />
          {/* Subtle Specular Curve */}
          <path
            d="M14 21.5C14.8 18.8 17 17.5 19.5 17.2"
            stroke="#F97316"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="posBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'events':
      // Events & MICE: Royal Plum Tile + Grand Ballroom Chandelier / Champagne Toast
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#evtBg)" />
          {/* Chandelier / Ballroom Crown */}
          <path d="M20 9V14" stroke="#E9D5FF" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12 20C12 16.5 15.5 14 20 14C24.5 14 28 16.5 28 20H12Z"
            fill="white"
          />
          <path
            d="M10 23.5C13 25.5 16.5 26.5 20 26.5C23.5 26.5 27 25.5 30 23.5"
            stroke="#FDE047"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="14" cy="28.5" r="1.5" fill="#FDE047" />
          <circle cx="20" cy="29.5" r="1.8" fill="white" />
          <circle cx="26" cy="28.5" r="1.5" fill="#FDE047" />
          <defs>
            <linearGradient id="evtBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9333EA" />
              <stop offset="1" stopColor="#581C87" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'revenue':
      // Revenue AI: Indigo-Violet Tile + Dynamic Pricing Pulse & AI Sparkle Star
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#revBg)" />
          {/* Dynamic Rate Curve */}
          <path
            d="M9.5 26.5L15.5 20.5L20.5 23.5L28.5 14.5"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="20.5" r="2.2" fill="#38BDF8" />
          <circle cx="28.5" cy="14.5" r="2.8" fill="#FBBF24" />
          {/* AI 4-Point Sparkle */}
          <path
            d="M14 10L15 12.5L17.5 13.5L15 14.5L14 17L13 14.5L10.5 13.5L13 12.5L14 10Z"
            fill="#FDE047"
          />
          <defs>
            <linearGradient id="revBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'channels':
      // Channel Manager: Ocean Teal Tile + Global OTA Distribution Hub Nodes
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#chnBg)" />
          <circle cx="20" cy="20" r="9.5" stroke="#99F6E4" strokeWidth="1.6" strokeDasharray="3 2" />
          {/* Central Hotel Hub */}
          <circle cx="20" cy="20" r="4" fill="white" />
          {/* Connected OTA Satellite Nodes */}
          <line x1="20" y1="16" x2="20" y2="10.5" stroke="white" strokeWidth="1.8" />
          <line x1="23.5" y1="22" x2="28" y2="25" stroke="white" strokeWidth="1.8" />
          <line x1="16.5" y1="22" x2="12" y2="25" stroke="white" strokeWidth="1.8" />
          <circle cx="20" cy="10" r="2.6" fill="#FDE047" />
          <circle cx="28.5" cy="25.5" r="2.6" fill="#5EEAD4" />
          <circle cx="11.5" cy="25.5" r="2.6" fill="#5EEAD4" />
          <defs>
            <linearGradient id="chnBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0D9488" />
              <stop offset="1" stopColor="#115E59" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'crm':
      // Guest CRM & Loyalty: Crimson-Rose Tile + VIP Diamond & Loyalty Heart
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#crmBg)" />
          {/* VIP Crown / Heart Silhouette */}
          <path
            d="M20 29.5C20 29.5 10.5 23.6 10.5 16.8C10.5 13.8 12.9 11.5 15.8 11.5C17.6 11.5 19.1 12.4 20 13.8C20.9 12.4 22.4 11.5 24.2 11.5C27.1 11.5 29.5 13.8 29.5 16.8C29.5 23.6 20 29.5 20 29.5Z"
            fill="white"
          />
          <path
            d="M16.5 17.5L20 14L23.5 17.5L20 22.5L16.5 17.5Z"
            fill="#F43F5E"
          />
          <defs>
            <linearGradient id="crmBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#9F1239" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'spa':
      // Spa & Leisure: Aqua-Sage Tile + Stacked Zen Hot Stones & Lotus Leaf
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#spaBg)" />
          {/* Zen Stacked Stones */}
          <ellipse cx="20" cy="27.5" rx="9" ry="3.2" fill="white" />
          <ellipse cx="20" cy="22" rx="6.5" ry="2.6" fill="#CCFBF1" />
          <ellipse cx="20" cy="17.2" rx="4.2" ry="2" fill="white" />
          {/* Bamboo / Lotus Leaf Accent */}
          <path
            d="M23 13.5C25.5 10.5 29.5 10.5 30 13.5C27.5 15.5 24.5 15 23 13.5Z"
            fill="#FDE047"
          />
          <defs>
            <linearGradient id="spaBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'inventory':
      // Purchasing & Inventory: Warm Amber-Bronze Tile + Isometric Supply Cube & Check
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#invBg)" />
          {/* Isometric Parcel Box */}
          <path d="M20 10L30 15.5L20 21L10 15.5L20 10Z" fill="#FEF3C7" />
          <path d="M10 15.5L20 21V30.5L10 25V15.5Z" fill="white" />
          <path d="M30 15.5L20 21V30.5L30 25V15.5Z" fill="#FDE68A" />
          <path d="M15 12.8L25 18.2" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
          <defs>
            <linearGradient id="invBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'engineering':
      // Maintenance & Engineering: Slate-Steel Tile + Wrench & Smart Room Bolt
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#engBg)" />
          {/* Precision Wrench / Gear */}
          <path
            d="M24.5 11.5C22.2 11.5 20.3 13.1 19.8 15.3L11.8 23.3C10.9 24.2 10.9 25.6 11.8 26.5L13.5 28.2C14.4 29.1 15.8 29.1 16.7 28.2L24.7 20.2C26.9 19.7 28.5 17.8 28.5 15.5C28.5 14.7 28.3 14 27.9 13.3L25.5 15.7L24.3 14.5L26.7 12.1C26 11.7 25.3 11.5 24.5 11.5Z"
            fill="white"
          />
          <circle cx="14.2" cy="25.8" r="1.2" fill="#334155" />
          <defs>
            <linearGradient id="engBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#64748B" />
              <stop offset="1" stopColor="#334155" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'fiscal':
      // Fiscal & Tax (NF-e): Deep Sky Tile + Fiscal Invoice Scroll & Verified Seal
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#fisBg)" />
          {/* Fiscal Receipt with Zig-Zag Bottom */}
          <path
            d="M12 10.5C12 9.67157 12.6716 9 13.5 9H26.5C27.3284 9 28 9.67157 28 10.5V29.5L25.3 27.7L22.6 29.5L20 27.7L17.4 29.5L14.7 27.7L12 29.5V10.5Z"
            fill="white"
          />
          <path d="M15.5 14H24.5M15.5 17.5H24.5M15.5 21H20" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
          {/* Verified Tax Stamp */}
          <circle cx="25.5" cy="23.5" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.2" />
          <path d="M23.8 23.5L25 24.7L27.4 22.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="fisBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'staff':
      // Workforce & Housekeeping Rosters: Periwinkle Tile + Staff ID Badge & Shift Clock
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#stfBg)" />
          <rect x="11" y="12" width="18" height="17" rx="3" fill="white" />
          <rect x="17" y="9" width="6" height="4.5" rx="1.5" fill="#C7D2FE" />
          <circle cx="16.5" cy="18.5" r="2.3" fill="#4F46E5" />
          <path d="M13.5 24.5C13.5 22.6 15 21.8 16.5 21.8C18 21.8 19.5 22.6 19.5 24.5" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M21.5 17.5H26M21.5 21H25" stroke="#818CF8" strokeWidth="1.6" strokeLinecap="round" />
          <defs>
            <linearGradient id="stfBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'booking-engine':
      // Direct Web Booking Engine: Cyan-Blue Tile + Direct Browser Portal & Check-In Cursor
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#webBg)" />
          <rect x="9.5" y="11" width="21" height="17" rx="3" fill="white" />
          <path d="M9.5 15.5H30.5" stroke="#BAE6FD" strokeWidth="1.5" />
          <circle cx="12.5" cy="13.2" r="1" fill="#0284C7" />
          <circle cx="15.2" cy="13.2" r="1" fill="#38BDF8" />
          {/* Direct Booking CTA Pill inside browser */}
          <rect x="13" y="18.5" width="14" height="5.5" rx="2" fill="#0284C7" />
          {/* Pointer Click Arrow */}
          <path d="M24 22L29.5 24.5L26.8 26.2L28.2 29L26.5 29.8L25 27L23.5 28.8V22Z" fill="#FBBF24" stroke="#0C4A6E" strokeWidth="0.8" />
          <defs>
            <linearGradient id="webBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'analytics':
      // BI Insights: Deep Navy & Gold Tile + Multi-Property Skyline & Gauge
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="9" fill="url(#biBg)" />
          <path
            d="M11 26C11 21.0294 15.0294 17 20 17C24.9706 17 29 21.0294 29 26"
            stroke="#FDE68A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M11 26C11 21.0294 15.0294 17 20 17C22.8 17 25.3 18.2 27 20.2"
            stroke="#FBBF24"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Gauge Needle */}
          <path d="M20 26L25 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="26" r="2.5" fill="white" />
          <defs>
            <linearGradient id="biBg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};

interface SuiteAppLauncherProps {
  isOpen: boolean;
  activeSuiteAppId: SuiteAppId;
  onSelectSuiteApp: (appId: SuiteAppId) => void;
  onQuickCreate: (actionType: 'reservation' | 'voucher' | 'event' | 'po') => void;
  onClose: () => void;
}

/**
 * Hotel Management Suite App Launcher Popover
 * Preserves the clean 5-column layout and quick-create strip from the reference,
 * now powered by 100% original Badger Hospitality icons.
 */
export const SuiteAppLauncher: React.FC<SuiteAppLauncherProps> = ({
  isOpen,
  activeSuiteAppId,
  onSelectSuiteApp,
  onQuickCreate,
  onClose,
}) => {
  const [filter, setFilter] = useState('');
  const [showAllInfo, setShowAllInfo] = useState(false);
  const { mounted, shown } = useOverlayPresence(isOpen, 160);
  const { ready: contentReady, cycle } = useOverlayContentReady(isOpen, 420);

  if (!mounted) return null;

  const filteredApps = SUITE_APPS.filter(
    (app) =>
      !filter.trim() ||
      app.name.toLowerCase().includes(filter.toLowerCase()) ||
      app.category.toLowerCase().includes(filter.toLowerCase()) ||
      app.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      aria-busy={!contentReady}
      className={`absolute left-1.5 top-[48px] w-[480px] sm:w-[515px] bg-white text-slate-800 rounded-xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-200/90 overflow-hidden z-50 select-none transition duration-150 ease-out motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      {!contentReady && <LoadingRail label="Loading suite apps" />}
      <LoadingCrossfade
        ready={contentReady}
        resetKey={String(cycle)}
        fallback={<LauncherSkeleton />}
      >
      <CustomScrollArea
        maxHeight="calc(100vh - 64px)"
        viewportClassName="p-5"
        gutter="right"
        showTrackWhenIdle={true}
      >
      {/* Top Search Bar */}
      <div className="flex items-center bg-[#F3F2F1] hover:bg-[#EDEBE9] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#005FB8] rounded-md px-3 h-9 transition-all">
        <Search className="w-4 h-4 text-[#005FB8] mr-2.5 shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Find Hotel Management Suite modules (Finances, POS, MICE...)"
          className="w-full bg-transparent text-[13px] text-slate-800 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* 5-Column Grid of Original Hospitality Suite Modules */}
      <div className="mt-5 grid grid-cols-5 gap-y-4 gap-x-2">
        {filteredApps.map((app) => {
          const isCurrent = app.id === activeSuiteAppId;
          return (
            <button
              key={app.id}
              onClick={() => {
                onSelectSuiteApp(app.id);
                onClose();
              }}
              title={`${app.topBarTitle} — ${app.description}`}
              className={`group flex flex-col items-center justify-start p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-blue-50/90 ring-1 ring-blue-200'
                  : 'hover:bg-slate-100/90'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                <SuiteAppGraphicIcon id={app.id} className="w-10 h-10" />
              </div>
              <span
                className={`mt-1.5 text-[11.5px] leading-tight text-center ${
                  isCurrent ? 'font-bold text-[#005FB8]' : 'font-normal text-slate-700'
                }`}
              >
                {app.name}
              </span>
            </button>
          );
        })}

        {/* 15th Tile: "More Modules" */}
        <button
          onClick={() => setShowAllInfo((prev) => !prev)}
          className="group flex flex-col items-center justify-start p-2 rounded-lg hover:bg-slate-100/90 transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center text-slate-600 group-hover:text-[#005FB8] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
              <rect x="6" y="7" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
              <rect x="6" y="20" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
              <rect x="19" y="20" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
              <rect
                x="23.5"
                y="5.5"
                width="9.5"
                height="9.5"
                rx="2.5"
                transform="rotate(25 23.5 5.5)"
                stroke="currentColor"
                strokeWidth="2.2"
              />
            </svg>
          </div>
          <span className="mt-1.5 text-[11.5px] leading-tight text-center text-slate-700">
            More Modules
          </span>
        </button>
      </div>

      {showAllInfo && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span>
            <strong>Badger Enterprise Suite v4.2:</strong> All 14 hospitality modules are provisioned for{' '}
            <em>Desbravador Software Ltda</em>.
          </span>
          <span className="text-[#005FB8] font-semibold shrink-0 ml-2">SSO Active</span>
        </div>
      )}

      {/* Horizontal Divider */}
      <hr className="my-5 border-slate-200" />

      {/* Bottom 5-Column Quick Create Row with Custom Hospitality Mini-Emblems */}
      <div className="grid grid-cols-5 gap-2">
        {/* 1. Walk-In / Booking Folio */}
        <button
          onClick={() => {
            onQuickCreate('reservation');
            onClose();
          }}
          className="group flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-100/90 transition-colors"
        >
          <div className="relative w-14 h-12 flex items-center justify-center">
            <div className="w-9 h-11 rounded border border-slate-200 bg-slate-50 p-1.5 shadow-sm flex flex-col gap-1">
              <div className="h-2.5 rounded-[2px] bg-blue-100" />
              <div className="flex-1 rounded-[2px] bg-blue-50" />
            </div>
            <div className="absolute left-0.5 bottom-0.5 w-5 h-5 rounded-md bg-[#005FB8] shadow border border-white flex items-center justify-center">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <circle cx="4.5" cy="6" r="2" stroke="white" strokeWidth="1.3" />
                <path d="M6.5 6H10.5M9 6V8" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <span className="mt-1.5 text-[11.5px] text-slate-700 text-center leading-tight">
            Booking Folio
          </span>
        </button>

        {/* 2. Financial Voucher / DRE */}
        <button
          onClick={() => {
            onSelectSuiteApp('finances');
            onClose();
          }}
          className="group flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-100/90 transition-colors"
        >
          <div className="relative w-14 h-12 flex items-center justify-center">
            <div className="w-11 h-10 rounded border border-slate-200 bg-slate-50 p-1.5 shadow-sm flex items-end gap-1">
              <div className="w-2 h-3 bg-emerald-200 rounded-[1px]" />
              <div className="w-2 h-5 bg-emerald-300 rounded-[1px]" />
              <div className="w-2 h-7 bg-emerald-400 rounded-[1px]" />
            </div>
            <div className="absolute left-0.5 bottom-0.5 w-5 h-5 rounded-md bg-emerald-600 shadow border border-white flex items-center justify-center text-white text-[9px] font-bold">
              $
            </div>
          </div>
          <span className="mt-1.5 text-[11.5px] text-slate-700 text-center leading-tight">
            DRE & Voucher
          </span>
        </button>

        {/* 3. Banquet Event BEO */}
        <button
          onClick={() => {
            onSelectSuiteApp('events');
            onClose();
          }}
          className="group flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-100/90 transition-colors"
        >
          <div className="relative w-14 h-12 flex items-center justify-center">
            <div className="w-11 h-10 rounded border border-slate-200 bg-slate-50 p-1.5 shadow-sm flex gap-1">
              <div className="w-2.5 bg-purple-100 rounded-[1px]" />
              <div className="flex-1 bg-purple-100/80 rounded-[2px]" />
            </div>
            <div className="absolute left-0.5 bottom-0.5 w-5 h-5 rounded-md bg-purple-700 shadow border border-white flex items-center justify-center">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M6 2L7.2 4.8L10 6L7.2 7.2L6 10L4.8 7.2L2 6L4.8 4.8L6 2Z" fill="#FDE047" />
              </svg>
            </div>
          </div>
          <span className="mt-1.5 text-[11.5px] text-slate-700 text-center leading-tight">
            Banquet BEO
          </span>
        </button>

        {/* 4. Stock Purchase Order */}
        <button
          onClick={() => {
            onSelectSuiteApp('inventory');
            onClose();
          }}
          className="group flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-100/90 transition-colors"
        >
          <div className="relative w-14 h-12 flex items-center justify-center">
            <div className="w-9 h-11 rounded border border-slate-200 bg-slate-50 p-1.5 shadow-sm flex flex-col gap-1">
              <div className="h-2 bg-amber-100 rounded-[1px]" />
              <div className="h-1.5 bg-amber-100/80 rounded-[1px]" />
              <div className="h-1.5 bg-amber-100/80 rounded-[1px]" />
            </div>
            <div className="absolute left-0.5 bottom-0.5 w-5 h-5 rounded-md bg-amber-600 shadow border border-white flex items-center justify-center">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <span className="mt-1.5 text-[11.5px] text-slate-700 text-center leading-tight">
            Purchase Order
          </span>
        </button>

        {/* 5. Create More (+) */}
        <button
          onClick={() => {
            onQuickCreate('reservation');
            onClose();
          }}
          className="group flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-100/90 transition-colors"
        >
          <div className="w-14 h-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-slate-500 group-hover:border-[#005FB8] flex items-center justify-center text-slate-600 group-hover:text-[#005FB8] transition-colors">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <span className="mt-1.5 text-[11.5px] text-slate-700 text-center leading-tight">
            Create more
          </span>
        </button>
      </div>
      </CustomScrollArea>
      </LoadingCrossfade>
    </div>
  );
};
