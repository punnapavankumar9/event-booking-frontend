export type Toast = {
  message: string,
  type: 'error' | 'info' | 'success' | 'warning',
  closeBtn?: 'close' | 'ok',
  delay?: number
}

export type Movie = {
  id: string,
  title: string,
  imageUrls: string[],
  overview: string,
  rating: number,
  genre: string
}
