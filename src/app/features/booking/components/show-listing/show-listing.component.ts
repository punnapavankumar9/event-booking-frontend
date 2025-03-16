import { Component, effect, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../../movies/services/movies.service';
import { EventBookingStates, EventForShowList } from '../../types'
import { NoShowsAvailableComponent } from '../no-shows-available/no-shows-available.component';

@Component({
  selector: 'app-show-listing',
  imports: [
    NgClass,
    DatePipe,
    RouterLink,
    NoShowsAvailableComponent
  ],
  templateUrl: './show-listing.component.html',
  styleUrl: './show-listing.component.scss'
})
export class ShowListingComponent implements OnInit {
  dates = signal<Date[]>([]);
  selectedDate = signal<Date | null>(null)
  theaters = signal<{
    venueName: string,
    venueId: string,
    shows: EventForShowList[],
    cancellable: boolean,
    numberOfBookedAndBlockedSeats: number,
    totalSeats: number
  }[] | null>(null);
  movieInfo = signal<Movie | null>(null);
  movieId = signal<null | string>(null);
  currentWindowStart = signal<null | Date>(null);

  constructor(private eventService: EventService, private movieService: MoviesService, private router: Router, private route: ActivatedRoute, private toastService: ToastService) {
    route.params.subscribe(params => {
      this.movieId.set(params['movieId']);
    });
    effect(() => {
      const date = this.selectedDate();
      if (date) {
        this.fetchShowList();
      }
    });
  }

  ngOnInit() {
    if (!this.movieId()) {
      this.toastService.showToast({message: "Unable to find movieId", type: 'error'});
      this.router.navigate(["/"]);
    }
    this.fetchMovieInfo();
    this.fetchDates();
  }


  fetchShowList(): void {
    const currTime = new Date();
    let startTime = this.selectedDate()!;
    startTime.setHours(0, 0, 0);
    if (currTime.getDate() == startTime.getTime() && currTime.getMonth() == startTime.getMonth() && currTime.getFullYear() == startTime.getFullYear()) {
      startTime = currTime;
    }
    this.eventService.getShowListForCityAndBetweenStartAndEnd(this.movieId()!, "Hyderabad", startTime.toISOString(), this.getEndOfTheDayInUTC(this.selectedDate()!).toISOString())
    .subscribe((events) => {
      const groupEventsByTheater = Object.values(
        events.reduce((acc: any, event) => {
          if (!acc[event.venueId]) {
            acc[event.venueId] = {
              venueName: event.venueName,
              venueId: event.venueId,
              shows: [],
            };
          }
          acc[event.venueId].shows.push(event);
          return acc;
        }, {})
      );
      this.theaters.set(groupEventsByTheater as any);
    })
  }

  getEndOfTheDayInUTC(date: Date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0)
    return newDate;
  }


  fetchMovieInfo() {
    this.movieService.getMovieDetails(this.movieId()!).subscribe({
      next: movieInfo => {
        this.movieInfo.set(movieInfo);
      },
      error: err => {
        this.toastService.showToast({message: err.message, type: 'error'});
        this.router.navigate(["/"]);
      }
    })
  }


  fetchDates() {
    return this.eventService.getEventDatesForEventIdAfter(this.movieId()!, new Date())
    .subscribe((dates) => {
      this.dates.set(dates);
      this.selectedDate.set(dates[0]);
      this.currentWindowStart.set(dates[0]);
      this.updateDateWindow();
    })
  }

  selectDate(date: Date): void {
    if (this.isSelectedDate(date)) {
      return;
    }
    this.selectedDate.set(date);
  }

  previousWeek() {
    const newStart = new Date(this.currentWindowStart()!);
    newStart.setDate(newStart.getDate() - 5); // Move back 5 days
    this.currentWindowStart.set(newStart);
    this.updateDateWindow();
  }

  nextWeek() {
    const newStart = new Date(this.currentWindowStart()!);
    newStart.setDate(newStart.getDate() + 5); // Move forward 5 days
    this.currentWindowStart.set(newStart);
    this.updateDateWindow();
  }


  getShowtimeClass(showtime: any) {
    if (!showtime.availability) {
      return {available: true}
    }
    return {
      'available': showtime.availability === 'AVAILABLE',
      'fast-filling': showtime.availability === 'FAST FILLING'
    };
  }

  windowDates = signal<Date[]>([]);

  updateDateWindow() {
    const start = this.currentWindowStart();
    if (!start) {
      return;
    }
    const windowDates = [];
    for (let i = 0; i < 5; i++) {
      const newDate = new Date(start!);
      newDate.setDate(start!.getDate() + i);
      if (this.dates().some(d => d.toDateString() === newDate.toDateString())) {
        windowDates.push(newDate);
      }
    }
    this.windowDates.set(windowDates);
    if (!this.selectedDate() || !windowDates.some(d => d.toDateString() === this.selectedDate()!.toDateString())) {
      this.selectedDate.set(windowDates[0]); // Default to first date in window if no selection
    }
  }

  getAmOrPm(startTime: string) {
    return new Date(startTime).getHours() > 12 ? "PM" : "AM";
  }

  isSelectedDate(date: Date) {
    return this.selectedDate()?.getDate() == date.getDate();
  }

  getBookingsState(total: number, bookedOrBlocked: number): EventBookingStates {
    const percentage = ((bookedOrBlocked * 100) / total);
    if (percentage > 80) {
      return "Almost Full";
    } else if (percentage > 60) {
      return "Filling Fast";
    } else {
      return "Available";
    }
  }

  getAvailabilityClassName(availability: EventBookingStates) {
    if (availability == "Available") {
      return "available";
    } else if (availability == "Filling Fast") {
      return "filling-fast";
    } else return "almost-full";
  }
}
