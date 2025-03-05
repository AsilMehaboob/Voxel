"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Sample seat data
const generateSeats = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
  const seatsPerRow = 12
  const seats = []

  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      // Randomly mark some seats as booked
      const isBooked = Math.random() < 0.3
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status: isBooked ? "booked" : "available",
      })
    }
  }

  return seats
}

export default function SeatSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theaterId = searchParams.get("theater")
  const showtime = searchParams.get("time")

  const [seats, setSeats] = useState(generateSeats())
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId)
    if (seat && seat.status === "booked") return

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const handleBooking = () => {
    if (selectedSeats.length === 0) return

    // In a real app, you would send this data to your backend
    alert(`Booking confirmed for seats: ${selectedSeats.join(", ")}`)
    router.push("/")
  }

  // Group seats by row for display
  const seatsByRow = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      acc[seat.row].push(seat)
      return acc
    },
    {} as Record<string, typeof seats>,
  )

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Your Seats</h1>

      <div className="mb-8 text-center">
        <p className="text-lg">Theater: {theaterId}</p>
        <p className="text-lg">Showtime: {showtime}</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted-foreground rounded"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader className="text-center">
          <CardTitle>Screen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-8 bg-muted rounded-lg mb-12"></div>

          <div className="space-y-4">
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div key={row} className="flex justify-center gap-2">
                <div className="w-6 flex items-center justify-center font-bold">{row}</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${
                        seat.status === "booked"
                          ? "bg-muted-foreground text-muted cursor-not-allowed"
                          : selectedSeats.includes(seat.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-primary/50"
                      }`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === "booked"}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p>Selected Seats: {selectedSeats.join(", ") || "None"}</p>
            <p>Total: ${selectedSeats.length * 12}.00</p>
          </div>
          <Button onClick={handleBooking} disabled={selectedSeats.length === 0}>
            Book Tickets
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

