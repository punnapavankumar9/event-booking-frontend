import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Venue } from '../types';
import { environment } from '../../../../environments/environment';


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
}
