import { FormControl, FormGroup } from '@angular/forms';
import { AnyObject } from '../../types';

export interface SeatLocation {
  row: number;
  column: number;
}

export interface Seat extends SeatLocation {
  isSpace: boolean;
  tier: string;
}

export interface BookingSeat extends Seat {
  isSelected?: boolean,
  isAvailable?: boolean
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


export type SeatingLayout = BookingSeat[][];


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

export type EventDurationDetails = {
  startTime: string;
  endTime: string;
  eventDurationType: EventDurationType
}

export type Event = {
  id?: string,
  name: string,
  eventId: string,
  organizerId?: string,
  eventType: EventCategory,
  venueId: string,
  openForBooking: boolean,
  eventDurationDetails: EventDurationDetails,
  additionalDetails?: AnyObject,
  pricingTierMaps: PricingTierMap[],
  seatState?: {
    bookedSeats: { row: number; column: number }[] | null,
    blockedSeats: { row: number; column: number }[] | null,
  },
  seatingLayoutId?: string,
}

export type PricingTierMap = {
  name: string;
  price: number;
}

export type VenueWithNameAndLayoutId = {
  name: string,
  id: string,
  seatingLayoutId: string,
}

export type EventForShowList = {
  id: string;
  venueName: string;
  eventId: string;
  eventType: EventCategory;
  venueId: string;
  eventDurationDetails: EventDurationDetails;
  pricingTierMaps: PricingTierMap[];
  seatingLayoutId: string;
  numberOfBookedAndBlockedSeats: number;
  totalSeats: number;
}

export type EventBookingStates = "Available" | "Filling Fast" | "Almost Full";


export type BookingPageInfo = {
  event: Event,
  venueName: string,
  seatingLayout: ServerSideSeatingLayout,
  showList: string[],
}

export type OrderInfo = {
  seats: SeatLocation[],
  seatLabels: string[],
}

export type OrderReqDetails = {
  id?: string,
  info: OrderInfo,
  eventId: string,
  amount: number,
  eventType: EventCategory,
}

export type OrderResDetails = OrderReqDetails & {
  id: string,
  paymentId: string,
  createdBy: string,
  createdDate: string,
  orderStatus: OrderStatus
  eventOrderId: string,
  razorOrderId?: string
}

export type OrderStatus = "CREATED" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "PENDING";

export type EventNameAndIdProjection = {
  name: string,
  id: string
}