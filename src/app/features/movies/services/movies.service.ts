import { Injectable } from '@angular/core';
import { environment, gatewayURL } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Movie } from '../../core/types';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  movieServiceBaseUrl = environment.movies;

  constructor(private http: HttpClient) {

  }

  getMovies(page: number = 0) {
    const params = new HttpParams().set('page', page);
    return this.http.get<Movie[]>(this.movieServiceBaseUrl, {params}).pipe(tap(response => {
      response.forEach(movie => {
        const imageUrls: string[] = [];
        movie.imageUrls.forEach(imageUrl => {
          imageUrls.push(gatewayURL + "/" + imageUrl);
        });
        movie.imageUrls = imageUrls;
      });
    }));
  }
}
