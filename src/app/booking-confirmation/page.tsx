"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Movie {
  id: number;
  title: string;
  duration: string;
  // Add other movie properties as needed
}

export default function BookingConfirmation() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movie_id");
  const seatsParam = searchParams.get("seats");
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!movieId || !seatsParam) {
          throw new Error("Invalid booking parameters");
        }

        // Fetch movie details
        const { data: movieData, error: movieError } = await supabase
          .from("movies")
          .select("*")
          .eq("id", Number(movieId))
          .single();

        if (movieError) throw movieError;
        if (!movieData) throw new Error("Movie not found");

        setMovie(movieData);
      } catch (err: any) {
        setError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, seatsParam, supabase]);

  if (loading) return <div className="text-center py-8">Loading booking details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Booking Confirmed!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <div className="text-6xl text-green-500 mb-4">✓</div>
            
            {movie && (
              <div className="space-y-2">
                <p className="text-xl font-semibold">{movie.title}</p>
                <p className="text-gray-600">Duration: {movie.duration}</p>
              </div>
            )}

            {seatsParam && (
              <div className="space-y-2">
                <p className="text-lg font-medium">Seats: {seatsParam.split(",").join(", ")}</p>
                <p className="text-lg font-bold">
                  Total: ${seatsParam.split(",").length * 15}.00
                </p>
              </div>
            )}

            <p className="text-gray-600 mt-4">
              A confirmation email has been sent to your registered address.
            </p>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")} className="px-8 py-4">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}