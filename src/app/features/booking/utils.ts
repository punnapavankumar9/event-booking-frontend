import { SeatingLayout, ServerSideSeatingLayout } from './types';

export function buildSeatLayout(seatLayout: ServerSideSeatingLayout) {
  const uiLayout: SeatingLayout = [];
  const rows = seatLayout.rows;
  const columns = seatLayout.columns;
  for (let i = 0; i < rows; i++) {
    uiLayout.push([].constructor(columns));
  }
  seatLayout.seats.forEach(seat => {
    uiLayout[seat.row][seat.column] = seat;
  })
  return uiLayout;
}
