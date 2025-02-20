import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { getSkipLoaderHttpContext } from '../../utils/utils';

@Injectable({providedIn: 'root'})
export class LocationService {
  countriesUrl = `${environment.locations}/countries`;
  statesUrl = `${environment.locations}/states`;
  citiesUrl = `${environment.locations}/cities`;

  constructor(private http: HttpClient) {
  }

  getCountries() {
    return this.http.get<string[]>(this.countriesUrl, {context: getSkipLoaderHttpContext()});
  }

  getStates(country: string) {
    return this.http.get<string[]>(this.statesUrl + '?country=' + country, {context: getSkipLoaderHttpContext()});
  }

  getCities(country: string, state: string) {
    return this.http.get<string[]>(this.citiesUrl + "?country=" + country + "&state=" + state, {context: getSkipLoaderHttpContext()});
  }
}
