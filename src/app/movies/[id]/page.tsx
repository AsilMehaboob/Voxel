import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample movie data - in a real app, this would come from an API or database
const movies = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi",
    duration: "2h 49m",
    rating: "PG-13",
    image: "/placeholder.svg?height=400&width=300",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action",
    duration: "2h 32m",
    rating: "PG-13",
    image: "/placeholder.svg?height=400&width=300",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  },
  {
    id: 3,
    title: "Inception",
    genre: "Sci-Fi",
    duration: "2h 28m",
    rating: "PG-13",
    image: "/placeholder.svg?height=400&width=300",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
  },
  {
    id: 4,
    title: "Pulp Fiction",
    genre: "Crime",
    duration: "2h 34m",
    rating: "R",
    image: "/placeholder.svg?height=400&width=300",
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
  },
  {
    id: 5,
    title: "The Shawshank Redemption",
    genre: "Drama",
    duration: "2h 22m",
    rating: "R",
    image: "/placeholder.svg?height=400&width=300",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
  },
  {
    id: 6,
    title: "The Godfather",
    genre: "Crime",
    duration: "2h 55m",
    rating: "R",
    image: "/placeholder.svg?height=400&width=300",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan"],
  },
]

// Sample theaters and showtimes data
const theaters = [
  {
    id: 1,
    name: "Cineplex Downtown",
    location: "123 Main St, Downtown",
    showtimes: ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM", "10:30 PM"],
  },
  {
    id: 2,
    name: "MovieMax Central",
    location: "456 Park Ave, Central District",
    showtimes: ["11:15 AM", "2:00 PM", "5:30 PM", "9:15 PM"],
  },
  {
    id: 3,
    name: "Star Cinemas",
    location: "789 Broadway, Uptown",
    showtimes: ["10:30 AM", "1:00 PM", "3:45 PM", "6:30 PM", "9:00 PM"],
  },
]

export default function MovieDetail({ params }: { params: { id: string } }) {
  const movieId = Number.parseInt(params.id)
  const movie = movies.find((m) => m.id === movieId)

  if (!movie) {
    return <div className="container mx-auto py-8 px-4 text-center">Movie not found</div>
  }

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
              {theaters.map((theater) => (
                <Card key={theater.id}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{theater.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{theater.location}</p>
                    <div className="flex flex-wrap gap-2">
                      {theater.showtimes.map((time, index) => (
                        <Link
                          href={`/movies/${movie.id}/booking?theater=${theater.id}&time=${encodeURIComponent(time)}`}
                          key={index}
                        >
                          <Button variant="outline" size="sm">
                            {time}
                          </Button>
                        </Link>
                      ))}
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
  )
}

