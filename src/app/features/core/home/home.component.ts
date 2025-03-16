import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, signal } from '@angular/core';
import { Movie } from '../types';
import { MoviesService } from '../../movies/services/movies.service';
import { MovieCardComponent } from '../../movies/components/movie-card/movie-card.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MovieCardComponent,
    RouterLink,
    NgIf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  allMovies = signal<Movie[]>([]);
  recommendedMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);
  teluguMovies = signal<Movie[]>([]);
  hindiMovies = signal<Movie[]>([]);
  tamilMovies = signal<Movie[]>([]);

  @ViewChildren('movieContainer') movieContainers!: QueryList<ElementRef>;

  private scrollAmount = 500; // Approximately two cards width
  canScroll = signal<{ [key: string]: { left: boolean; right: boolean } }>({
    recommended: { left: false, right: false },
    popular: { left: false, right: false },
    telugu: { left: false, right: false },
    hindi: { left: false, right: false },
    tamil: { left: false, right: false }
  });
  private mutationObservers: { [key: string]: MutationObserver } = {};

  constructor(
    private moviesService: MoviesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.moviesService.getMovies(0).subscribe({
      next: (movies) => {
        this.allMovies.set(movies);
        this.categorizeMovies(movies);
      }
    });
  }

  private categorizeMovies(movies: Movie[]) {
    // Sort by rating for popular movies
    const sortedByRating = [...movies].sort((a, b) => b.rating - a.rating);

    // Filter by language
    const teluguMovies = movies.filter(movie => movie.tags?.includes('Telugu') ?? false);
    const hindiMovies = movies.filter(movie => movie.tags?.includes('Hindi') ?? false);
    const tamilMovies = movies.filter(movie => movie.tags?.includes('Tamil') ?? false);

    // Set the signals
    this.recommendedMovies.set(movies);
    this.popularMovies.set(sortedByRating);
    this.teluguMovies.set(teluguMovies);
    this.hindiMovies.set(hindiMovies);
    this.tamilMovies.set(tamilMovies);
  }

  ngAfterViewInit() {
    if (!this.movieContainers) return;

    this.movieContainers.forEach((container, index) => {
      const key = this.getContainerKey(index);
      this.setupScrollObserver(container, key);
    });
  }

  private getContainerKey(index: number): string {
    const keys = ['recommended', 'popular', 'telugu', 'hindi', 'tamil'];
    return keys[index] || 'unknown';
  }

  private setupScrollObserver(container: ElementRef, key: string) {
    const observer = new MutationObserver(() => {
      this.updateScrollState(container, key);
    });

    observer.observe(container.nativeElement, { childList: true });
    container.nativeElement.addEventListener('scroll', () => this.updateScrollState(container, key));
    this.updateScrollState(container, key);
    this.mutationObservers[key] = observer;
  }

  ngOnDestroy() {
    Object.values(this.mutationObservers).forEach(observer => observer.disconnect());
  }

  private updateScrollState(container: ElementRef, key: string) {
    if (!container) return;

    const element = container.nativeElement;
    const currentState = this.canScroll();
    currentState[key] = {
      left: element.scrollLeft > 0,
      right: element.scrollLeft < (element.scrollWidth - element.clientWidth - 10)
    };
    this.canScroll.set(currentState);
    this.cdr.detectChanges();
  }

  scrollMovies(direction: 'left' | 'right', container: ElementRef | undefined) {
    if (!container) return;

    container.nativeElement.scrollBy({
      left: direction === 'left' ? -this.scrollAmount : this.scrollAmount,
      behavior: 'smooth'
    });
  }

  canScrollLeft = (key: string) => this.canScroll()[key]?.left || false;
  canScrollRight = (key: string) => this.canScroll()[key]?.right || false;
}
