import { Injectable } from '@angular/core';
import { environment, gatewayURL } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Movie } from '../../core/types';
import { Observable, tap } from 'rxjs';

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
      response.forEach(movie => this.prepareMovie(movie));
    }));
  }

  prepareMovie(movie: Movie) {
    const imageUrls: string[] = [];
    if (!movie.imageUrls[0].startsWith('http')) {
      movie.imageUrls.forEach(imageUrl => {
        imageUrls.push(gatewayURL + "/" + imageUrl);
      });
      movie.imageUrls = imageUrls;
    }
    movie.releaseDate = new Date(movie.releaseDate)
    movie.genreString = this.getGenreString(movie);
  }

  getGenreString(movie: Movie) {
    if (!movie) {
      return '';
    }
    let genre = "";
    const len = movie.genres.length;
    for (let i = 0; i < len; i++) {
      genre += movie.genres[i];
      if (i < len - 1) {
        genre += "/";
      }
    }
    return genre;
  }


  getMovieDetails(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.movieServiceBaseUrl}/${id}`).pipe(tap(response => {
      this.prepareMovie(response);
    }));
  }

  createMovie(formData: FormData): Observable<Movie> {
    return this.http.post<Movie>(this.movieServiceBaseUrl, formData).pipe(tap(response => {
      this.prepareMovie(response);
    }));
  }
}
