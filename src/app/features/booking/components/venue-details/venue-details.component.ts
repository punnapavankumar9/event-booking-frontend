import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { ToastService } from '../../../core/services/toast.service';
import { Venue } from '../../types';

@Component({
  selector: 'app-venue-details',
  imports: [],
  templateUrl: './venue-details.component.html',
  styleUrl: './venue-details.component.scss'
})
export class VenueDetailsComponent implements OnInit {

  venueId = signal<string | null>(null);

  constructor(private router: Router, activatedRouter: ActivatedRoute, private venueService: VenueService, private toastService: ToastService) {
    activatedRouter.params.subscribe(params => {
      this.venueId.set(params['id']);
    });
  }

  venueDetails = signal<null | Venue>(null);


  ngOnInit() {
    if (this.venueId()) {
      this.venueService.getVenueDetails(this.venueId()!).subscribe(
        {
          next: result => {
            this.venueDetails.set(result);
          },
          error: err => {
            this.toastService.showToast({message: err.errorMessage, type: 'error'});
            this.router.navigate(['/']);
          }
        });
    } else {
      this.toastService.showToast({message: "Invalid Url", type: 'error'});
      this.router.navigate(['/']);
    }
  }
}
