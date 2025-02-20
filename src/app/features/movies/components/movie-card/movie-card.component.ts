import { Component, input } from '@angular/core';
import { Movie } from '../../../core/types';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageLoaderDirective } from '../../../core/directives/image-loading-status';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, ImageLoaderDirective],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  movie = input<Movie>(null as unknown as Movie);
}
