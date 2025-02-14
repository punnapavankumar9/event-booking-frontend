import { Component, input } from '@angular/core';
import { Movie } from '../../../core/types';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  movie = input<Movie>(null as unknown as Movie);

}
