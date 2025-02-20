import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "../../../core/services/toast.service";
import { Movie } from "../../../core/types";
import { MoviesService } from "../../../movies/services/movies.service";
import { DatePipe, DecimalPipe, NgOptimizedImage } from "@angular/common";
import { ImageLoaderDirective } from "../../../core/directives/image-loading-status";

@Component({
  selector: 'app-movie-scheduler',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    ImageLoaderDirective
  ],
  templateUrl: './movie-scheduler.component.html',
  styleUrl: './movie-scheduler.component.scss'
})
export class MovieSchedulerComponent implements OnInit {


  movieId = signal<string | null>(null);

  movieDetails = signal<Movie | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private toastService: ToastService, private movieService: MoviesService) {
    route.params.subscribe(params => {
      this.movieId.set(params['id']);
    })
  }

  ngOnInit() {
    if (this.movieId()) {
      this.movieService.getMovieDetails(this.movieId()!).subscribe({
        next: result => {
          this.movieDetails.set(result);
        },
        error: err => {
          this.toastService.showToast({type: 'error', message: err.message});
        }
      })
    } else {
      this.toastService.showToast({message: "Invalid URL", type: 'error'})
      this.router.navigate(['/']);
    }
  }

  extractLanguages(tags: string[]): string {
    const languages = tags.filter(tag => ['Telugu', 'Tamil', 'Hindi', 'English', 'Kannada'].map(lang => lang.toLowerCase()).includes(tag.toLowerCase()));
    return languages.length ? languages.join(', ') : 'N/A';
  }
}
