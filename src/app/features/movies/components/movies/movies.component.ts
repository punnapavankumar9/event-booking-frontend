import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../services/movies.service';
import { ToastService } from '../../../core/services/toast.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movies',
  imports: [
    MovieCardComponent
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  page = signal<number>(0);
  reachedEndOfRecords = signal<boolean>(false);
  movies = signal<Movie[]>([]);

  loading = signal<boolean>(false);

  constructor(private movieService: MoviesService, private toastService: ToastService) {
  }


  ngOnInit() {
    this.loadMovies()
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 500 && !this.loading()) {
      this.loadMovies();
    }
  }

  loadMovies() {
    if (this.loading() || this.reachedEndOfRecords()) {
      return;
    }
    this.loading.set(true);
    if (!this.reachedEndOfRecords()) {
      this.movieService.getMovies(this.page()).subscribe({
        next: data => {
          this.page.set(this.page() + 1);
          if (data.length < 10) {
            this.reachedEndOfRecords.set(true);
          }
          data.forEach((movie) => {
            this.movies().push(movie);
          })
        },
        error: error => {
          this.toastService.showToast({type: 'error', message: error.message})
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    }
  }
}
