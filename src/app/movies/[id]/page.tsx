import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";

// Helper function to format time
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};

export default async function MovieDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve the params promise first
  const { id } = await params;
  const movieId = Number.parseInt(id);

  // Fetch movie data
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("*")
    .eq("id", movieId)
    .single();

  // Fetch theaters data
  const { data: theaters, error: theaterError } = await supabase
    .from("theaters")
    .select("*");

  // Fetch showtimes data
  const { data: showtimes, error: showtimeError } = await supabase
    .from("showtimes")
    .select("*")
    .eq("movie_id", movieId);

  if (movieError || !movie) {
    return <div className="container mx-auto py-8 px-4 text-center">Movie not found</div>;
  }

  if (theaterError || !theaters) {
    console.error("Error fetching theaters:", theaterError);
    return <div className="container mx-auto py-8 px-4 text-center">Failed to load theaters.</div>;
  }

  if (showtimeError || !showtimes) {
    console.error("Error fetching showtimes:", showtimeError);
    return <div className="container mx-auto py-8 px-4 text-center">Failed to load showtimes.</div>;
  }

  // Map showtimes to theaters
  const theatersWithShowtimes = theaters.map((theater) => {
    const theaterShowtimes = showtimes
      .filter((showtime) => showtime.theater_id === theater.id)
      .map((showtime) => formatTime(showtime.show_time)); // Format the time

    return {
      ...theater,
      showtimes: theaterShowtimes,
    };
  });

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
            <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" priority />
          </div>
        </div>
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{movie.genre}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{movie.duration}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{movie.rating}</span>
          </div>
          <p className="mb-4 text-muted-foreground">{movie.description}</p>
          <div className="mb-4">
            <p>
              <strong>Director:</strong> {movie.director}
            </p>
            <p>
              <strong>Cast:</strong> {movie.cast.join(", ")}
            </p>
          </div>

          <Tabs defaultValue="today" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
              <TabsTrigger value="dayafter">Day After</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="space-y-6">
              {theatersWithShowtimes.map((theater) => (
                <Card key={theater.id}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{theater.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{theater.location}</p>
                    <div className="flex flex-wrap gap-2">
                      {theater.showtimes.length > 0 ? (
                        theater.showtimes.map((time: string, index: number) => (
                          <Link
                            href={`/movies/${movie.id}/booking?theater=${theater.id}&time=${encodeURIComponent(time)}`}
                            key={index}
                          >
                            <Button variant="outline" size="sm">
                              {time}
                            </Button>
                          </Link>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No showtimes available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="tomorrow" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">
                Showtimes for tomorrow will be available soon.
              </div>
            </TabsContent>
            <TabsContent value="dayafter" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">
                Showtimes for the day after tomorrow will be available soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}