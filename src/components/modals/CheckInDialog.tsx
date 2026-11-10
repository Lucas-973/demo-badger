import { CalendarDays, Check, LogIn, Users, X } from 'lucide-react';
import { Reservation, Room } from '../../types/pms';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { useOverlayPresence } from '../ui/LoadingState';
import { useDialogFocus } from './useDialogFocus';

interface CheckInDialogProps {
  isOpen: boolean;
  room: Room;
  reservation?: Reservation;
  isOccupied: boolean;
  onClose: () => void;
  onConfirm: (reservationId: string) => void;
}

export function CheckInDialog(props: CheckInDialogProps) {
  const { mounted, shown } = useOverlayPresence(props.isOpen, 200);
  if (!mounted) return null;
  return <CheckInContent {...props} shown={shown} />;
}

function CheckInContent({ room, reservation, isOccupied, onClose, onConfirm, shown }: CheckInDialogProps & { shown: boolean }) {
  const dialogRef = useDialogFocus(onClose);
  const issue = !reservation || reservation.status !== 'arriving'
    ? 'No arriving reservation is linked to this room.'
    : isOccupied
      ? 'This room is still occupied. Complete the current stay before checking in another guest.'
      : room.status !== 'vacant-clean'
        ? 'This room must be vacant and clean before check-in.'
        : '';
  const guests = reservation?.guests?.length
    ? reservation.guests
    : reservation ? [{ name: reservation.guestName, isPrimary: true, type: 'adult' as const }] : [];

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 p-3 transition-opacity duration-200 motion-reduce:transition-none sm:p-6 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="check-in-title" tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl outline-none">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#005FB8]"><LogIn className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 id="check-in-title" className="font-display text-xl font-bold text-slate-900">Check-in</h2>
              <p className="mt-1 text-xs text-slate-500">Room {room.number} &middot; {room.type}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close check-in" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </header>
        <CustomScrollArea className="min-h-0" gutter="overlay" showTrackWhenIdle={false} viewportClassName="space-y-5 p-5 sm:p-7">
          {reservation && (
            <div className="grid gap-6 sm:grid-cols-2">
              <section aria-labelledby="check-in-stay-heading" className="space-y-4">
                <h3 id="check-in-stay-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />The stay</h3>
                <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  {[
                    ['Reservation', reservation.code], ['Channel', reservation.channel],
                    ['Check-in', reservation.checkIn], ['Check-out', reservation.checkOut],
                    ['Nights', reservation.nights], ['Guests', `${reservation.adults} adults, ${reservation.children} children`],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-1.5"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-900">{value}</dd></div>
                  ))}
                </dl>
                {reservation.specialRequests?.length ? (
                  <div className="space-y-2"><h4 className="text-xs font-medium text-slate-600">Special requests</h4><ul className="list-inside list-disc space-y-1 text-xs leading-5 text-slate-500">{reservation.specialRequests.map((request, index) => <li key={index}>{request}</li>)}</ul></div>
                ) : null}
              </section>
              <section aria-labelledby="check-in-guests-heading" className="space-y-4">
                <h3 id="check-in-guests-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />The guests</h3>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
                  {guests.map((guest, index) => (
                    <li key={index} className="space-y-1 py-3">
                      <p className="break-words text-sm font-semibold text-slate-900">{guest.name}</p>
                      <p className="text-xs text-slate-500">{guest.isPrimary ? 'Primary guest' : guest.type === 'child' ? 'Child' : 'Adult'}</p>
                      {guest.isPrimary && reservation.guestEmail && <p className="break-words text-xs text-slate-500">{reservation.guestEmail}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          {issue && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">{issue}</p>}
        </CustomScrollArea>
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={Boolean(issue)} onClick={() => { if (!issue && reservation) { onConfirm(reservation.id); onClose(); } }} className="flex items-center gap-2 rounded-lg bg-[#005FB8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004f99] disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" aria-hidden="true" />Confirm check-in</button>
        </footer>
      </div>
    </div>
  );
}
