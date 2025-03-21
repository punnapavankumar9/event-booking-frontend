import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Event, OrderResDetails, OrderStatus, Venue } from '../../types';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Movie } from '../../../core/types';
import { MoviesService } from '../../../movies/services/movies.service';
import { EventService } from '../../services/event.service';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { QrCodeComponent } from '../qr-code/qr-code.component';
import { VenueService } from '../../services/venue.service';
import { catchError, EMPTY, interval, startWith, Subscription, switchMap, tap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-movie-booking-confirmation',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    NgIf,
    CurrencyPipe,
    RouterLink,
    QrCodeComponent
  ],
  templateUrl: './movie-booking-confirmation.component.html',
  styleUrl: './movie-booking-confirmation.component.scss'
})
export class MovieBookingConfirmationComponent implements OnInit, OnDestroy {
  orderId: string;
  orderDetails = signal<OrderResDetails | null>(null as any);
  movieInfo = signal<Movie>(null as any);
  eventInfo = signal<Event>(null as any);
  venueInfo = signal<Venue>(null as any);
  loading = true;
  error = false;
  canCancel = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private movieService: MoviesService,
    private eventService: EventService,
    private venueService: VenueService,
    private toastService: ToastService
  ) {
    this.orderId = '';
  }

  ngOnDestroy(): void {
    this.orderDetailsSubscription?.unsubscribe();
  }

  orderDetailsSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';

    if (this.orderId) {
      this.orderDetailsSubscription = this.loadOrderDetails().subscribe();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  private getOrderDetails() {
    return this.orderService.getOrderResDetails(this.orderId);
  }

  private loadOrderDetails() {
    return interval(3000).pipe(
      startWith(0),
      switchMap(() => this.orderService.getOrderResDetails(this.orderId)),
      tap(data => {
        this.orderDetails.set(data);
        this.loading = false;
        if (this.eventInfo() == null) {
          this.loadEventInfo(data.eventId);
        }
        if (data.orderStatus != "PENDING") {
          this.orderDetailsSubscription?.unsubscribe();
        }
      }),
      catchError(err => {
        console.error('Failed to load order details:', err);
        this.error = true;
        this.loading = false;
        return EMPTY;
      })
    );
  }

  private updateCancelButtonVisibility() {
    if (!this.orderDetails() || !this.eventInfo()) return;

    const startTime = new Date(this.eventInfo()!.eventDurationDetails.startTime);
    const currentTime = new Date();
    const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60000);

    this.canCancel.set(
      (this.orderDetails()!.orderStatus === "SUCCEEDED") &&
      currentTime < thirtyMinutesBefore
    );
  }

  private loadEventInfo(eventId: string): void {
    this.eventService.findEventById(eventId).subscribe({
      next: (data) => {
        this.eventInfo.set(data);
        this.updateCancelButtonVisibility();
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

  cancelOrder() {
    if (!this.orderDetails() || !this.canCancel()) return;

    this.loading = true;
    this.orderService.cancelOrder(this.orderDetails()!.id).subscribe({
      next: (updatedOrder) => {
        this.orderDetails.set(updatedOrder);
        this.updateCancelButtonVisibility();
        this.toastService.showToast({
          message: 'Order cancelled successfully',
          type: 'success'
        });
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showToast({
          message: 'Failed to cancel order',
          type: 'error'
        });
        this.loading = false;
      }
    });
  }

  getHeaderClass(): string {
    const status = this.orderDetails()?.orderStatus;
    switch (status) {
      case 'SUCCEEDED': return 'success-header';
      case 'FAILED': return 'failed-header';
      case 'CANCELLED': return 'cancelled-header';
      case 'PENDING': return 'pending-header';
      default: return '';
    }
  }

  getStatusClass(): string {
    const status = this.orderDetails()?.orderStatus;
    switch (status) {
      case 'SUCCEEDED': return 'success';
      case 'FAILED': return 'failed';
      case 'CANCELLED': return 'cancelled';
      case 'PENDING': return 'pending';
      default: return '';
    }
  }

}
