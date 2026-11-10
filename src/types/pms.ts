export type PmsCoreModuleId =
  | 'overview'
  | 'tape-chart'
  | 'front-desk'
  | 'reservations'
  | 'rooms'
  | 'billing'
  | 'finances'
  | 'settings';

export type ModuleId = PmsCoreModuleId | (string & {});

export interface SubNavItem {
  id: string;
  label: string;
  tooltip?: string;
  badge?: string | number;
  badgeTone?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  children?: {
    id: string;
    label: string;
    tooltip?: string;
    badge?: string | number;
  }[];
}

export interface SubNavGroup {
  groupTitle?: string;
  items: SubNavItem[];
}

export interface NavigationModule {
  id: ModuleId;
  label: string;
  shortLabel: string;
  description: string;
  /**
   * Optional subtitle shown under the module header in the Secondary Sidebar.
   */
  categoryLabel?: string;
  /**
   * Optional status box metadata at the bottom of the Secondary Sidebar.
   */
  statusTitle?: string;
  statusDetail?: string;
  /**
   * Tooltip content for the module in the Primary Rail sidebar.
   */
  tooltip?: string;
  /**
   * Determines whether the contextual secondary sidebar is needed for this module.
   * For example, Overview and Tape Chart use 100% full width without a secondary sidebar,
   * Rooms also uses the full width; Front Desk, Reservations, Billing, Settings,
   * and all Suite rails display contextual trees.
   */
  requiresSecondarySidebar: boolean;
  groups?: SubNavGroup[];
}

export type RoomStatus = 'vacant-clean' | 'vacant-dirty' | 'occupied-clean' | 'occupied-dirty' | 'inspect' | 'out-of-order';

export interface Room {
  id: string;
  number: string;
  floor: number;
  bedLayout?: string;
  maxGuests?: number;
  type: 'Standard King' | 'Deluxe Twin' | 'Executive Suite' | 'Oceanfront Villa' | 'Penthouse' | 'Master Chalet';
  rate: number;
  status: RoomStatus;
  guestName?: string;
  reservationId?: string;
  checkIn?: string;
  checkOut?: string;
  vipLevel?: 'VIP-1' | 'VIP-2' | 'Diamond' | null;
  attendant?: string;
  notes?: string;
  outOfOrderPeriod?: { startDate: string; endDate: string };
  characteristics?: string[];
}

export type ReservationStatus = 'arriving' | 'checked-in' | 'departing' | 'confirmed' | 'checked-out';

export interface ReservationGuest {
  name: string;
  isPrimary: boolean;
  type: 'adult' | 'child';
}

export interface ReservationDay {
  date: string;
  rate: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface RatePlan {
  id: string;
  name: string;
  nightlyRates: Record<Room['type'], number>;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface ReservationKeyEncoding {
  encoder: string;
  keyCount: number;
  encodedAt: string;
  mode: 'demo';
}

export interface Reservation {
  id: string;
  code: string;
  guestName: string;
  guestEmail: string;
  guests?: ReservationGuest[];
  dailyRates?: ReservationDay[];
  vip?: string;
  roomNumber: string;
  roomType: Room['type'];
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: ReservationStatus;
  channel: 'Direct Web' | 'Booking.com' | 'Expedia' | 'Corporate GDS' | 'Walk-In';
  totalAmount: number;
  balanceDue: number;
  specialRequests?: string[];
  keyEncoding?: ReservationKeyEncoding;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: Room['type'];
  status: RoomStatus;
  priority: 'Urgent (Arrival)' | 'VIP Turn' | 'Standard' | 'Late Checkout';
  assignedTo: string;
  targetTime: string;
  credits: number;
}
