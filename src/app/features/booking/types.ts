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


export type Venue = {
  id?: string,
  name: string,
  description: string,
  capacity: number,
  ownerId?: string,
  location: string,
  country: string,
  pincode: number,
  state: string,
  city: string,
  googleMapsUrl: string,
  seatingLayoutId: string
}

export type EventCategory = 'MOVIE' | 'SPORTS' | 'CONCERT' | "MEETING";
export type EventDurationCategory = 'SINGLE_DAY' | 'MULTI_DAY' | 'SHORT_TERM';


export type EventSchedulerInfo = {
  duration: number;
  startDate: string;
  eventDurationCategory: EventDurationCategory;
}
