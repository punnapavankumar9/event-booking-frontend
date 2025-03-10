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
      },
      {
        path: 'scheduler', children: [
          {
            path: "movie/:id",
            loadComponent: () => import("./components/movie-scheduler/movie-scheduler.component").then(m => m.MovieSchedulerComponent),
          }
        ]
      },
      {
        path: 'shows',
        children: [
          {
            path: ":movieId",
            children: [
              {
                path: "",
                loadComponent: () => import("./components/show-listing/show-listing.component").then(m => m.ShowListingComponent),
              },
              {
                path: "book",
                loadComponent: () => import("./components/book-movie-tickets/book-movie-tickets.component").then(m => m.BookMovieTicketsComponent)
              }
            ]
          }
        ]
      },
      {
        path: "orders", children: [
          {
            path: ":orderId",
            loadComponent: () => import("./components/movie-booking-confirmation/movie-booking-confirmation.component").then(m => m.MovieBookingConfirmationComponent),
          }
        ]
      }
    ]
  }
]
