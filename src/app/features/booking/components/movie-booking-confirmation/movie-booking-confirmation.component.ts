import { Component, OnInit, signal } from '@angular/core';
import { Event, OrderResDetails, Venue } from '../../types';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../../movies/services/movies.service';
import { EventService } from '../../services/event.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { QrCodeComponent } from '../qr-code/qr-code.component';
import { VenueService } from '../../services/venue.service';

@Component({
  selector: 'app-movie-booking-confirmation',
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    RouterLink,
    QrCodeComponent
  ],
  templateUrl: './movie-booking-confirmation.component.html',
  styleUrl: './movie-booking-confirmation.component.scss'
})
export class MovieBookingConfirmationComponent implements OnInit {
  orderId: string;
  orderDetails: OrderResDetails | null = null;
  movieInfo = signal<Movie>(null as any);
  eventInfo = signal<Event>(null as any);
  venueInfo = signal<Venue>(null as any);
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private movieService: MoviesService,
    private eventService: EventService,
    private venueService: VenueService,
  ) {
    this.orderId = '';
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';

    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  private loadOrderDetails(): void {
    this.orderService.getOrderResDetails(this.orderId).subscribe({
      next: (data) => {
        this.orderDetails = data;
        this.loading = false;
        console.log("event details", data)
        this.loadEventInfo(data.eventId);
      },
      error: (err) => {
        console.error('Failed to load order details:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadEventInfo(eventId: string): void {
    this.eventService.findEventById(eventId).subscribe({
      next: (data) => {
        this.eventInfo.set(data);
        console.log(data);
        this.loadMovieDetails(data.eventId);
        this.loadVenueInfo(data.venueId);
      },
      error: (err) => {
        console.error('Failed to load movie details:', err);
      }
    })
  }

  private loadVenueInfo(venueId: string): void {
    this.venueService.getVenueDetails(venueId).subscribe({
      next: (data) => {
        this.venueInfo.set(data);
      },
      error: (err) => {
        console.error('Failed to load venue details:', err);
      }
    })
  }

  private loadMovieDetails(movieId: string): void {
    this.movieService.getMovieDetails(movieId).subscribe({
      next: (data) => {
        this.movieInfo.set(data);
      },
      error: (err) => {
        console.error('Failed to load movie details:', err);
      }
    })
  }

  downloadTicket(): void {
    // Implement ticket download functionality
    // this.orderService.downloadTicket(this.orderId).subscribe({
    //   next: (response) => {
    //     // Create a blob from the response and open download link
    //     const blob = new Blob([response], { type: 'application/pdf' });
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `ticket-${this.orderId}.pdf`;
    //     link.click();
    //     window.URL.revokeObjectURL(url);
    //   },
    //   error: (err) => {
    //     console.error('Failed to download ticket:', err);
    //   }
    // });
  }

  emailReceipt(): void {
    // Implement email receipt functionality
    // this.orderService.emailReceipt(this.orderId).subscribe({
    //   next: () => {
    //     // Show success message
    //     alert('Receipt sent to your email');
    //   },
    //   error: (err) => {
    //     console.error('Failed to email receipt:', err);
    //     alert('Failed to send receipt to your email');
    //   }
    // });
  }

}
