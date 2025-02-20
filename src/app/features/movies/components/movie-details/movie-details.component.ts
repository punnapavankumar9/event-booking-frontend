import { Component, computed, OnInit, signal } from '@angular/core';
import { Movie } from '../../../core/types';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { ToastService } from '../../../core/services/toast.service';
import { DatePipe, NgStyle } from '@angular/common';
import { ImageLoaderDirective } from '../../../core/directives/image-loading-status';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [DatePipe, NgStyle, ImageLoaderDirective, RouterLink],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  movieId = signal<string | null>(null);
  movie = signal<Movie>(null as unknown as Movie);
  isReleased = computed(() => {
    return new Date(this.movie().releaseDate).getTime() < new Date().getTime();
  });

  constructor(
    private activatedRouter: ActivatedRoute,
    private moviesService: MoviesService,
    private toastService: ToastService
  ) {
    this.activatedRouter.params.subscribe(params => {
      this.movieId.set(params['id']);
    });
  }

  ngOnInit(): void {
    if (!this.movie() && this.movieId()) {
      this.loadMovieDetails(this.movieId() as string);
    }
  }

  loadMovieDetails(id: string) {
    this.moviesService.getMovieDetails(id).subscribe({
      next: (movie: Movie) => {
        this.movie.set(movie);
      },
      error: (error: Error) => {
        this.toastService.showToast({type: 'error', message: error.message});
      },
    });
  }

  protected readonly Date = Date;
  protected readonly Math = Math;
}
