import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { hasError } from '../../../utils/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LocationService } from '../../services/location.service';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../types';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-venue',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './create-venue.component.html',
  styleUrl: './create-venue.component.scss'
})
export class CreateVenueComponent {
  validationMeta = {
    stringFieldMinLength: 5,
    stringFieldMaxLength: 50,
    descriptionMinLength: 5,
    descriptionMaxLength: 4196,
    stateMinLength: 5,
    pincodeMin: 100_000,
    pincodeMax: 999_999,
    urlMaxLength: 1000,
    minCapacity: 5,
    maxCapacity: 50_000,
    countryMinLength: 2,
  }

  countries = signal<string[]>([]);
  states = signal<string[]>([]);
  cities = signal<string[]>([]);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(this.validationMeta.stringFieldMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
    description: new FormControl('', [Validators.required, Validators.minLength(this.validationMeta.descriptionMinLength), Validators.maxLength(this.validationMeta.descriptionMaxLength)]),
    capacity: new FormControl(0, [Validators.required, Validators.min(this.validationMeta.minCapacity), Validators.max(this.validationMeta.maxCapacity)]),
    location: new FormControl('', [Validators.required, Validators.minLength(this.validationMeta.stringFieldMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
    country: new FormControl('', [Validators.required, Validators.minLength(this.validationMeta.countryMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
    pincode: new FormControl(100000, [Validators.required, Validators.min(this.validationMeta.pincodeMin), Validators.max(this.validationMeta.pincodeMax)]),
    state: new FormControl({
      value: '',
      disabled: true
    }, [Validators.required, Validators.minLength(this.validationMeta.stateMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
    city: new FormControl({
      value: '',
      disabled: true
    }, [Validators.required, Validators.minLength(this.validationMeta.stateMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
    googleMapsUrl: new FormControl('', [Validators.minLength(this.validationMeta.stringFieldMinLength), Validators.maxLength(this.validationMeta.urlMaxLength), Validators.pattern("^https://.+"), Validators.required]),
    seatingLayoutId: new FormControl('', [Validators.required, Validators.minLength(this.validationMeta.stringFieldMinLength), Validators.maxLength(this.validationMeta.stringFieldMaxLength)]),
  });


  constructor(private locationService: LocationService, private venueService: VenueService, private toastService: ToastService, private router: Router) {

    this.locationService.getCountries().subscribe(countries => {
      this.countries.set(countries);
    })

    this.form.controls.country.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.form.controls.city.disable();
        this.form.controls.city.setValue('');
        this.form.controls.state.disable();
        this.form.controls.state.setValue('');
        this.locationService.getStates(this.form.controls.country.value!).subscribe(states => {
          this.states.set(states);
          this.form.controls.state.enable();
        });
      } else {
        this.states.set([]);
        this.cities.set([]);
      }
    });
    this.form.controls.state.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.form.controls.city.disable();
        this.form.controls.city.setValue('');
        this.locationService.getCities(this.form.controls.country.value!, this.form.controls.state.value!).subscribe(cities => {
          this.cities.set(cities);
          this.form.controls.city.enable();
        })
      }
    });
  }

  createVenue() {
    const formData = this.form.value;
    const venue: Venue = {
      name: formData.name!,
      country: formData.country!,
      state: formData.state!,
      capacity: formData.capacity!,
      city: formData.city!,
      pincode: formData.pincode!,
      description: formData.description!,
      googleMapsUrl: formData.googleMapsUrl!,
      location: formData.location!,
      seatingLayoutId: formData.seatingLayoutId!,
    }
    this.venueService.createVenue(venue).subscribe({
      next: (data) => {
        this.toastService.showToast({message: "venue created successfully", type: "success"});
        this.router.navigate(['/booking/venue', data.id]);
      },
      error: error => {
        this.toastService.showToast({message: error.message, type: "error"});
      }
    })
  }

  protected readonly hasError = hasError;
}
