import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event, EventWithVenueName } from '../types';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';

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

  getEventDatesForEventIdAfter(eventId: string, from: Date): Observable<Date[]> {
    return this.http.get<string[]>(this.eventsUrl + `/event-dates/byEventId?eventId=${eventId}&from=${from.toISOString()}`).pipe(
      map((dates: string[]) => {
        return dates.map(date => new Date(date)).sort((a, b) => a.getTime() - b.getTime());
      }));
  }

  getShowListForCityAndBetweenStartAndEnd(eventId: string, city: string, startTime: string, endTime: string): Observable<EventWithVenueName[]> {
    return this.http.get<EventWithVenueName[]>(this.eventsUrl + `/byEventId/${eventId}?city=${city}&startTime=${startTime}&endTime=${endTime}`)
  }
}
