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
  description: string,
  rating: number,
  genres: string[],
  likes: number,
  releaseDate: Date,
  duration: number,
  genreString?: string,
  tags?: string[],
  posterUrl: string;
}
