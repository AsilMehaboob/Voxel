export type Movie = {
    id: number;
    title: string;
    genre: string;
    duration: string;
    rating: string;
    image: string;
    description: string;
    director: string;
    cast: string[];
  }


  export type Theater = {
    id: number;
    name: string;
    location: string;
  };

  export type Showtime = {
    id: number;
    movie_id: number;
    theater_id: number;
    show_time: string;
  };