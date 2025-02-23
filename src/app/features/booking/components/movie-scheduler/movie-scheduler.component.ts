import { Component, effect, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ToastService } from "../../../core/services/toast.service";
import { Movie } from "../../../core/types";
import { MoviesService } from "../../../movies/services/movies.service";
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { ImageLoaderDirective } from "../../../core/directives/image-loading-status";
import { EventSchedulerComponent } from "../event-scheduler/event-scheduler.component";
import { ExistingEventsComponent } from "../existing-events/existing-events.component"; // New import
import { Event, EventInfo, ScheduledEvent, VenueWithNameAndLayoutId } from "../../types";
import { debounceTime, distinctUntilChanged, Subject, switchMap, take } from 'rxjs';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { hasError } from '../../../utils/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { SeatLayoutService } from '../../services/seat-layout.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-movie-scheduler',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    ImageLoaderDirective,
    EventSchedulerComponent,
    ExistingEventsComponent, // Add new component to imports
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgClass,
    RouterLink
  ],
  templateUrl: './movie-scheduler.component.html',
  styleUrls: ['./movie-scheduler.component.scss'] // Fixed typo: styleUrl -> styleUrls
})
export class MovieSchedulerComponent implements OnInit {
  movieId = signal<string | null>(null);
  movieDetails: Movie = null as unknown as Movie;
  showScheduler = signal(true); // Toggle state: true = scheduler, false = existing events

  eventForm: FormGroup<{
    venueId: FormControl<string | null>;
    pricingTierMaps: FormArray<FormGroup<any>>;
  }>;

  eventSchedulerComponent = viewChild(EventSchedulerComponent);

  venueSearchQuery = signal('');
  venueSuggestions = signal<any[]>([]);
  selectedVenue = signal<any | null>(null);

  seatingTiers = signal<string[]>([]);
  seatingLayoutSubject = new Subject<VenueWithNameAndLayoutId>();

  get pricingTierMaps(): FormArray {
    return this.eventForm.get('pricingTierMaps') as FormArray;
  }

  onVenueSearch(query: string): void {
    this.venueSearchQuery.set(query);
  }

  selectVenue(venue: any): void {
    this.selectedVenue.set(venue);
    this.seatingLayoutSubject.next(venue);
    this.eventForm.patchValue({venueId: venue.id});
    this.venueSearchQuery.set('');
    this.venueSuggestions.set([]);
  }

  venueSearchSubject = new Subject<string>();

  constructor(
    route: ActivatedRoute,
    seatingService: SeatLayoutService,
    venueService: VenueService,
    private router: Router,
    private toastService: ToastService,
    private movieService: MoviesService,
    private eventService: EventService
  ) {
    route.params.subscribe(params => {
      this.movieId.set(params['id']);
    });
    this.eventForm = new FormGroup({
      venueId: new FormControl(''),
      pricingTierMaps: new FormArray([] as FormGroup[])
    });

    effect(() => {
      const query = this.venueSearchQuery();
      this.venueSearchSubject.next(query);
    });

    this.seatingLayoutSubject.pipe(
      distinctUntilChanged(),
      debounceTime(200),
      switchMap(venue => seatingService.getTierNames(venue.seatingLayoutId))
    ).subscribe({
      next: (data) => this.seatingTiers.set(data),
      error: (err: HttpErrorResponse) => toastService.showToast({
        message: err.message,
        type: 'error'
      })
    });

    this.venueSearchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => venueService.searchVenues(query))
    ).subscribe({
      next: (venues) => this.venueSuggestions.set(venues),
      error: (err: HttpErrorResponse) => {
        this.toastService.showToast({message: err.message, type: 'error'});
      }
    });

    effect(() => {
      const tiers = this.seatingTiers();
      this.pricingTierMaps.clear();
      tiers.forEach((tier: string) => {
        this.pricingTierMaps.push(new FormGroup({
          name: new FormControl({value: tier, disabled: true}),
          price: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(250_000)]),
        }));
      });
    });
  }

  ngOnInit() {
    if (this.movieId()) {
      this.movieService.getMovieDetails(this.movieId()!).pipe(take(1)).subscribe({
        next: result => this.movieDetails = result,
        error: err => {
          this.toastService.showToast({type: 'error', message: err.message});
        }
      });
    } else {
      this.toastService.showToast({message: "Invalid URL", type: 'error'});
      this.router.navigate(['/']);
    }
  }

  extractLanguages(tags: string[]): string {
    const languages = tags.filter(tag => ['Telugu', 'Tamil', 'Hindi', 'English', 'Kannada'].map(lang => lang.toLowerCase()).includes(tag.toLowerCase()));
    return languages.length ? languages.join(', ') : 'N/A';
  }

  getEventInfo(): EventInfo {
    if (!this.movieDetails) {
      throw new Error('Movie details not loaded');
    }
    return {
      duration: this.movieDetails.duration,
      startDate: this.movieDetails.releaseDate,
      eventDurationCategory: "SHORT_TERM"
    };
  }


  scheduledEvents: ScheduledEvent[] = [];

  collectEventsFromScheduler($event: ScheduledEvent[]) {
    this.scheduledEvents = $event;
  }

  invokeCollectEventsFromScheduler() {
    this.eventSchedulerComponent()?.validateEventsAndSendToParent();
  }

  onSubmit(): void {
    if (this.selectedVenue() == null) {
      this.toastService.showToast({message: "Please select a venue", type: 'error'});
      return;
    }
    this.invokeCollectEventsFromScheduler();
    if (this.scheduledEvents.length === 0) {
      this.toastService.showToast({message: "No events scheduled to submit", type: 'error'});
      return;
    }
    const events: Event[] = [];
    const formValue = this.eventForm.getRawValue();
    for (const event of this.scheduledEvents) {
      // Convert local Date objects to UTC ISO strings
      const startTimeUTC = event.startDate.toISOString(); // Converts local Date to UTC ISO string
      const endTimeUTC = event.endDate.toISOString();     // Converts local Date to UTC ISO string

      if (isNaN(new Date(startTimeUTC).getTime()) || isNaN(new Date(endTimeUTC).getTime())) {
        this.toastService.showToast({
          message: "Invalid date format in scheduled event",
          type: 'error'
        });
        return;
      }

      events.push({
        eventType: "MOVIE",
        eventId: this.movieDetails.id!,
        name: this.movieDetails.title!,
        venueId: this.selectedVenue().id,
        openForBooking: event.isOpenForBooking,
        eventDurationDetails: {
          eventDurationType: "SHORT_TERM",
          startTime: startTimeUTC, // UTC ISO string
          endTime: endTimeUTC      // UTC ISO string
        },
        pricingTierMaps: formValue.pricingTierMaps as any
      });
    }
    this.eventService.createEvents(events).subscribe({
      next: result => this.toastService.showToast({
        message: "Events Created Successfully",
        type: 'success'
      }),
      error: err => this.toastService.showToast({message: err.message, type: 'error'})
    });
  }

  toggleView(): void {
    this.showScheduler.set(!this.showScheduler());
  }

  protected readonly hasError = hasError;
}
