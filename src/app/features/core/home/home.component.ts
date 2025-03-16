import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  movies = signal<Movie[]>([]);
  @ViewChild('movieContainer') movieContainer!: ElementRef;

  private scrollAmount = 500; // Approximately two cards width
  canScroll = signal<{ left: boolean; right: boolean }>({ left: false, right: false });
  private mutationObserver: MutationObserver | null = null;

  constructor(
    private moviesService: MoviesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.moviesService.getMovies(0).subscribe({
      next: (movies) => this.movies.set(movies)
    });
  }

  ngAfterViewInit() {
    if (!this.movieContainer) return;

    this.mutationObserver = new MutationObserver(() => {
      this.updateScrollState();
    });

    this.mutationObserver.observe(this.movieContainer.nativeElement, { childList: true });
    this.movieContainer.nativeElement.addEventListener('scroll', () => this.updateScrollState());
    this.updateScrollState();
  }

  ngOnDestroy() {
    this.mutationObserver?.disconnect();
  }

  private updateScrollState() {
    if (!this.movieContainer) return;

    const container = this.movieContainer.nativeElement;
    this.canScroll.set({
      left: container.scrollLeft > 0,
      right: container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
    });
    this.cdr.detectChanges();
  }

  scrollMovies(direction: 'left' | 'right') {
    if (!this.movieContainer) return;

    this.movieContainer.nativeElement.scrollBy({
      left: direction === 'left' ? -this.scrollAmount : this.scrollAmount,
      behavior: 'smooth'
    });
  }

  canScrollLeft = () => this.canScroll().left;
  canScrollRight = () => this.canScroll().right;
}
