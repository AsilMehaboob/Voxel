"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Define TypeScript interfaces for form data
interface MovieForm {
  title: string;
  genre: string;
  duration: string;
  rating: string;
  image: string;
  description: string;
  director: string;
  cast: string;
}

interface TheaterForm {
  name: string;
  location: string;
}

interface ShowtimeForm {
  movie_id: string;
  theater_id: string;
  show_time: string;
}

// Add Movie Component
export function AddMovieForm() {
  const [formData, setFormData] = useState<MovieForm>({
    title: "",
    genre: "",
    duration: "",
    rating: "",
    image: "",
    description: "",
    director: "",
    cast: "[]",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const castArray = JSON.parse(formData.cast);
      if (!Array.isArray(castArray)) throw new Error("Cast must be a valid JSON array");

      const { error } = await supabase.from("movies").insert({
        ...formData,
        cast: castArray,
      });

      if (error) throw error;
      alert("Movie added successfully!");
      setFormData({
        title: "",
        genre: "",
        duration: "",
        rating: "",
        image: "",
        description: "",
        director: "",
        cast: "[]",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Movie</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["title", "genre", "duration", "rating", "image", "director"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)} *
            </label>
            <input
              id={field}
              name={field}
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData[field]}
              onChange={handleInputChange}
            />
          </div>
        ))}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="cast" className="block text-sm font-medium text-gray-700 mb-1">
            Cast (JSON array) *
          </label>
          <textarea
            id="cast"
            name="cast"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            rows={4}
            value={formData.cast}
            onChange={handleInputChange}
            placeholder='["Actor 1", "Actor 2"]'
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Movie
        </button>
      </form>
    </div>
  );
}

// Add Theater Component
export function AddTheaterForm() {
  const [formData, setFormData] = useState<TheaterForm>({
    name: "",
    location: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase.from("theaters").insert(formData);
      if (error) throw error;
      alert("Theater added successfully!");
      setFormData({ name: "", location: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Theater</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["name", "location"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)} *
            </label>
            <input
              id={field}
              name={field}
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData[field]}
              onChange={handleInputChange}
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Theater
        </button>
      </form>
    </div>
  );
}

// Add Showtime Component (with seat generation)
export function AddShowtimeForm() {
  const [formData, setFormData] = useState<ShowtimeForm>({
    movie_id: "",
    theater_id: "",
    show_time: "",
  });

  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: movies } = await supabase.from("movies").select("*");
      const { data: theaters } = await supabase.from("theaters").select("*");
      if (movies) setMovies(movies);
      if (theaters) setTheaters(theaters);
    };
    fetchData();
  }, []);

  // Seat generation function
  const generateSeats = async (showtimeId: number) => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 12;
    const seats = [];

    for (const row of rows) {
      for (let number = 1; number <= seatsPerRow; number++) {
        seats.push({
          id: `${showtimeId}-${row}${number}`,
          showtime_id: showtimeId,
          row,
          number,
          status: "available",
        });
      }
    }

    const { error } = await supabase.from("seats").insert(seats);
    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // First create the showtime
      const { data: newShowtime, error } = await supabase
        .from("showtimes")
        .insert({
          movie_id: Number(formData.movie_id),
          theater_id: Number(formData.theater_id),
          show_time: formData.show_time,
        })
        .select()
        .single();

      if (error) throw error;

      // Then generate seats for the new showtime
      await generateSeats(newShowtime.id);

      alert("Showtime added successfully!");
      setFormData({ movie_id: "", theater_id: "", show_time: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Showtime</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="movie_id" className="block text-sm font-medium text-gray-700 mb-1">
            Movie *
          </label>
          <select
            id="movie_id"
            name="movie_id"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.movie_id}
            onChange={handleInputChange}
          >
            <option value="">Select a movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="theater_id" className="block text-sm font-medium text-gray-700 mb-1">
            Theater *
          </label>
          <select
            id="theater_id"
            name="theater_id"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.theater_id}
            onChange={handleInputChange}
          >
            <option value="">Select a theater</option>
            {theaters.map((theater) => (
              <option key={theater.id} value={theater.id}>
                {theater.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="show_time" className="block text-sm font-medium text-gray-700 mb-1">
            Show Time *
          </label>
          <input
            id="show_time"
            name="show_time"
            type="time"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.show_time}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Showtime
        </button>
      </form>
    </div>
  );
}