import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, UserRegistrationDetails } from '../types';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loginUrl = environment.identity + '/login';

  constructor(private httpClient: HttpClient) {

  }

  login(credentials: LoginCredentials): Observable<string> {
    return this.httpClient.post<string>(this.loginUrl, credentials, {responseType: 'text' as 'json'}).pipe(
      tap((response: string) => {
        localStorage.setItem('jwt-token', response);
      }));
  }

  register(registrationDetails: UserRegistrationDetails) {
    return this.httpClient.post<UserRegistrationDetails>(this.loginUrl, registrationDetails);
  }
}
