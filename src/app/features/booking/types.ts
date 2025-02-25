import { FormControl, FormGroup } from '@angular/forms';
import { AnyObject } from '../../types';

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
export type EventDurationType = 'SHORT_TERM' | 'SINGLE_DAY' | 'MULTI_DAY';

export type ScheduledEvent = {
  startDate: Date;
  endDate: Date;
  isOpenForBooking: boolean;
}

export type EventInfo = {
  duration: number;
  startDate: Date;
  eventDurationCategory: EventDurationType;
}

export type Event = {
  id?: string,
  name: string,
  eventId: string,
  organizerId?: string,
  eventType: EventCategory,
  venueId: string,
  openForBooking: boolean,
  eventDurationDetails: {
    startTime: string;
    endTime: string;
    eventDurationType: EventDurationType
  },
  additionalDetails?: AnyObject,
  pricingTierMaps: PricingTierMap[],
  seatState?: string,
  seatingLayoutId?: string,
}

export type EventWithVenueName = Event & { venueName: string };

export type PricingTierMap = {
  name: string;
  price: number;
}


export type VenueWithNameAndLayoutId = {
  name: string,
  id: string,
  seatingLayoutId: string,
}
