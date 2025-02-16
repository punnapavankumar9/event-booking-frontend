import { AbstractControl, FormArray, ValidatorFn } from '@angular/forms';

export const validateTierWiseRowCount: ValidatorFn = (tiers: AbstractControl) => {
  if (!(tiers instanceof FormArray)) {
    return null;
  }

  const parentFormGroup = tiers.parent;
  if (!parentFormGroup) {
    return null;
  }

  const totalRowsControl = parentFormGroup.get('rows');
  if (!totalRowsControl) {
    return null;
  }

  const totalRows = totalRowsControl.value;
  const tierRowsSum = tiers.controls.map(control => control.get('rows')?.value || 0)
  .reduce((acc, value) => acc + value, 0);

  return totalRows != tierRowsSum ? {rowsMismatch: true} : null;
}
