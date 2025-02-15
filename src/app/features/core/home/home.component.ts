import { Component, OnInit, signal } from '@angular/core';
import { Movie } from '../types';
import { MoviesService } from '../../movies/services/movies.service';
import { MovieCardComponent } from '../../movies/components/movie-card/movie-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    MovieCardComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  movies = signal<Movie[]>([]);

  constructor(private moviesService: MoviesService) {
  }

  ngOnInit() {
    this.moviesService.getMovies(0).subscribe((movies) => {
      movies.forEach(movie => {
        this.movies().push(movie);
      })
    })
  }
}
