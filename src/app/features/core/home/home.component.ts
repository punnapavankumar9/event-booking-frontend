import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { Movie } from '../types';
import { MoviesService } from '../../movies/services/movies.service';
import { MovieCardComponent } from '../../movies/components/movie-card/movie-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MovieCardComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  movies = signal<Movie[]>([]);
  @ViewChild('movieContainer') movieContainer!: ElementRef;
  
  private scrollAmount = 500; // Approximately two cards width

  constructor(private moviesService: MoviesService) {}

  ngOnInit() {
    this.moviesService.getMovies(0).subscribe({
      next: (movies) => {
        this.movies.set(movies);
      }
    });
  }

  scrollMovies(direction: 'left' | 'right') {
    if (!this.movieContainer) return;
    
    const container = this.movieContainer.nativeElement;
    const scrollAmount = direction === 'left' ? -this.scrollAmount : this.scrollAmount;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  canScrollLeft(): boolean {
    if (!this.movieContainer) return false;
    return this.movieContainer.nativeElement.scrollLeft > 0;
  }

  canScrollRight(): boolean {
    if (!this.movieContainer) return false;
    const container = this.movieContainer.nativeElement;
    return container.scrollLeft < (container.scrollWidth - container.clientWidth);
  }
}
