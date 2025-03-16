import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingPageInfo, Event, EventForShowList, EventNameAndIdProjection } from '../types';
import { environment } from '../../../../environments/environment';
import { distinct, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  eventsUrl = environment.events;

  constructor(private http: HttpClient) {
  }

  createEvents(events: Event[]) {
    return this.http.post<Event[]>(this.eventsUrl + "?bulk=true", events);
  }

  findEventsByEventId(eventId: string, venueId: string): Observable<Event[]> {
    return this.http.get<Event[]>(this.eventsUrl + `/byEventId/${eventId}/${venueId}`);
  }

  findEventById(id: string): Observable<Event> {
    return this.http.get<Event>(this.eventsUrl + `/${id}`);
  }

  getEventDatesForEventIdAfter(eventId: string, from: Date): Observable<Date[]> {
    return this.http.get<string[]>(this.eventsUrl + `/event-dates/byEventId?eventId=${eventId}&from=${from.toISOString()}`).pipe(
      distinct(),
      map((dates: string[]) => {
        return dates.map(date => new Date(date)).sort((a, b) => a.getTime() - b.getTime());
      }));
  }

  getShowListForCityAndBetweenStartAndEnd(eventId: string, city: string, startTime: string, endTime: string): Observable<EventForShowList[]> {
    return this.http.get<EventForShowList[]>(this.eventsUrl + `/byEventId/${eventId}?city=${city}&startTime=${startTime}&endTime=${endTime}`)
  }

  getBookingPageInfo(eventId: string) {
    return this.http.get<BookingPageInfo>(this.eventsUrl + `/booking-info/${eventId}`)
  }

  getEventNames(eventIds: string[]): Observable<EventNameAndIdProjection[]> {
    return this.http.post<EventNameAndIdProjection[]>(`${this.eventsUrl}/event-names`, eventIds);
  }
}
