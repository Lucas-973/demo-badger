import { History, X } from 'lucide-react';
import { Reservation, Room } from '../../types/pms';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { useOverlayPresence } from '../ui/LoadingState';
import { useDialogFocus } from './useDialogFocus';

interface RoomHistoryDialogProps {
  isOpen: boolean;
  room: Room;
  reservations: Reservation[];
  onClose: () => void;
}

export function RoomHistoryDialog(props: RoomHistoryDialogProps) {
  const { mounted, shown } = useOverlayPresence(props.isOpen, 200);
  if (!mounted) return null;
  return <RoomHistoryContent {...props} shown={shown} />;
}

function RoomHistoryContent({ room, reservations, onClose, shown }: RoomHistoryDialogProps & { shown: boolean }) {
  const dialogRef = useDialogFocus(onClose);
  const history = reservations
    .filter((reservation) => reservation.roomNumber === room.number)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 p-3 transition-opacity duration-200 motion-reduce:transition-none sm:p-6 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="room-history-title" tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl outline-none">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#005FB8]"><History className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 id="room-history-title" className="font-display text-xl font-bold text-slate-900">Room history</h2>
              <p className="mt-1 text-xs text-slate-500">Room {room.number} &middot; {room.type}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close room history" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </header>
        <CustomScrollArea className="min-h-0" gutter="overlay" showTrackWhenIdle={false} viewportClassName="p-5 sm:p-7">
          <section aria-label="Reservation history">
            {history.length ? (
              <ul className="divide-y divide-slate-100">
                {history.map((reservation) => (
                  <li key={reservation.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 space-y-1">
                      <p className="break-words text-sm font-semibold text-slate-900">{reservation.guestName}</p>
                      <p className="text-xs text-slate-500">{reservation.code} &middot; {reservation.checkIn} &ndash; {reservation.checkOut}</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium capitalize text-slate-600">{reservation.status.replace(/-/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No reservation history for this room.</p>
            )}
          </section>
        </CustomScrollArea>
        <footer className="flex shrink-0 justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Close</button>
        </footer>
      </div>
    </div>
  );
}
