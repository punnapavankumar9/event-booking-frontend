import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event } from '../types';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

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
}
