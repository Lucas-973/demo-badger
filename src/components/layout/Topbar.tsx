import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Bell,
  HelpCircle,
  Settings,
  Sparkles,
  KeyRound,
  Building2,
  Plus,
  CalendarClock,
  ArrowUpRight,
  User,
  Shield,
  LogOut,
  Check,
  Wallet,
} from 'lucide-react';
import { BadgerLogo, WaffleGridIcon } from '../icons/PmsIcons';
import { ModuleId, Reservation, Room } from '../../types/pms';
import {
  SuiteAppId,
  SUITE_APPS,
  SuiteAppLauncher,
} from './SuiteAppLauncher';
import { CustomScrollArea } from '../ui/CustomScrollArea';

export type TopbarTheme = 'cobalt' | 'emerald' | 'obsidian';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  reservations: Reservation[];
  rooms: Room[];
  onSelectModule: (moduleId: ModuleId, subItemId?: string) => void;
  onOpenNewBooking: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  topbarTheme: TopbarTheme;
  onChangeTheme: (theme: TopbarTheme) => void;
  activeSuiteAppId: SuiteAppId;
  onSelectSuiteApp: (appId: SuiteAppId) => void;
  defaultLauncherOpen?: boolean;
}

const THEME_CLASSES: Record<TopbarTheme, string> = {
  cobalt: 'bg-[#005FB8] border-b border-[#004C94]',
  emerald: 'bg-[#065F46] border-b border-[#064E3B]',
  obsidian: 'bg-[#0F172A] border-b border-slate-800',
};

const PROPERTIES = [
  {
    name: 'Grand Horizon Resort & Spa',
    rooms: '142 Keys • Florianópolis',
    code: 'PROP-FLN-01',
  },
  {
    name: 'Badger Boutique Jardins',
    rooms: '68 Keys • São Paulo',
    code: 'PROP-SAO-02',
  },
  {
    name: 'Aurora Mountain Lodge',
    rooms: '44 Keys • Gramado',
    code: 'PROP-GRM-03',
  },
];

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  onSearchChange,
  reservations,
  rooms,
  onSelectModule,
  onOpenNewBooking,
  onToggleCopilot,
  isCopilotOpen,
  topbarTheme,
  onChangeTheme,
  activeSuiteAppId,
  onSelectSuiteApp,
}) => {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('Grand Horizon Resort & Spa');

  const searchRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeSuiteMeta =
    SUITE_APPS.find((a) => a.id === activeSuiteAppId) || SUITE_APPS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (launcherRef.current && !launcherRef.current.contains(e.target as Node)) {
        setLauncherOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setLauncherOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredReservations = searchQuery.trim()
    ? reservations
        .filter(
          (r) =>
            r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.roomNumber.includes(searchQuery.trim())
        )
        .slice(0, 4)
    : [];

  const filteredRooms = searchQuery.trim()
    ? rooms
        .filter(
          (rm) =>
            rm.number.includes(searchQuery.trim()) ||
            rm.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rm.guestName && rm.guestName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 3)
    : [];

  return (
    <header
      className={`h-12 w-full pr-3 flex items-center justify-between text-white select-none z-40 transition-colors duration-200 relative ${THEME_CLASSES[topbarTheme]}`}
    >
      {/* Left: Flush 48x48 Dotted App Launcher Button + Suite Popover + Brand Title */}
      <div className="flex items-center h-full min-w-[260px]">
        <div ref={launcherRef} className="relative h-full flex items-center">
          <button
            onClick={() => setLauncherOpen((prev) => !prev)}
            title="Hotel Management Suite App Launcher (Finances, POS, MICE, Revenue...)"
            aria-expanded={launcherOpen}
            className={`w-12 h-12 flex items-center justify-center transition-colors ${
              launcherOpen
                ? 'bg-[#F3F2F1] text-slate-900 shadow-sm'
                : 'text-white hover:bg-white/15 active:bg-white/25'
            }`}
          >
            <WaffleGridIcon className="w-[18px] h-[18px]" />
          </button>

          {/* Suite App Launcher Popover (Matches Reference Image) */}
          <SuiteAppLauncher
            isOpen={launcherOpen}
            activeSuiteAppId={activeSuiteAppId}
            onSelectSuiteApp={onSelectSuiteApp}
            onQuickCreate={() => onOpenNewBooking()}
            onClose={() => setLauncherOpen(false)}
          />
        </div>

        <div className="flex items-center gap-2.5 pl-2.5">
          <span
            onClick={() => onSelectModule('overview')}
            className="font-display font-semibold text-[15px] tracking-tight cursor-pointer hover:opacity-90 flex items-center gap-2"
          >
            <BadgerLogo className="w-[24px] h-[24px] shrink-0 drop-shadow-sm" />
            <span>{activeSuiteMeta.topBarTitle}</span>
          </span>
        </div>
      </div>

      {/* Center: Prominent White Omnibox Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-[460px] mx-4">
        <div
          className={`flex items-center bg-white text-slate-800 rounded-[4px] h-[30px] px-2.5 shadow-inner transition-all ${
            searchFocused ? 'ring-2 ring-sky-300' : ''
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#005FB8] shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guests, #RES-88412, room 402, or financial vouchers..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              /
            </kbd>
          )}
        </div>

        {/* Instant Omnibox Dropdown Results */}
        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white text-slate-800 rounded-lg shadow-elevated border border-slate-200 overflow-hidden z-50">
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Instant Suite Lookup</span>
              <span>Press Esc to close</span>
            </div>

            {filteredReservations.length === 0 && filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching guests, reservations, or rooms for "{searchQuery}".
              </div>
            ) : (
              <CustomScrollArea
                maxHeight="288px"
                viewportClassName="divide-y divide-slate-100"
                gutter="right"
                showTrackWhenIdle={true}
              >
                {filteredReservations.length > 0 && (
                  <div className="p-1.5">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Reservations & Guests
                    </div>
                    {filteredReservations.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => {
                          onSelectModule('front-desk', 'arrivals');
                          setSearchFocused(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-50/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{res.guestName}</span>
                            <span className="font-mono text-[11px] text-[#005FB8] bg-blue-50 px-1.5 rounded">
                              {res.code}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Room {res.roomNumber} ({res.roomType}) • {res.checkIn} → {res.checkOut}
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005FB8]" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredRooms.length > 0 && (
                  <div className="p-1.5">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Rooms
                    </div>
                    {filteredRooms.map((rm) => (
                      <button
                        key={rm.id}
                        onClick={() => {
                          onSelectModule('rooms', 'room-matrix');
                          setSearchFocused(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-50/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            Room {rm.number} — {rm.type}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Status: {rm.status.replace('-', ' ')} • {rm.guestName || 'Vacant'}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-600">
                          R$ {rm.rate}/nt
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CustomScrollArea>
            )}
          </div>
        )}
      </div>

      {/* Right: Operational Actions, Concierge Copilot Pill & System Icons */}
      <div className="flex items-center gap-1.5">
        <div
          title="Active Night Audit Business Date"
          className="hidden xl:flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 px-2.5 py-1 rounded mr-1"
        >
          <CalendarClock className="w-3.5 h-3.5 text-sky-200" />
          <span>Nov 9, 2026</span>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="hidden sm:flex items-center gap-1 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-medium px-2.5 h-[28px] rounded transition-colors border border-white/15 mr-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>

        <div className="flex items-center gap-1.5 mr-1">
          <button
            onClick={() => onSelectModule('front-desk', 'walk-in')}
            title="Express Keycard Encoder"
            className="w-7 h-7 rounded bg-[#D83B8A] hover:bg-[#c22f78] flex items-center justify-center shadow-sm transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-white" />
          </button>

          <button
            onClick={onToggleCopilot}
            className={`h-7 px-2.5 rounded flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all ${
              isCopilotOpen
                ? 'bg-amber-100 text-slate-900 ring-2 ring-amber-300'
                : 'bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D83B8A] fill-[#D83B8A]/20" />
            <span>Copilot</span>
          </button>
        </div>

        <button
          onClick={() => onSelectModule('front-desk', 'arrivals')}
          title="VIP Arrival & Housekeeping Alerts"
          className="relative w-8 h-8 rounded flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <Bell className="w-4 h-4 text-white/95" />
          <span className="absolute top-1 right-1 bg-[#0078D4] border border-white text-white text-[9px] font-bold px-1 rounded-full leading-tight">
            3
          </span>
        </button>

        <button
          onClick={() => onSelectModule('settings', 'account-overview')}
          title="Property & Tenant Settings"
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <Settings className="w-4 h-4 text-white/95" />
        </button>

        <button
          onClick={onToggleCopilot}
          title="PMS Documentation & Support"
          className="hidden sm:flex w-8 h-8 rounded items-center justify-center hover:bg-white/15 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-white/95" />
        </button>

        {/* User Profile Button & Popover Menu */}
        <div ref={userMenuRef} className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            title="Lucas Andrade — Front Office Director"
            aria-expanded={userMenuOpen}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              userMenuOpen
                ? 'bg-white text-[#005FB8] ring-2 ring-white/50 shadow-sm'
                : 'bg-white/20 border border-white/50 text-white hover:bg-white/30'
            }`}
          >
            L
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-elevated border border-slate-200 overflow-hidden z-50">
              <CustomScrollArea
                maxHeight="460px"
                viewportClassName="divide-y divide-slate-100"
                gutter="right"
                showTrackWhenIdle={true}
              >
                {/* User Identity Header */}
                <div className="p-3.5 bg-slate-50/70 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005FB8] text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-sm">
                    LA
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        Lucas Andrade
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        On Duty
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 truncate">
                      Front Office Director
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      lucas.andrade@badgerpms.com
                    </p>
                  </div>
                </div>

                {/* Hotel / Property Switcher (Moved from Topbar) */}
                <div className="py-2">
                  <div className="px-3.5 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Switch Hotel Property
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {PROPERTIES.find((p) => p.name === selectedProperty)?.code}
                    </span>
                  </div>

                  <div className="mt-0.5 space-y-0.5 px-1.5">
                    {PROPERTIES.map((prop) => {
                      const isSelected = selectedProperty === prop.name;
                      return (
                        <button
                          key={prop.name}
                          onClick={() => {
                            setSelectedProperty(prop.name);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 text-[#005FB8]'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-semibold truncate">
                              {prop.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {prop.rooms}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#005FB8]/10 text-[#005FB8] flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* User & Account Quick Links */}
                <div className="py-1.5 px-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectModule('settings', 'account-overview');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account & Property Overview</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectModule('billing', 'cashier-shift');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cashier Shift & Drawer #02</span>
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Open
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectModule('settings', 'front-office-roles');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Roles, Scopes & Override PINs</span>
                  </button>
                </div>

                {/* Topbar Theme Appearance */}
                <div className="py-2.5 px-3.5 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Topbar Theme</span>
                  <div className="flex items-center gap-2">
                    {(
                      [
                        { id: 'cobalt', color: 'bg-[#005FB8]', label: 'Cobalt' },
                        { id: 'emerald', color: 'bg-[#065F46]', label: 'Emerald' },
                        { id: 'obsidian', color: 'bg-[#0F172A]', label: 'Obsidian' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        title={t.label}
                        onClick={() => onChangeTheme(t.id)}
                        className={`w-4 h-4 rounded-full ${t.color} transition-transform ${
                          topbarTheme === t.id
                            ? 'ring-2 ring-offset-1 ring-blue-500 scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sign Out Footer */}
                <div className="p-1.5 bg-slate-50/50">
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out of session</span>
                  </button>
                </div>
              </CustomScrollArea>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
