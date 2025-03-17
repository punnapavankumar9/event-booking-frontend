export type LoginCredentials = {
  username: string,
  password: string
}

export type UserRegistrationDetails = {
  username: string,
  password: string,
  email: string
}

export type UserDetails = {
  username: string,
  authorities: string[],
  email : string,
  enabled: boolean
}
