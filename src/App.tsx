import { useState } from 'react';
import { INITIAL_ROOMS } from './data/roomCatalog';
import { Reservation, Room, RoomStatus } from './types/pms';
import { RoomsView } from './components/views/RoomsView';
import { NewBookingModal } from './components/modals/WalkInDialog';
import { OutOfOrderDialog } from './components/modals/OutOfOrderDialog';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [walkInRoomId, setWalkInRoomId] = useState<string>();
  const [outOfOrderRoom, setOutOfOrderRoom] = useState<Room | null>(null);

  const changeRoomStatus = (roomId: string, status: RoomStatus) => {
    if (status === 'out-of-order') {
      setOutOfOrderRoom(rooms.find((room) => room.id === roomId) ?? null);
      return;
    }
    setRooms((current) => current.map((room) => room.id === roomId ? {
      ...room,
      status,
      outOfOrderPeriod: room.status === 'out-of-order' ? undefined : room.outOfOrderPeriod,
    } : room));
  };

  const occupyRoom = (reservation: Reservation) => {
    setRooms((current) => current.map((room) => room.number === reservation.roomNumber ? {
      ...room,
      status: 'occupied-clean',
      guestName: reservation.guestName,
      reservationId: reservation.id,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
    } : room));
  };

  const createReservation = (reservation: Reservation) => {
    setReservations((current) => [reservation, ...current]);
    if (reservation.status === 'checked-in') occupyRoom(reservation);
  };

  const checkIn = (reservationId: string) => {
    const reservation = reservations.find((item) => item.id === reservationId && item.status === 'arriving');
    if (!reservation) return;
    const room = rooms.find((item) => item.number === reservation.roomNumber);
    if (!room || room.status !== 'vacant-clean' || reservations.some((item) =>
      item.roomNumber === room.number && (item.status === 'checked-in' || item.status === 'departing')
    )) return;
    setReservations((current) => current.map((item) => item.id === reservation.id ? {
      ...item, status: 'checked-in',
    } : item));
    occupyRoom(reservation);
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#F5F5F5]">
      <AppShell rooms={rooms} reservations={reservations}>
        <RoomsView
          rooms={rooms}
          reservations={reservations}
          onChangeRoomStatus={changeRoomStatus}
          onCheckIn={checkIn}
          onOpenNewBooking={(room) => setWalkInRoomId(room.id)}
        />
      </AppShell>
      <NewBookingModal
        isOpen={Boolean(walkInRoomId)}
        onClose={() => setWalkInRoomId(undefined)}
        rooms={rooms}
        reservations={reservations}
        initialRoomId={walkInRoomId}
        onCreateReservation={createReservation}
        onEncodeKeys={(reservationId, keyEncoding) => setReservations((current) => current.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, keyEncoding } : reservation
        ))}
      />
      {outOfOrderRoom && (
        <OutOfOrderDialog
          isOpen
          room={outOfOrderRoom}
          onClose={() => setOutOfOrderRoom(null)}
          onConfirm={(notes, outOfOrderPeriod) => setRooms((current) => current.map((room) =>
            room.id === outOfOrderRoom.id ? { ...room, status: 'out-of-order', notes, outOfOrderPeriod } : room
          ))}
        />
      )}
    </div>
  );
}
