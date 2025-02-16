import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ServerSideSeatingLayout } from '../components/types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeatLayoutService {

  seatingLayoutUrl = environment.seatingLayoutUrl;

  constructor(private httpClient: HttpClient) {

  }

  createSeatingLayout(seatingLayout: ServerSideSeatingLayout) {
    return this.httpClient.post<ServerSideSeatingLayout>(environment.seatingLayoutUrl, seatingLayout);
  }
}
