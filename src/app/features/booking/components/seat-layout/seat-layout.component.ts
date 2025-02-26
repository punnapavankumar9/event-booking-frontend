import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { SeatLayoutService } from '../../services/seat-layout.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs';
import { SeatingLayout, ServerSideSeatingLayout } from '../../types';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { buildSeatLayout } from '../../utils';

@Component({
  selector: 'app-seat-layout',
  imports: [
    NgTemplateOutlet,
    NgClass,
    NgStyle
  ],
  templateUrl: './seat-layout.component.html',
  styleUrl: './seat-layout.component.scss'
})
export class SeatLayoutComponent implements OnInit {
  route = inject(ActivatedRoute);
  layoutId = toSignal(this.route.params.pipe(take(1), map(params => params['id'])));
  idViaInput = input<string>(undefined, {alias: 'id'});
  seatLayoutService = inject(SeatLayoutService);
  toastService = inject(ToastService);
  router = inject(Router);

  serverResponse = signal<ServerSideSeatingLayout | null>(null);
  layout = signal<SeatingLayout>(null as any);

  ngOnInit(): void {
    const id = this.layoutId() || this.idViaInput?.();
    if (!id) {
      this.toastService.showToast({message: "Invalid Router, Id must not be null", type: "error"});
      this.router.navigate(['/']);
      return;
    }
    this.seatLayoutService.getSeatLayout(id).subscribe({
      next: data => {
        this.serverResponse.set(data);
        this.layout.set(buildSeatLayout(data));
      },
      error: err => {
        this.toastService.showToast({message: err.message, type: "error"});
      }
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
    return this.availableSeatCounter++;
  }

  getColumnIndicator(rowId: number) {
    let rows = this.getNumberOfEmptyFullyBlockedRows(rowId);
    return (((rowId - rows) >= 26) ? 'A' : '') + String.fromCharCode(65 + ((rowId - rows) % 26));
  }
}
