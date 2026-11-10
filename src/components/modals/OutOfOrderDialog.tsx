import React, { useState } from 'react';
import { CalendarDays, Check, Wrench, X } from 'lucide-react';
import { Room } from '../../types/pms';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { useOverlayPresence } from '../ui/LoadingState';
import { useDialogFocus } from './useDialogFocus';

interface OutOfOrderDialogProps {
  isOpen: boolean;
  room: Room;
  onClose: () => void;
  onConfirm: (notes: string, period: NonNullable<Room['outOfOrderPeriod']>) => void;
}

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100';

export function OutOfOrderDialog(props: OutOfOrderDialogProps) {
  const { mounted, shown } = useOverlayPresence(props.isOpen, 200);
  if (!mounted) return null;
  return <OutOfOrderForm {...props} shown={shown} />;
}

function OutOfOrderForm({ room, onClose, onConfirm, shown }: OutOfOrderDialogProps & { shown: boolean }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState(room.notes ?? '');
  const [startDate, setStartDate] = useState(() => {
    if (room.outOfOrderPeriod) return room.outOfOrderPeriod.startDate;
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [endDate, setEndDate] = useState(room.outOfOrderPeriod?.endDate ?? '');
  const dialogRef = useDialogFocus(onClose);
  const validPeriod = Boolean(startDate && endDate && endDate >= startDate);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim() || !validPeriod) return;
    onConfirm([reason.trim(), notes.trim()].filter(Boolean).join('\n\n'), { startDate, endDate });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 p-3 transition-opacity duration-200 motion-reduce:transition-none sm:p-6 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="out-of-order-title" tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl outline-none">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#005FB8]"><Wrench className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 id="out-of-order-title" className="font-display text-xl font-bold text-slate-900">Set out of order</h2>
              <p className="mt-1 text-xs text-slate-500">Room {room.number} &middot; {room.type}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close out-of-order dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </header>
        <form onSubmit={submit} className="flex min-h-0 flex-col">
          <CustomScrollArea className="min-h-0" gutter="overlay" showTrackWhenIdle={false} viewportClassName="space-y-5 p-5 sm:p-7">
            <section aria-labelledby="out-of-order-period-heading" className="space-y-4">
              <h3 id="out-of-order-period-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-[#005FB8]" aria-hidden="true" />Out-of-order period</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="out-of-order-start" className="mb-1.5 block text-xs font-medium text-slate-600">Start date <span className="text-rose-500">*</span></label>
                  <input id="out-of-order-start" type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className={field} />
                </div>
                <div>
                  <label htmlFor="out-of-order-end" className="mb-1.5 block text-xs font-medium text-slate-600">End date <span className="text-rose-500">*</span></label>
                  <input id="out-of-order-end" type="date" required min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} className={field} />
                </div>
              </div>
            </section>
            <div>
              <label htmlFor="out-of-order-reason" className="mb-1.5 block text-xs font-medium text-slate-600">Reason <span className="text-rose-500">*</span></label>
              <input id="out-of-order-reason" required maxLength={200} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Air conditioning repair" className={field} />
            </div>
            <div>
              <label htmlFor="out-of-order-notes" className="mb-1.5 block text-xs font-medium text-slate-600">Notes <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea id="out-of-order-notes" rows={3} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add details for housekeeping and engineering" className={`${field} resize-y`} />
            </div>
          </CustomScrollArea>
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!reason.trim() || !validPeriod} className="flex items-center gap-2 rounded-lg bg-[#005FB8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004f99] disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" aria-hidden="true" />Set out of order</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
