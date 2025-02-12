import { Component, input } from '@angular/core';
import { Movie } from '../../../core/types';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  movie = input<Movie>(null as unknown as Movie);

}
