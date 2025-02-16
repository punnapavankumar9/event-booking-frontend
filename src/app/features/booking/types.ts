import { FormControl, FormGroup } from '@angular/forms';

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
  screenPosition: ScreenPosition;
  name: string;
}

export type ScreenPosition = 'TOP' | 'BOTTOM';

export type TierFormGroup = FormGroup<{
  rows: FormControl<number | null>,
  tierName: FormControl<string | null>
}>;


export type SeatingLayout = (Seat & { isSelected?: boolean }) [][];
