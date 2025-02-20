import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    children: [
      {
        path: "seating",
        children: [
          {
            path: "create",
            loadComponent: () => import("./components/create-seating-layout/create-seating-layout.component").then(m => m.CreateSeatingLayoutComponent),
          },
          {
            path: ":id",
            loadComponent: () => import("./components/seat-layout/seat-layout.component").then(m => m.SeatLayoutComponent),
          }
        ]
      },
      {
        path: "venue", children: [
          {
            path: "create",
            loadComponent: () => import("./components/create-venue/create-venue.component").then(m => m.CreateVenueComponent),
          },
          {
            path: ":id",
            loadComponent: () => import("./components/venue-details/venue-details.component").then(m => m.VenueDetailsComponent)
          }
        ]
      }
    ]
  }
]
