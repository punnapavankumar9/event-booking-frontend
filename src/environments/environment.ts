export const gatewayURL = 'http://localhost:8080'
export const environment = {
  identity: gatewayURL + "/api/v1/users",
  events: gatewayURL + '/api/v1/events',
  seatingLayoutUrl: gatewayURL + '/api/v1/seating-layout',
  movies: gatewayURL + '/api/v1/movies',
  locations: gatewayURL + '/api/v1/locations',
  venues: gatewayURL + '/api/v1/venues',
  orders: gatewayURL + '/api/v1/orders',
  razorpayId: "rzp_test_NKD77owZ3pZ3DR",
  googleSignInUrl: gatewayURL + '/oauth2/authorization/google',
  githubSignInUrl: gatewayURL + '/oauth2/authorization/github',
};
