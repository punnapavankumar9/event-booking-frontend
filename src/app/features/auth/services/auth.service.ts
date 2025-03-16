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
  selectedCity = signal<string>("hyderabad");

  constructor(private httpClient: HttpClient) {
    effect(() => {
      if (this.authToken()) {
        localStorage.setItem('jwt-token', this.authToken()!);
      } else {
        localStorage.removeItem('jwt-token');
      }
    });

    effect(() => {
      localStorage.setItem('selected-city', this.selectedCity());
    });

    this.selectedCity.set(localStorage.getItem('selected-city') || "hyderabad");
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

  logout() {
    this.authToken.set(null);
    localStorage.removeItem('jwt-token');
  }

  isAuthenticated() {
    return this.authToken() !== null;
  }

  getCurrentUser(){
    // TODO: Implement this
    return {name: "Test"};
  }
}
