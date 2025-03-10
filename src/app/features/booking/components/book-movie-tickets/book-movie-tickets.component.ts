import { Component, effect, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { EventService } from '../../services/event.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  BookingPageInfo,
  BookingSeat,
  OrderReqDetails,
  SeatingLayout,
  SeatLocation
} from '../../types';
import { buildSeatLayout } from '../../utils';
import { OrderDetailsComponent } from '../order-details/order-details.component';

@Component({
  selector: 'app-book-movie-tickets',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgTemplateOutlet, NgStyle, OrderDetailsComponent],
  templateUrl: './book-movie-tickets.component.html',
  styleUrl: './book-movie-tickets.component.scss'
})
export class BookMovieTicketsComponent implements OnInit {

  eventId = signal<string>(null as any);
  showSeatCountSelectionTab = signal<boolean>(true);
  bookingPageInfo = signal<BookingPageInfo>(null as any);
  layout = signal<SeatingLayout>(null as any);
  seatCountForm = new FormGroup({
    count: new FormControl(2, [Validators.required, Validators.min(1), Validators.max(6)]), // Default to 3
  });
  selectedSeats = signal<{ row: number, col: number, label: string }[]>([]);
  showOrderDetails = signal<boolean>(false);
  orderDetails = signal<{ order: OrderReqDetails, bookingPageInfo: BookingPageInfo }>(null as any);
  selectedSeatCount = 2;
  pricingTierMap = {} as any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private eventService: EventService,
  ) {
    this.route.params.subscribe(params => {
      this.eventId.set(params['movieId']);
    });
    this.fetchMovieInfo();
    effect(() => {
      console.log(this.selectedSeats());
    });
  }

  ngOnInit(): void {
    if (!this.eventId()) {
      this.toastService.showToast({message: "Invalid MovieId", type: 'error'});
      this.router.navigate(['/']);
    }
  }

  onSelectSeats() {
    const seatCount = this.seatCountForm.controls['count'].value;
    if (seatCount && this.seatCountForm.valid) {
      // Navigate to a seat selection page or toggle state
      this.showSeatCountSelectionTab.set(false);
      this.selectedSeatCount = this.seatCountForm.controls['count'].value!;
    } else {
      this.toastService.showToast({
        message: "Please select a valid number of seats",
        type: 'error'
      });
    }
  }

  private fetchMovieInfo() {
    this.eventService.getBookingPageInfo(this.eventId()).subscribe(bookingPageInfo => {
      this.bookingPageInfo.set(bookingPageInfo);
      bookingPageInfo.event.pricingTierMaps.forEach(p => {
        this.pricingTierMap[p.name] = p.price;
      })
      this.layout.set(buildSeatLayout(bookingPageInfo.seatingLayout));
      this.updateLayoutWithAvailableSeats();
    });
  }

  prevTierName: string | null = null;

  renderTierHeader(layout: SeatingLayout | null, rowId: number) {
    if (rowId == 0) {
      this.prevTierName = this.layout()[rowId][0].tier;
      return true;
    }
    const currTierName = this.layout()[rowId][0].tier;
    if (this.prevTierName == currTierName) {
      return false;
    }
    this.prevTierName = currTierName;
    return true;
  }

  availableSeatCounter = 1;

  resetAvailableSeatCount() {
    this.availableSeatCounter = 1;
    return 1;
  }

  blockedRow(rowId: number) {
    let flag = true;
    for (let seat of this.layout()[rowId]) {
      if (!seat.isSpace) {
        flag = false;
      }
    }
    return flag ? 1 : 0;
  }

  getNumberOfEmptyFullyBlockedRows(rowId: number) {
    let cnt = 0;
    for (let i = 0; i < rowId; i++) {
      cnt += this.blockedRow(i);
    }
    return cnt;
  }

  incrementAvailableSeatCount() {
    this.availableSeatCounter++;
  }

  getColumnIndicator(rowId: number) {
    let rows = this.getNumberOfEmptyFullyBlockedRows(rowId);
    return (((rowId - rows) >= 26) ? 'A' : '') + String.fromCharCode(65 + ((rowId - rows) % 26));
  }

  isSeatAlreadySelected(rowId: number, colId: number) {
    for (const seat of this.selectedSeats()) {
      if (seat.col == colId && seat.row == rowId) {
        return true;
      }
    }
    return false;
  }

  selectSeat(seat: BookingSeat, label: string) {
    if (seat.isAvailable === false) {
      return;
    }
    if (this.isSeatAlreadySelected(seat.row, seat.column)) {
      this.deselectSeat(seat.row, seat.column);
      return;
    }
    if (this.selectedSeats().length >= this.selectedSeatCount) {
      this.selectedSeats.update(s => {
        const removedSeat = s.splice(0, 1);
        this.layout()[removedSeat[0].row][removedSeat[0].col].isSelected = false;
        return s;
      })
    }
    this.selectedSeats().push({row: seat.row, col: seat.column, label});
    this.layout()[seat.row][seat.column].isSelected = true;
  }

  private deselectSeat(rowId: number, colId: number) {
    this.selectedSeats.update(s => {
      for (let i = 0; i < s.length; i++) {
        if (s[i].col == colId && s[i].row == rowId) {
          s.splice(i, 1);
          this.layout()[rowId][colId].isSelected = false;
          break;
        }
      }
      return s;
    });
  }

  hideSeatSelectionTab() {
    this.showSeatCountSelectionTab.set(true);
    this.selectedSeats.update(s => {
      s.forEach(seat => {
        this.layout()[seat.row][seat.col].isSelected = false;
      })
      return [];
    })
  }

  areDatesEqual(date1: Date, date2: Date) {
    return date2.getDate() == date1.getDate() && date2.getMonth() == date1.getMonth() && date2.getFullYear() == date1.getFullYear();
  }

  isTomorrow(date: Date) {
    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return this.areDatesEqual(date, tomorrowDate);
  }

  getShowTime() {
    const date = new Date(this.bookingPageInfo().event.eventDurationDetails.startTime);
    let dateString = "";
    if (this.areDatesEqual(date, new Date())) {
      dateString += "Today, "
    } else if (this.isTomorrow(date)) {
      dateString += "Tomorrow, "
    } else {
      dateString += date.toLocaleString(
        'en-US', {weekday: 'long'}) + ", ";
    }

    dateString += `${date.getDate()} ${date.toLocaleString('en-US', {month: 'short'})} `;
    dateString += date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return dateString;
  }

  calculateBill() {
    let bill = 0;
    this.selectedSeats().forEach(seat => {
      bill += this.pricingTierMap[this.layout()[seat.row][seat.col].tier];
    })
    return bill;
  }

  proceedToPayment() {
    const seats: SeatLocation[] = [];
    this.selectedSeats().forEach(seat => {
      seats.push({row: seat.row, column: seat.col});
    });
    const seatLabels: string[] = [];
    this.selectedSeats().forEach(seat => {
      seatLabels.push(seat.label);
    })

    const order: OrderReqDetails = {
      info: {
        seats,
        seatLabels
      },
      eventId: this.eventId(),
      amount: this.calculateBill(),
      eventType: "MOVIE"
    }

    this.orderDetails.set({
      order,
      bookingPageInfo: this.bookingPageInfo(),
    })
    this.showOrderDetails.set(true);
  }

  private updateLayoutWithAvailableSeats() {
    this.layout.update(layout => {
      this.bookingPageInfo().event.seatState?.bookedSeats?.forEach(seat => {
        layout[seat.row][seat.column].isAvailable = false;
      })
      this.bookingPageInfo().event.seatState?.blockedSeats?.forEach(seat => {
        layout[seat.row][seat.column].isAvailable = false;
      })
      return layout;
    })
  }
}
