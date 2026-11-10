import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Reservation, ReservationKeyEncoding } from '../../types/pms';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { NumberStepper } from '../ui/NumberStepper';

interface KeyEncodingStepProps {
  reservation: Reservation;
  onEncodeKeys: (reservationId: string, encoding: ReservationKeyEncoding) => void;
  onClose: () => void;
}

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#005FB8] focus:ring-2 focus:ring-blue-100';

export function KeyEncodingStep({ reservation, onEncodeKeys, onClose }: KeyEncodingStepProps) {
  const [encoder, setEncoder] = useState('Terminal A');
  const [keyCount, setKeyCount] = useState('2');
  const count = Number(keyCount);
  const validCount = keyCount.trim() !== '' && Number.isInteger(count) && count >= 1 && count <= 8;

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => {
      event.preventDefault();
      if (!validCount) return;
      const result: ReservationKeyEncoding = { encoder, keyCount: count, encodedAt: new Date().toISOString(), mode: 'demo' };
      onEncodeKeys(reservation.id, result);
      onClose();
    }}>
      <CustomScrollArea className="min-h-0 flex-1" gutter="overlay" showTrackWhenIdle={false} viewportClassName="space-y-6 p-5 sm:p-7">
        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
          <div className="space-y-1.5"><dt className="text-slate-500">Room</dt><dd className="font-semibold text-slate-900">{reservation.roomNumber}</dd></div>
          <div className="space-y-1.5"><dt className="text-slate-500">Reservation</dt><dd className="break-words font-medium text-slate-900">{reservation.code}</dd></div>
          <div className="space-y-1.5"><dt className="text-slate-500">Valid from</dt><dd className="font-medium text-slate-900">{reservation.checkIn}</dd></div>
          <div className="space-y-1.5"><dt className="text-slate-500">Valid until</dt><dd className="font-medium text-slate-900">{reservation.checkOut}</dd></div>
        </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="walk-in-encoder" className="mb-1.5 block text-xs font-medium text-slate-600">Encoder</label>
              <select id="walk-in-encoder" value={encoder} onChange={(event) => setEncoder(event.target.value)} className={field}>
                <option>Terminal A</option><option>Terminal B</option><option>VIP Concierge Desk</option>
              </select>
            </div>
            <div>
              <label htmlFor="walk-in-key-count" className="mb-1.5 block text-xs font-medium text-slate-600">Number of keys</label>
              <NumberStepper id="walk-in-key-count" label="number of keys" required min={1} max={8} value={keyCount} onChange={setKeyCount} />
            </div>
          </div>
      </CustomScrollArea>
      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Skip for now</button>
            <button type="submit" disabled={!validCount} className="flex items-center gap-2 rounded-lg bg-[#005FB8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004f99] disabled:cursor-not-allowed disabled:opacity-40"><KeyRound aria-hidden="true" className="h-4 w-4" />Encode keys</button>
      </footer>
    </form>
  );
}
