import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    loadComponent: () => import("../movies/components/movies/movies.component").then(m => m.MoviesComponent),
    children: []
  },
]
