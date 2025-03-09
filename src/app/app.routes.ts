import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    "path": "",
    pathMatch: 'full',
    loadComponent: () => import("./features/core/home/home.component").then(m => m.HomeComponent)
  },
  {
    path: "movies",
    loadChildren: () => import("./features/movies/movies.routes").then(m => m.routes)
  },
  {
    path: "booking",
    loadChildren: () => import("./features/booking/booking.route").then(m => m.routes)
  },
  {
    path: "oauth2/success",
    loadComponent: () => import("./features/core/oauth2-success/oauth2-success.component").then(m => m.Oauth2SuccessComponent)
  }
];
