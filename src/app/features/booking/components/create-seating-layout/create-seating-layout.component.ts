import { Component, signal } from '@angular/core';
import { NgClass, NgForOf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ScreenPosition, Seat, SeatingLayout, ServerSideSeatingLayout } from '../../types';
import { ToastService } from '../../../core/services/toast.service';
import { validateTierWiseRowCount } from '../../validators';
import { SeatLayoutService } from '../../services/seat-layout.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { hasError } from '../../../utils/utils';


type TierFormGroup = FormGroup<{
  rows: FormControl<number | null>,
  tierName: FormControl<string | null>
}>;

@Component({
  selector: 'app-create-seating-layout',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgClass,
    FormsModule,
    NgTemplateOutlet,
    NgStyle
  ],
  templateUrl: './create-seating-layout.component.html',
  styleUrl: './create-seating-layout.component.scss'
})
export class CreateSeatingLayoutComponent {
  page = signal(0);
  availableSeatCounter = 1;
  validationMeta = {
    maxAllowedColumns: 50,
    maxAllowedRows: 50,
    minAllowedRows: 5,
    minAllowedColumns: 5,
    nameMinLength: 5,
    nameMaxLength: 50
  }

  screenPosition = signal<ScreenPosition>('TOP');
  seatingLayout = signal<SeatingLayout>(null as unknown as SeatingLayout);
  tierMap: { [key: number]: TierFormGroup } = {}
  activeTier: TierFormGroup | null = null;

  form = new FormGroup({
    rows: new FormControl(10, [Validators.required, Validators.min(this.validationMeta.minAllowedRows), Validators.max(this.validationMeta.maxAllowedRows)]),
    columns: new FormControl(10, [Validators.required, Validators.min(this.validationMeta.minAllowedColumns), Validators.max(this.validationMeta.maxAllowedColumns)]),
    name: new FormControl(null, [Validators.required, Validators.maxLength(this.validationMeta.nameMaxLength), Validators.minLength(this.validationMeta.nameMinLength)]),
    tiers: new FormArray([] as TierFormGroup[], {validators: [validateTierWiseRowCount, Validators.min(1)]}),
  });


  constructor(private toastService: ToastService, private seatLayoutService: SeatLayoutService, private router: Router) {
    this.addTier();
    this.form.controls.rows.valueChanges.subscribe(() => {
      this.form.controls.tiers.updateValueAndValidity()
    });
  }

  // tier utils
  addTier() {
    this.form.controls.tiers.push(this.getTierFormGroup());
  }

  getTierFormGroup() {
    return new FormGroup({
      rows: new FormControl(10, [Validators.required, Validators.min(1), Validators.max(this.validationMeta.maxAllowedRows)]),
      tierName: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z]+$')]),
    })
  }

  removeTier(index: number) {
    this.removeTierInSeatingLayout(index);
    this.form.controls.tiers.removeAt(index);
  }

  removeTierInSeatingLayout(index: number) {

  }

  updateTierNameInSeatingLayout() {
    this.generateTierMap();
    for (let i = 0; i < this.seatingLayout().length; i++) {
      const tierName = this.tierMap[i].controls.tierName.value!;
      for (let j = 0; j < this.seatingLayout()[i].length; j++) {
        this.seatingLayout()[i][j].tier = tierName;
      }
    }
  }

  generateTierMap() {
    if (this.form.valid) {
      this.tierMap = {};
      const tierList = this.form.controls.tiers!;
      let activeTier = tierList.controls[0];
      let cnt = activeTier.value.rows!;
      let tierCnt = 1;
      const rows = this.form.controls.rows;
      for (let i = 0; i < rows.value!; i++) {
        this.tierMap[i] = activeTier!;
        cnt--;
        if (cnt == 0 && tierCnt != tierList.value.length!) {
          activeTier = tierList.controls[tierCnt++];
          cnt = activeTier.value.rows!;
        }
      }
    }
  }

  resetTierName() {
    this.activeTier = null;
    return false;
  }

  deleteRowFromTier(tier: TierFormGroup, decreaseCount = true) {
    if (!tier) return;
    if (decreaseCount) {
      tier.controls.rows.setValue(tier.controls.rows.value! - 1);
    }
    this.generateTierMap();
  }

  addRowToTier(tier: TierFormGroup, increaseCount = true) {
    if (increaseCount) {
      tier.controls.rows.setValue(tier.controls.rows.value! + 1);

    }
    this.generateTierMap();
  }

  renderTierHeader(rowId: number) {
    if (this.activeTier == null) {
      this.activeTier = this.tierMap[0];
      return true;
    }
    const flag = this.tierMap[rowId].value.tierName != this.activeTier.value.tierName;
    this.activeTier = this.tierMap[rowId];
    return flag;
  }

  movePage(direction: number) {
    if ((this.page() == 0 && direction == -1) || (this.page() == 1 && direction == 1)) {
      return;
    }
    this.generateTierMap();
    this.page.set(direction + this.page());
    if (this.page() == 1) {
      this.refreshSeatingLayout()
    }
  }

  // seating layout utils
  createLayout() {
    if (!this.form.valid) {
      this.toastService.showToast({message: "Invalid seat state", type: 'error'})
      return;
    }

    this.updateTierNameInSeatingLayout();

    const capacity = this.seatingLayout().reduce((rowSum, row) => {
      return rowSum + row.reduce((colSum, seat) => (seat.isSpace ? 0 : 1) + colSum, 0);
    }, 0);
    const seats: Seat[] = [];
    for (let row of this.seatingLayout()) {
      for (const seat of row) {
        seats.push({row: seat.row, column: seat.column, isSpace: seat.isSpace, tier: seat.tier});
      }
    }

    const formData = this.form.value;
    const postData: ServerSideSeatingLayout = {
      rows: formData.rows!,
      columns: formData.columns!,
      capacity,
      seats,
      screenPosition: this.screenPosition(),
      name: formData.name!
    };

    this.seatLayoutService.createSeatingLayout(postData).subscribe({
      next: (response: ServerSideSeatingLayout) => {
        this.toastService.showToast({
          message: "Seating Layout Created Successfully",
          type: 'success'
        });
        this.router.navigate(['/booking', 'seating', response.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showToast({
          message: error?.error?.message ?? error.message,
          type: 'error'
        });
      }
    });
  }

  refreshSeatingLayout() {
    if (this.seatingLayout()) {
      this.updateSeatingLayout();
      return;
    }
    this.generateSeatingLayout();
  }

  generateSeatingLayout() {
    const rows = this.form.value.rows!;
    const cols = this.form.value.columns!;
    const layout: SeatingLayout = [];
    for (let i = 0; i < rows; i++) {
      const column: Seat[] = [];
      for (let j = 0; j < cols; j++) {
        column.push({row: i, column: j, isSpace: false, tier: 'dummy'});
      }
      layout.push(column);
    }
    this.seatingLayout.set(layout);
  }

  updateSeatingLayout() {
    this.generateTierMap();
    const rows = this.form.value.rows!;
    if (this.seatingLayout().length > rows) {
      while (this.seatingLayout().length > rows) {
        this.deleteRow(this.seatingLayout().length - 1, false);
      }
    }
    if (this.seatingLayout().length < rows) {
      while (this.seatingLayout().length < rows) {
        this.duplicateAndAppendRow(this.seatingLayout().length - 1, false);
      }
    }

    const columns = this.form.value.columns!;
    if (this.seatingLayout()[0].length > columns) {
      while (this.seatingLayout()[0].length > columns) {
        this.deleteColumn(this.seatingLayout()[0].length - 1, false);
      }
    }

    if (this.seatingLayout()[0].length < columns) {
      while (this.seatingLayout()[0].length < columns) {
        this.duplicateColumn(this.seatingLayout()[0].length - 1, false);
      }
    }
  }

  // seat selection and modification utils
  duplicateAndAppendRow(idx: number, increaseCount = true) {
    if (this.seatingLayout().length != this.validationMeta.maxAllowedRows) {
      const row = this.seatingLayout()[idx];
      const newRow: Seat[] = [];
      for (const seat of row) {
        newRow.push({...seat});
      }
      if (increaseCount) {
        this.form.controls.rows.setValue(this.form.value.rows! + 1);
      }
      this.seatingLayout().splice(idx, 0, newRow)
      this.addRowToTier(this.tierMap[idx], increaseCount);
    } else {
      this.toastService.showToast({message: "max allowed row limit reached", type: 'warning'})
    }
  }

  duplicateColumn(colIdx: number, increaseCount = true) {
    if (this.form.valid && this.seatingLayout()[0].length < this.validationMeta.maxAllowedColumns) {
      const col = [];
      const rows = this.seatingLayout().length;
      for (let i = 0; i < rows; i++) {
        this.seatingLayout()[i].splice(colIdx, 0, {...this.seatingLayout()[i][colIdx]});
      }
      if (increaseCount) {
        this.form.controls.columns.setValue(this.form.value.columns! + 1);
      }
    } else {
      this.toastService.showToast({type: 'warning', message: 'Max allowed column limit reached'});
    }
  }

  deleteColumn(idx: number, decreaseCount = true) {
    if (this.seatingLayout().length == this.validationMeta.minAllowedColumns) {
      this.toastService.showToast({message: "min allowed column limit reached", type: 'warning'});
      return;
    }
    const layout = this.seatingLayout();
    const rows = layout.length;
    for (let i = 0; i < rows; i++) {
      layout[i].splice(idx, 1);
    }
    if (decreaseCount) {
      this.form.controls.columns.setValue(this.form.value.columns! - 1);

    }
  }

  deleteRow(idx: number, decreaseCount = true) {
    if (this.seatingLayout().length == this.validationMeta.minAllowedRows) {
      this.toastService.showToast({message: "min allowed rows limit reached", type: 'warning'});
      return;
    }
    if (decreaseCount) {
      this.form.controls.rows.setValue(this.form.value.rows! - 1);
    }
    this.seatingLayout().splice(idx, 1);
    this.deleteRowFromTier(this.tierMap[idx], decreaseCount);
  }

  toggleSeatSelection(rowId: number, colId: number) {
    const seat = this.seatingLayout()[rowId][colId];
    seat.isSelected = !seat.isSelected;
  }

  selectRow(rowId: number) {
    for (const seat of this.seatingLayout()[rowId]) {
      seat.isSelected = true;
    }
  }

  deselectRow(rowId: number) {
    for (const seat of this.seatingLayout()[rowId]) {
      seat.isSelected = false;
    }
  }

  selectColumn(colId: number) {
    for (const row of this.seatingLayout()) {
      row[colId].isSelected = true
    }
  }

  deselectColumn(colId: number) {
    for (const row of this.seatingLayout()) {
      row[colId].isSelected = false;
    }
  }

  invertSeatSelection() {
    for (const row of this.seatingLayout()) {
      for (const seat of row) {
        seat.isSelected = !seat.isSelected;
      }
    }
  }

  selectAllSeats() {
    for (const row of this.seatingLayout()) {
      for (const seat of row) {
        seat.isSelected = true;
      }
    }
  }

  deselectAllSeats() {
    for (const row of this.seatingLayout()) {
      for (const seat of row) {
        seat.isSelected = false;
      }
    }
  }

  invertColumnSelection(idx: number) {
    if (this.seatingLayout()[0][idx].isSelected) {
      this.deselectColumn(idx);
    } else {
      this.selectColumn(idx);
    }
  }

  incrementAvailableSeatCount() {
    return this.availableSeatCounter++;
  }

  invertRowSelection(rowId: number) {
    if (this.seatingLayout()[rowId][0].isSelected) {
      this.deselectRow(rowId);
    } else {
      this.selectRow(rowId);
    }
  }

  // marking seat as space/available
  markAsSpace(deselect: boolean = false) {
    for (const row of this.seatingLayout()) {
      for (const seat of row) {
        if (seat.isSelected) {
          seat.isSpace = true;
          if (deselect) {
            seat.isSelected = false;
          }
        }
      }
    }
  }

  markAsAvailable(deselect: boolean = false) {
    for (const row of this.seatingLayout()) {
      for (const seat of row) {
        if (seat.isSelected) {
          seat.isSpace = false;
          if (deselect) {
            seat.isSelected = false;
          }
        }
      }
    }
  }

  resetAvailableSeatCount() {
    this.availableSeatCounter = 1;
    return 1;
  }

  getColumnIndicator(rowId: number) {
    let rows = this.getNumberOfEmptyFullyBlockedRows(rowId);
    return (((rowId - rows) >= 26) ? 'A' : '') + String.fromCharCode(65 + ((rowId - rows) % 26));
  }

  getNumberOfEmptyFullyBlockedRows(rowId: number) {
    let cnt = 0;
    for (let i = 0; i < rowId; i++) {
      cnt += this.blockedRow(i);
    }
    return cnt;
  }

  blockedRow(rowId: number) {
    let flag = true;
    for (let seat of this.seatingLayout()[rowId]) {
      if (!seat.isSpace) {
        flag = false;
      }
    }
    return flag ? 1 : 0;
  }

  updatePosition(position: ScreenPosition) {
    this.screenPosition.set(position);
  }

  protected readonly hasError = hasError;
}
