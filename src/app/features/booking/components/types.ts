export type Seat = {
  row: number;
  column: number;
  isSpace: boolean;
  tier: string;
}


export type ServerSideSeatingLayout = {
  id?: string;
  rows: number;
  columns: number;
  capacity: number;
  seats: Seat[];
}

export type SeatingLayout = (Seat & { isSelected?: boolean }) [][];
