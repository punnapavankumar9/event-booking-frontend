import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, UserRegistrationDetails } from '../types';
import { headersWithToken } from '../../utils/utils';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userServiceBaseUrl = environment.identity
  loginUrl = this.userServiceBaseUrl + '/login';
  signupUrl = this.userServiceBaseUrl;

  constructor(private httpClient: HttpClient) {

  }

  login(credentials: LoginCredentials): Observable<{ token: string }> {
    return this.httpClient.post<{
      token: string
    }>(this.loginUrl, credentials, {headers: headersWithToken()}).pipe(
      tap((response: { token: string }) => {
        localStorage.setItem('jwt-token', response.token);
      }));
  }

  register(registrationDetails: UserRegistrationDetails) {
    return this.httpClient.post<UserRegistrationDetails>(this.signupUrl, registrationDetails, {headers: headersWithToken()});
  }

  isAuthenticated() {
    return !!localStorage.getItem('jwt-token');
  }
}
