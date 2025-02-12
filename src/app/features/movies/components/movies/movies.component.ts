import { Component, OnInit, signal } from '@angular/core';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../services/movies.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-movies',
  imports: [
    MovieCardComponent
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  page: number = 0;
  reachedEndOfRecords: boolean = false;

  movies = signal<Movie[]>([]);

  constructor(private movieService: MoviesService, private toastService: ToastService) {
  }

  ngOnInit() {
    this.loadMovies()
  }

  loadMovies() {
    if (!this.reachedEndOfRecords) {
      this.movieService.getMovies().subscribe({
        next: data => {
          if (data.length < 10) {
            this.reachedEndOfRecords = true;
          }
          data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });data.forEach((movie) => {
            this.movies().push(movie);
          });
          data.forEach((movie) => {
            this.movies().push(movie);
          });
        },
        error: error => {
          this.toastService.showToast({type: 'error', message: error.message})
        }
      });
    }
  }
}
