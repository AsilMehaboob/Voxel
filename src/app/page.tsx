import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Movie } from "@/types/types"; 

export default async function Home() {
  const { data: movies, error } = await supabase
    .from("movies")
    .select("*");

  if (error) {
    console.error("Error fetching movies:", error);
    return <div>Failed to load movies.</div>;
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Now Showing</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie: Movie) => (
          <Link href={`/movies/${movie.id}`} key={movie.id}>
            <Card className="overflow-hidden h-full transition-transform hover:scale-105">
              <div className="relative h-[400px] w-full">
                <Image
                  src={movie.image || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{movie.genre}</span>
                  <span>{movie.duration}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    {movie.rating}
                  </span>
                  <Button size="sm">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}