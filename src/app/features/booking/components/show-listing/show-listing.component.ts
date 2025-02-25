import { Component, effect, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../../movies/services/movies.service';
import { Event } from '../../types'

@Component({
  selector: 'app-show-listing',
  imports: [
    NgClass,
    DatePipe
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
    shows: Event[],
    cancellable: boolean
  }[] | null>(null);
  movieInfo = signal<Movie | null>(null);
  movieId = signal<null | string>(null);
  activeDate = signal<null | Date>(null);

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
    this.eventService.getShowListForCityAndBetweenStartAndEnd(this.movieId()!, "Hyderabad", this.selectedDate()!.toISOString(), this.getEndOfTheDayInUTC(this.selectedDate()!).toISOString())
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
      console.log(groupEventsByTheater);
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
    })
  }

  selectDate(date: Date): void {
    if (this.isSelectedDate(date)) {
      return;
    }
    this.selectedDate.set(date);
    this.fetchShowList();
  }

  previousWeek() {
    // Placeholder for shifting dates backward
    console.log('Previous week');
  }

  nextWeek() {
    // Placeholder for shifting dates forward
    console.log('Next week');
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

  getAmOrPm(startTime: string) {
    return new Date(startTime).getHours() > 12 ? "PM" : "AM";
  }

  isSelectedDate(date: Date) {
    return this.selectedDate()?.getDate() == date.getDate();
  }
}
