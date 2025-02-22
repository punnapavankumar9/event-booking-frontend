import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ServerSideSeatingLayout } from '../types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeatLayoutService {

  constructor(private httpClient: HttpClient) {

  }

  createSeatingLayout(seatingLayout: ServerSideSeatingLayout) {
    return this.httpClient.post<ServerSideSeatingLayout>(environment.seatingLayoutUrl, seatingLayout);
  }

  getSeatLayout(id: string) {
    return this.httpClient.get<ServerSideSeatingLayout>(environment.seatingLayoutUrl + "/" + id);
  }

  getTierNames(id: string) {
    return this.httpClient.get<string[]>(environment.seatingLayoutUrl + "/tier-info/" + id);
  }
}
