import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, CalendarDays, Check, Footprints, Info, KeyRound, Plus, Receipt, Trash2, Users, X } from 'lucide-react';
import { Reservation, ReservationDay, ReservationKeyEncoding, Room } from '../../types/pms';
import { useOverlayPresence } from '../ui/LoadingState';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { RATE_PLANS } from '../../data/roomCatalog';
import { useDialogFocus } from './useDialogFocus';
import { KeyEncodingStep } from './KeyEncodingStep';

export interface WalkInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  reservations: Reservation[];
  initialRoomId?: string;
  onCreateReservation: (reservation: Reservation) => void;
  onEncodeKeys: (reservationId: string, encoding: ReservationKeyEncoding) => void;
}

// Date-only arithmetic avoids daylight-saving shifts and UTC/local date mismatches.
function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function addDays(date: string, days: number) {
  const value = new Date(date + 'T12:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
function stayDates(start: string, end: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end) || end <= start) return [];
  const count = Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (value: number) => currencyFormatter.format(value);
const weekdayFormatter = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' });
const dateLabel = (date: string) => `${date.split('-').reverse().join('/')} ${weekdayFormatter.format(new Date(date + 'T12:00:00Z')).toUpperCase()}`;
const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500';
const meals = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
] as const;
type DayInput = { rate: string; breakfast: boolean; lunch: boolean; dinner: boolean };
const EMPTY_DAY: DayInput = { rate: '', breakfast: false, lunch: false, dinner: false };


interface DailyRateRowProps {
  date: string;
  day: DayInput;
  updateDay: (date: string, update: Partial<DayInput>) => void;
  fillBelow: (date: string, field?: keyof DayInput) => void;
  hasRowsBelow: boolean;
}

const DailyRateRow = memo(function DailyRateRow({ date, day, updateDay, fillBelow, hasRowsBelow }: DailyRateRowProps) {
  const label = useMemo(() => dateLabel(date), [date]);
  return (
    <tr>
      <th scope="row" className="px-1.5 py-2 text-left text-[11px] font-medium leading-4 tabular-nums text-slate-700">
        {label}
      </th>
      <td colSpan={2} className="group/rate px-1 py-1.5">
        <div className="flex items-center gap-1">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 focus-within:border-[#005FB8] focus-within:ring-2 focus-within:ring-blue-100">
          <span aria-hidden="true" className="shrink-0 text-[11px] text-slate-500">R$</span>
          <input
            id={`rate-${date}`}
            aria-label={`Room rate for ${label} in Brazilian reais`}
            type="number" min="0" step="0.01" required inputMode="decimal"
            value={day.rate}
            onChange={(event) => updateDay(date, { rate: event.target.value })}
            placeholder="0.00"
            className="h-full w-full min-w-0 bg-transparent text-right text-xs tabular-nums text-slate-900 outline-none placeholder:text-slate-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        {hasRowsBelow ? (
          <button
            type="button"
            title="Fill all rates below with this value"
            aria-label={`Fill all rates below ${label} with this value`}
            disabled={!day.rate.trim() || !Number.isFinite(Number(day.rate)) || Number(day.rate) < 0}
            onClick={() => fillBelow(date)}
            className="flex h-8 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 hover:bg-blue-50 hover:text-[#005FB8] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] group-hover/rate:opacity-100 disabled:cursor-not-allowed disabled:text-slate-200 [@media(hover:none)]:opacity-100"
          >
            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        ) : <span aria-hidden="true" className="h-8 w-5 shrink-0" />}
        </div>
      </td>
      {meals.map(({ key, label: mealLabel }) => (
        <td key={key} className="px-1.5 py-1.5">
          <div className="group/meal relative flex h-8 items-center justify-center">
          <label className="flex h-8 w-6 cursor-pointer items-center justify-center">
            <input
              type="checkbox" checked={day[key]}
              aria-label={`${mealLabel} for ${label}`}
              onChange={(event) => updateDay(date, { [key]: event.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-white hover:border-[#005FB8] peer-checked:border-[#005FB8] peer-checked:bg-[#005FB8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#005FB8] peer-focus-visible:ring-offset-2"
            >
              {day[key] && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
            </span>
          </label>
          {hasRowsBelow && (
            <button
              type="button"
              title={`Copy ${mealLabel.toLowerCase()} selection to all days below`}
              aria-label={`Set ${mealLabel.toLowerCase()} ${day[key] ? 'included' : 'not included'} for all days below ${label}`}
              onClick={() => fillBelow(date, key)}
              className="absolute right-0 top-1 flex h-6 w-4 items-center justify-center rounded text-slate-400 opacity-0 hover:bg-blue-50 hover:text-[#005FB8] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] group-hover/meal:opacity-100 [@media(hover:none)]:opacity-100"
            >
              <ArrowDown aria-hidden="true" className="h-3 w-3" />
            </button>
          )}
          </div>
        </td>
      ))}
    </tr>
  );
});

export function NewBookingModal(props: WalkInDialogProps) {
  const { mounted, shown } = useOverlayPresence(props.isOpen, 200);
  if (!mounted) return null;
  return <WalkInForm {...props} shown={shown} />;
}

function WalkInForm({ onClose, rooms, reservations, initialRoomId, onCreateReservation, onEncodeKeys, shown }: WalkInDialogProps & { shown: boolean }) {
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [today] = useState(localToday);
  const [checkOut, setCheckOut] = useState(() => addDays(localToday(), 1));
  const [guests, setGuests] = useState<{ id: number; name: string; type: 'adult' | 'child' }[]>([
    { id: 1, name: '', type: 'adult' },
  ]);
  const [primaryId, setPrimaryId] = useState(1);
  const nextGuestId = useRef(2);
  const [days, setDays] = useState<Record<string, DayInput>>({});
  const [stayTotal, setStayTotal] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useDialogFocus(onClose);
  useEffect(() => {
    if (createdReservation) dialogRef.current?.focus({ preventScroll: true });
  }, [createdReservation, dialogRef]);
  const dates = useMemo(() => stayDates(today, checkOut), [today, checkOut]);
  const availableRooms = useMemo(() => {
    const blockedRooms = new Set(reservations.filter((reservation) =>
      reservation.status !== 'checked-out' &&
      (reservation.status === 'arriving' || reservation.status === 'checked-in' || reservation.status === 'departing' ||
        (reservation.checkIn < checkOut && reservation.checkOut > today))
    ).map((reservation) => reservation.roomNumber));
    return rooms.filter((room) => room.status === 'vacant-clean' && !blockedRooms.has(room.number));
  }, [rooms, reservations, today, checkOut]);
  const selectedRoom = initialRoomId
    ? availableRooms.find((room) => room.id === initialRoomId)
    : availableRooms.find((room) => !room.maxGuests || room.maxGuests >= guests.length);
  const primary = guests.find((guest) => guest.id === primaryId)!;
  const matchingPlanId = useMemo(() => {
    if (!selectedRoom || !dates.length) return '';
    return RATE_PLANS.find((plan) => dates.every((date) => {
      const day = days[date];
      return day && day.rate.trim() !== '' && Number(day.rate) === plan.nightlyRates[selectedRoom.type] &&
        day.breakfast === plan.breakfast && day.lunch === plan.lunch && day.dinner === plan.dinner;
    }))?.id ?? '';
  }, [selectedRoom, dates, days]);
  const totalCents = dates.reduce((sum, date) => sum + Math.round(Number(days[date]?.rate || 0) * 100), 0);
  useEffect(() => {
    setStayTotal(Number.isFinite(totalCents) ? (totalCents / 100).toFixed(2) : '');
  }, [totalCents]);
  const requestedTotalCents = Math.round(Number(stayTotal) * 100);
  const canDistribute = dates.length > 0 && stayTotal.trim() !== '' &&
    Number.isSafeInteger(requestedTotalCents) && requestedTotalCents >= 0;
  const capacityExceeded = Boolean(selectedRoom?.maxGuests && guests.length > selectedRoom.maxGuests);
  const ratesComplete = dates.length > 0 && dates.every((date) => {
    const rate = days[date]?.rate;
    return rate !== undefined && rate.trim() !== '' && Number.isFinite(Number(rate)) && Number(rate) >= 0;
  });

  const updateDay = useCallback((date: string, update: Partial<DayInput>) => {
    setDays((current) => ({ ...current, [date]: { ...(current[date] ?? EMPTY_DAY), ...update } }));
  }, []);
  const fillBelow = useCallback((date: string, field: keyof DayInput = 'rate') => {
    setDays((current) => {
      const source = current[date] ?? EMPTY_DAY;
      const rate = source.rate;
      const index = dates.indexOf(date);
      if (index < 0) return current;
      if (field === 'rate' && (!rate.trim() || !Number.isFinite(Number(rate)) || Number(rate) < 0)) return current;
      const next = { ...current };
      for (const nextDate of dates.slice(index + 1)) {
        next[nextDate] = { ...(current[nextDate] ?? EMPTY_DAY), [field]: source[field] };
      }
      return next;
    });
  }, [dates]);
  const applyRatePlan = (planId: string) => {
    const plan = RATE_PLANS.find((item) => item.id === planId);
    if (!plan || !selectedRoom || !dates.length) return;
    setDays((current) => {
      const next = { ...current };
      for (const date of dates) {
        next[date] = {
          rate: plan.nightlyRates[selectedRoom.type].toFixed(2),
          breakfast: plan.breakfast,
          lunch: plan.lunch,
          dinner: plan.dinner,
        };
      }
      return next;
    });
    setError('');
  };
  const distributeTotal = () => {
    if (!canDistribute) return;
    const nightlyCents = Math.floor(requestedTotalCents / dates.length);
    const remainder = requestedTotalCents % dates.length;
    setDays((current) => {
      const next = { ...current };
      dates.forEach((date, index) => {
        next[date] = {
          ...(current[date] ?? EMPTY_DAY),
          rate: ((nightlyCents + (index < remainder ? 1 : 0)) / 100).toFixed(2),
        };
      });
      return next;
    });
    setError('');
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (createdReservation) return;
    if (!selectedRoom) { setError('No available room matches this stay and guest count.'); return; }
    if (!primary.name.trim()) { setError('Enter the primary guest’s name.'); return; }
    if (primary.type !== 'adult') { setError('The primary guest must be an adult.'); return; }
    if (capacityExceeded) { setError('The guest list exceeds this room’s maximum capacity.'); return; }
    if (!ratesComplete || !Number.isFinite(totalCents)) { setError('Enter a valid rate for every night.'); return; }
    let unnamed = 0;
    const guestList = guests.map((guest) => ({
      name: guest.name.trim() || `Guest ${++unnamed}`,
      isPrimary: guest.id === primaryId,
      type: guest.type,
    }));
    const dailyRates: ReservationDay[] = dates.map((date) => ({
      date,
      rate: Math.round(Number(days[date].rate) * 100) / 100,
      breakfast: days[date].breakfast,
      lunch: days[date].lunch,
      dinner: days[date].dinner,
    }));
    const reservation: Reservation = {
      id: `res-${crypto.randomUUID()}`, code: `WI-${Date.now()}`,
      guestName: primary.name.trim(), guestEmail: '', guests: guestList, dailyRates,
      roomNumber: selectedRoom.number, roomType: selectedRoom.type,
      checkIn: today, checkOut, nights: dates.length,
      adults: guests.filter((guest) => guest.type === 'adult').length,
      children: guests.filter((guest) => guest.type === 'child').length,
      status: 'arriving', channel: 'Walk-In', totalAmount: totalCents / 100, balanceDue: totalCents / 100,
    };
    onCreateReservation(reservation);
    setCreatedReservation(reservation);
  };

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 p-3 transition-opacity duration-200 motion-reduce:transition-none sm:p-6 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="walk-in-title" tabIndex={-1}
        className={`flex w-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl outline-none ${createdReservation ? 'max-h-[92dvh] max-w-xl' : 'h-[min(44rem,92dvh)] max-w-5xl'}`}>
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#005FB8]">{createdReservation ? <KeyRound className="h-5 w-5" aria-hidden="true" /> : <Footprints className="h-5 w-5" aria-hidden="true" />}</span>
            <div>
              <h2 id="walk-in-title" className="font-display text-xl font-bold text-slate-900">{createdReservation ? 'Encode keys' : 'New walk-in'}</h2>
              <p className="mt-1 text-xs text-slate-500">{createdReservation ? `Room ${createdReservation.roomNumber} · ${createdReservation.roomType}` : selectedRoom ? `Room ${selectedRoom.number} · ${selectedRoom.type}` : 'No available room for this stay'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close walk-in" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </header>
        {createdReservation ? (
          <KeyEncodingStep reservation={createdReservation} onEncodeKeys={onEncodeKeys} onClose={onClose} />
        ) : (
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-[1fr_1.2fr] lg:grid-rows-1">
              <CustomScrollArea className="min-h-0 min-w-0" gutter="overlay" showTrackWhenIdle={false} viewportClassName="space-y-7 p-5 sm:p-7">
                <section aria-labelledby="stay-heading" className="space-y-4">
                  <h3 id="stay-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />The stay</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="walk-in-check-in" className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-600">Check-in
                        <span tabIndex={0} className="group relative inline-flex rounded text-slate-400 outline-none focus:ring-2 focus:ring-blue-200">
                          <Info className="h-3.5 w-3.5" aria-label="Walk-in check-in is always today" />
                          <span role="tooltip" className="pointer-events-none absolute left-1/2 top-6 z-10 hidden w-44 -translate-x-1/2 rounded-lg bg-slate-900 p-2 text-xs font-normal leading-4 text-white group-hover:block group-focus:block">Walk-in check-in is always today and cannot be changed.</span>
                        </span>
                      </label>
                      <input id="walk-in-check-in" type="date" value={today} disabled className={field} title="Walk-in check-in is always today." />
                    </div>
                    <div><label htmlFor="walk-in-check-out" className="mb-1.5 block text-xs font-medium text-slate-600">Check-out</label>
                      <input id="walk-in-check-out" type="date" required min={addDays(today, 1)} value={checkOut} onChange={(event) => { setCheckOut(event.target.value); setError(''); }} className={field} />
                    </div>
                  </div>
                </section>
                <section aria-labelledby="guest-heading" className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 id="guest-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />Guests</h3>
                    <button type="button" disabled={Boolean(selectedRoom?.maxGuests && guests.length >= selectedRoom.maxGuests)} onClick={() => { const guest = { id: nextGuestId.current++, name: '', type: 'adult' as const }; setGuests((current) => [...current, guest]); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#005FB8] hover:bg-blue-50 disabled:opacity-40"><Plus className="h-3.5 w-3.5" />Add guest</button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem_2rem] items-center gap-2 bg-slate-50 px-2 py-2 text-[10px] font-medium text-slate-500">
                      <span className="text-center">Primary</span>
                      <span>Guest name</span>
                      <span>Type</span>
                      <span className="sr-only">Remove</span>
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {guests.map((guest, index) => (
                        <li key={guest.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem_2rem] items-center gap-2 px-2 py-1.5">
                          <label className="flex h-8 cursor-pointer items-center justify-center" title={primaryId === guest.id ? 'Primary guest' : 'Make primary guest'}>
                            <input type="radio" name="primary-guest" checked={primaryId === guest.id} disabled={guest.type === 'child'}
                              aria-label={`Make ${guest.name.trim() || `guest ${index + 1}`} the primary guest`}
                              onChange={() => { setPrimaryId(guest.id); setError(''); }}
                              className="h-3.5 w-3.5 accent-[#005FB8] disabled:cursor-not-allowed disabled:opacity-30" />
                          </label>
                          <label htmlFor={`walk-in-guest-${guest.id}`} className="sr-only">{primaryId === guest.id ? 'Primary guest name (required)' : `Guest ${index + 1} name`}</label>
                          <input id={`walk-in-guest-${guest.id}`} required={primaryId === guest.id} type="text" autoComplete="off" value={guest.name}
                            onChange={(event) => setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, name: event.target.value } : item))}
                            placeholder="Full name"
                            className="col-start-2 row-start-1 h-8 min-w-0 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100" />
                          <select
                            aria-label={`Guest type for ${guest.name.trim() || `guest ${index + 1}`}`}
                            value={guest.type}
                            onChange={(event) => {
                              const type = event.target.value as 'adult' | 'child';
                              if (type === 'child' && guest.id === primaryId) {
                                const nextPrimary = guests.find((item) => item.id !== guest.id && item.type === 'adult');
                                if (!nextPrimary) return;
                                setPrimaryId(nextPrimary.id);
                              }
                              setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, type } : item));
                              setError('');
                            }}
                            className="col-start-3 row-start-1 h-8 min-w-0 w-full rounded-md border border-slate-200 bg-white px-1 text-xs text-slate-900 outline-none focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="adult">Adult</option>
                            <option value="child" disabled={guest.id === primaryId && !guests.some((item) => item.id !== guest.id && item.type === 'adult')}>Child</option>
                          </select>
                          <button type="button" disabled={guests.length === 1 || (guest.id === primaryId && !guests.some((item) => item.id !== guest.id && item.type === 'adult'))} aria-label={`Remove guest ${index + 1}`} onClick={() => {
                            const remaining = guests.filter((item) => item.id !== guest.id);
                            const nextPrimary = remaining.find((item) => item.type === 'adult');
                            if (!nextPrimary) return;
                            setGuests(remaining); if (guest.id === primaryId) setPrimaryId(nextPrimary.id);
                          }} className="col-start-4 row-start-1 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:invisible">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {capacityExceeded && <p role="alert" className="text-xs text-red-600">This room accommodates up to {selectedRoom?.maxGuests} guests. Remove a guest to continue.</p>}
                </section>
              </CustomScrollArea>
              <section aria-labelledby="daily-heading" className="flex min-h-0 min-w-0 flex-col gap-4 border-t border-slate-100 p-5 sm:p-7 lg:border-l lg:border-t-0">
                <h3 id="daily-heading" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900"><Receipt className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />Daily rates & meals</h3>
                <div className="flex shrink-0 flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1 basis-40">
                    <label htmlFor="walk-in-rate-plan" className="mb-1 block text-[11px] font-medium text-slate-500">Rate plan</label>
                    <select
                      id="walk-in-rate-plan"
                      value={matchingPlanId}
                      onChange={(event) => applyRatePlan(event.target.value)}
                      disabled={!selectedRoom || !dates.length}
                      className="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100 disabled:opacity-40"
                    >
                      <option value="">Custom rates</option>
                      {RATE_PLANS.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}{selectedRoom ? ` · ${money(plan.nightlyRates[selectedRoom.type])}/night` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <label htmlFor="walk-in-stay-total" className="mb-1 block text-[11px] font-medium text-slate-500">Stay total</label>
                      <div className="flex h-8 w-28 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 focus-within:border-[#005FB8] focus-within:ring-2 focus-within:ring-blue-100">
                        <span aria-hidden="true" className="shrink-0 text-[11px] text-slate-500">R$</span>
                        <input
                          id="walk-in-stay-total"
                          type="number" min="0" step="0.01" inputMode="decimal"
                          value={stayTotal} onChange={(event) => setStayTotal(event.target.value)}
                          placeholder="0.00"
                          className="h-full w-full min-w-0 bg-transparent text-right text-xs tabular-nums text-slate-900 outline-none placeholder:text-slate-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button" onClick={distributeTotal} disabled={!canDistribute}
                      title="Divide the stay total evenly across all nights"
                      className="h-8 rounded-lg bg-blue-50 px-2.5 text-xs font-semibold text-[#005FB8] hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Distribute
                    </button>
                  </div>
                </div>
                {dates.length > 0 ? (
                  <CustomScrollArea
                    className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white"
                    orientation="vertical"
                    gutter="overlay"
                    viewportClassName="pl-6 pr-4"
                    showTrackWhenIdle={false}
                    verticalTopOffset={56}
                  >
                    <table className="w-full table-fixed border-collapse">
                      <caption className="sr-only">Nightly room rates in BRL and included meals</caption>
                      <colgroup>
                        <col className="w-[29%]" />
                        <col className="w-[23%]" />
                        <col className="w-[6%]" />
                        <col className="w-[14%]" />
                        <col className="w-[14%]" />
                        <col className="w-[14%]" />
                      </colgroup>
                      <thead className="sticky top-0 isolate z-10 h-12 bg-slate-50 text-[10px] font-medium text-slate-500 before:pointer-events-none before:absolute before:-left-6 before:-right-4 before:inset-y-0 before:-z-10 before:bg-slate-50 before:content-['']">
                        <tr>
                          <th scope="col" className="px-1.5 py-2 text-left font-medium">Date</th>
                          <th scope="col" colSpan={2} className="px-1.5 py-2 text-left font-medium">Rate</th>
                          {meals.map(({ key, label }) => (
                            <th key={key} scope="col" className="px-1.5 py-2 text-center font-medium">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dates.map((date, index) => (
                          <DailyRateRow key={date} date={date} day={days[date] ?? EMPTY_DAY} updateDay={updateDay} fillBelow={fillBelow} hasRowsBelow={index < dates.length - 1} />
                        ))}
                      </tbody>
                    </table>
                  </CustomScrollArea>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">Choose a checkout date after today to add daily rates.</p>
                )}
              </section>
          </div>
          <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            {error && <p role="alert" className="mb-3 text-xs text-red-600">{error}</p>}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p aria-label="Stay total" aria-live="polite" className="font-display text-xl font-bold tabular-nums text-slate-900">{money(Number.isFinite(totalCents) ? totalCents / 100 : 0)}</p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={!selectedRoom || capacityExceeded || !ratesComplete} className="flex items-center gap-2 rounded-lg bg-[#005FB8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004f99] disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" />Create walk-in & continue</button>
              </div>
            </div>
          </footer>
        </form>
        )}
      </div>
    </div>
  );
}
