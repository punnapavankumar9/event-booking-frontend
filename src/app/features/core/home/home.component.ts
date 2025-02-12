import { Component, model } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { Movie } from '../types';
import { MovieCardComponent } from '../../movies/components/movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  imports: [
    SliderComponent,
    MovieCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  movies: Movie[] = [
    {
      id: '1',
      title: "Chhaava",
      genre: 'action/drama/historical',
      overview: "Overview",
      rating: 9.8,
      imageUrls: []
    }, {
      id: '1',
      title: "Thandel",
      genre: 'action/historical',
      overview: "Overview",
      rating: 9.8,
      imageUrls: []
    }, {
      id: '1',
      title: "vidaamuyarchi",
      genre: 'action/mystery/thriller',
      overview: "Overview",
      rating: 9.8,
      imageUrls: []
    }, {
      id: '1',
      title: "Bad ass ravikumar",
      genre: 'action/drama',
      overview: "Overview",
      rating: 9.8,
      imageUrls: []
    }
  ]

  constructor() {
  }

  protected readonly model = model;
}
