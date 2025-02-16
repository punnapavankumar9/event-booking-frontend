import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, UserRegistrationDetails } from '../types';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userServiceBaseUrl = environment.identity
  loginUrl = this.userServiceBaseUrl + '/login';
  signupUrl = this.userServiceBaseUrl;

  authToken = signal(localStorage.getItem('jwt-token'));

  constructor(private httpClient: HttpClient) {
    effect(() => {
      if (this.authToken()) {
        localStorage.setItem('jwt-token', this.authToken()!);
      } else {
        localStorage.removeItem('jwt-token');
      }
    });
  }

  login(credentials: LoginCredentials): Observable<{ token: string }> {
    return this.httpClient.post<{
      token: string
    }>(this.loginUrl, credentials).pipe(
      tap((response: { token: string }) => {
        this.authToken.set(response.token);
      }));
  }

  register(registrationDetails: UserRegistrationDetails) {
    return this.httpClient.post<UserRegistrationDetails>(this.signupUrl, registrationDetails);
  }
}
