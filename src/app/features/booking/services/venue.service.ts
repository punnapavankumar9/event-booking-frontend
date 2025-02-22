import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Venue, VenueWithNameAndLayoutId } from '../types';
import { environment } from '../../../../environments/environment';
import { EMPTY } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class VenueService {

  venuesUrl = environment.venues;

  constructor(private http: HttpClient) {
  }


  createVenue(venue: Venue) {
    return this.http.post<Venue>(this.venuesUrl, venue);
  }

  getVenueDetails(venueId: string) {
    return this.http.get<Venue>(this.venuesUrl + '/' + venueId);
  }

  searchVenues(query: string) {
    if (!query) return EMPTY;
    return this.http.get<VenueWithNameAndLayoutId[]>(this.venuesUrl + "/search?name=" + query);
  }
}
