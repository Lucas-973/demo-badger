import { Room, RatePlan } from '../types/pms';

const CATALOG_OVERRIDES: Room[] = [
  { id: 'r-101', number: '101', floor: 1, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-102', number: '102', floor: 1, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-104', number: '104', floor: 1, type: 'Deluxe Twin', rate: 680, status: 'vacant-clean' },
  { id: 'r-108', number: '108', floor: 1, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-201', number: '201', floor: 2, type: 'Deluxe Twin', rate: 680, status: 'vacant-clean' },
  { id: 'r-202', number: '202', floor: 2, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-204', number: '204', floor: 2, type: 'Deluxe Twin', rate: 680, status: 'vacant-clean' },
  { id: 'r-210', number: '210', floor: 2, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-301', number: '301', floor: 3, type: 'Executive Suite', rate: 1220, status: 'vacant-clean' },
  { id: 'r-302', number: '302', floor: 3, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-303', number: '303', floor: 3, type: 'Standard King', rate: 540, status: 'vacant-clean' },
  { id: 'r-305', number: '305', floor: 3, type: 'Executive Suite', rate: 1220, status: 'vacant-clean' },
  { id: 'r-308', number: '308', floor: 3, type: 'Deluxe Twin', rate: 680, status: 'vacant-clean' },
  { id: 'r-402', number: '402', floor: 4, type: 'Executive Suite', rate: 1220, status: 'vacant-clean' },
  { id: 'r-404', number: '404', floor: 4, type: 'Deluxe Twin', rate: 680, status: 'vacant-clean' },
  { id: 'r-406', number: '406', floor: 4, type: 'Executive Suite', rate: 1220, status: 'vacant-clean' },
  { id: 'r-501', number: '501', floor: 5, type: 'Oceanfront Villa', rate: 1850, status: 'vacant-clean' },
  { id: 'r-502', number: '502', floor: 5, type: 'Penthouse', rate: 2480, status: 'vacant-clean' },
  { id: 'r-chale-araucarias', number: 'Chalé das Araucárias', floor: 6, type: 'Master Chalet', rate: 1640, status: 'vacant-clean' },
  { id: 'r-chale-bromelias', number: 'Chalé das Bromélias', floor: 6, type: 'Master Chalet', rate: 1590, status: 'vacant-clean' },
  { id: 'r-bangalo-serra', number: 'Bangalô Vista da Serra', floor: 6, type: 'Oceanfront Villa', rate: 1920, status: 'vacant-clean' },
  { id: 'r-cabana-mirante', number: 'Cabana do Mirante', floor: 6, type: 'Master Chalet', rate: 1480, status: 'vacant-clean' },
];

const ROOM_RATES: Record<Room['type'], number> = {
  'Standard King': 540,
  'Deluxe Twin': 680,
  'Executive Suite': 1220,
  'Oceanfront Villa': 1850,
  Penthouse: 2480,
  'Master Chalet': 1600,
};

export const RATE_PLANS: RatePlan[] = [
  { id: 'room-only', name: 'Room only', supplement: 0, breakfast: false, lunch: false, dinner: false },
  { id: 'breakfast', name: 'Bed & breakfast', supplement: 60, breakfast: true, lunch: false, dinner: false },
  { id: 'half-board', name: 'Half board', supplement: 160, breakfast: true, lunch: false, dinner: true },
  { id: 'full-board', name: 'Full board', supplement: 240, breakfast: true, lunch: true, dinner: true },
].map(({ supplement, ...plan }) => ({
  ...plan,
  nightlyRates: Object.fromEntries(
    Object.entries(ROOM_RATES).map(([type, rate]) => [type, rate + supplement])
  ) as Record<Room['type'], number>,
}));

function generatedRoomType(floor: number, slot: number): Room['type'] {
  if (floor === 5) return slot % 4 === 0 ? 'Penthouse' : 'Oceanfront Villa';
  if (slot % 10 === 0 || (floor >= 3 && slot % 7 === 0)) return 'Executive Suite';
  return slot % 3 === 0 ? 'Deluxe Twin' : 'Standard King';
}

// Preserve the original inventory without seeding operational or guest data.
function generateRooms(): Room[] {
  const floors: [number, number][] = [[1, 60], [2, 60], [3, 60], [4, 60], [5, 12]];
  return floors.flatMap(([floor, count]) => Array.from({ length: count }, (_, index): Room => {
    const slot = index + 1;
    const number = `${floor}${String(slot).padStart(2, '0')}`;
    const type = generatedRoomType(floor, slot);
    return { id: `r-${number}`, number, floor, type, rate: ROOM_RATES[type], status: 'vacant-clean' };
  }));
}

const ROOM_ACCOMMODATIONS: Record<
  Room['type'],
  { bedLayout: string; maxGuests: number; bedCharacteristics: string[] }
> = {
  'Standard King': {
    bedLayout: '1 king bed',
    maxGuests: 2,
    bedCharacteristics: ['King bed'],
  },
  'Deluxe Twin': {
    bedLayout: '2 twin beds',
    maxGuests: 2,
    bedCharacteristics: ['Twin beds'],
  },
  'Executive Suite': {
    bedLayout: '1 king bed + 1 double sofa bed',
    maxGuests: 4,
    bedCharacteristics: ['King bed', 'Sofa bed'],
  },
  'Oceanfront Villa': {
    bedLayout: '2 king beds + 2 twin beds',
    maxGuests: 6,
    bedCharacteristics: ['King bed', 'Twin beds'],
  },
  Penthouse: {
    bedLayout: '3 king beds',
    maxGuests: 6,
    bedCharacteristics: ['King bed'],
  },
  'Master Chalet': {
    bedLayout: '1 king bed + 2 twin beds',
    maxGuests: 4,
    bedCharacteristics: ['King bed', 'Twin beds'],
  },
};

function roomCharacteristics(room: Room, index: number): string[] {
  const characteristics = [...ROOM_ACCOMMODATIONS[room.type].bedCharacteristics];

  if (room.floor === 6) characteristics.push('Mountain view', 'Terrace', 'Fireplace');
  else if (room.floor === 5) characteristics.push('Ocean view', 'Balcony');
  else {
    characteristics.push(index % 2 === 0 ? 'Garden view' : 'City view');
    if (room.floor > 1 && index % 3 === 0) characteristics.push('Balcony');
  }

  if (room.floor === 1 && index % 10 === 0) characteristics.push('Accessible');
  if (room.floor <= 4 && index % 4 === 0) characteristics.push('Connecting rooms');
  if (room.type === 'Penthouse' || room.number === 'Bangal\u00f4 Vista da Serra') {
    characteristics.push('Hot tub');
  }
  if (room.type === 'Oceanfront Villa' && room.floor === 5 && index % 2 === 0) {
    characteristics.push('Private pool');
  }

  return characteristics;
}

const overriddenNumbers = new Set(CATALOG_OVERRIDES.map((room) => room.number));

export const INITIAL_ROOMS: Room[] = [
  ...CATALOG_OVERRIDES,
  ...generateRooms().filter((room) => !overriddenNumbers.has(room.number)),
]
  .sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number, 'pt-BR', { numeric: true }))
  .map((room, index) => ({
    ...room,
    bedLayout: ROOM_ACCOMMODATIONS[room.type].bedLayout,
    maxGuests: ROOM_ACCOMMODATIONS[room.type].maxGuests,
    characteristics: roomCharacteristics(room, index),
  }));
