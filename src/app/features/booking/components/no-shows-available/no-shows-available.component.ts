import { Component, input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { Movie } from '../../../core/types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-shows-available',
  imports: [
    NgIf,
    DatePipe,
    RouterLink
  ],
  templateUrl: './no-shows-available.component.html',
  styleUrl: './no-shows-available.component.scss'
})
export class NoShowsAvailableComponent {
  movie = input.required<Movie>();
}
