import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: '',
        loadComponent: () => import("../movies/components/movies/movies.component").then(m => m.MoviesComponent),
      },
      {
        path: "create",
        loadComponent: () => import("./components/create-movie/create-movie.component").then(m => m.CreateMovieComponent),
      },
      {
        path: "details/:id",
        loadComponent: () => import("./components/movie-details/movie-details.component").then(m => m.MovieDetailsComponent),
      },

    ]
  },
]
