export const gatewayURL = 'http://localhost:8080'
export const environment = {
  identity: gatewayURL + "/api/v1/users",
  events: gatewayURL + '/api/v1/events',
  seatingLayoutUrl: gatewayURL + '/api/v1/seating-layout',
  movies: gatewayURL + '/api/v1/movies'
};
