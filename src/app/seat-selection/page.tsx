"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Seat {
  id: string;
  showtime_id: number;
  row: string;
  number: number;
  status: "available" | "booked";
}

export default function SeatSelection() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get("showtime_id");
  const movieId = searchParams.get("movie_id");

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!showtimeId || isNaN(Number(showtimeId))) {
          throw new Error("Invalid showtime ID");
        }

        const { data, error } = await supabase
          .from("seats")
          .select("*")
          .eq("showtime_id", Number(showtimeId))
          .order("row", { ascending: true })
          .order("number", { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No seats found for this showtime");

        setSeats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load seats");
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status === "booked") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (!selectedSeats.length || !showtimeId || !movieId) return;

    try {
      // Check if user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Create bookings and update seats
      const { error } = await supabase.rpc("create_booking", {
        p_seat_ids: selectedSeats,
        p_user_id: user.id,
        p_showtime_id: Number(showtimeId),
      });

      if (error) throw error;

      // Redirect to confirmation page
      router.push(`/booking-confirmation?movie_id=${movieId}&seats=${selectedSeats.join(",")}`);
    } catch (err: any) {
      setError(err.message || "Booking failed. Please try again.");
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  if (loading) return <div className="text-center py-8">Loading seats...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Your Seats</h1>

      <div className="flex justify-center mb-8">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader className="text-center">
          <CardTitle>Screen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-8 bg-gray-200 rounded-lg mb-12"></div>

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
                          ? "bg-gray-400 cursor-not-allowed"
                          : selectedSeats.includes(seat.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-blue-200"
                      }`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === "booked"}
                      aria-label={`Seat ${row}${seat.number} - ${seat.status}`}
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
            <p className="mb-2">Selected Seats: {selectedSeats.join(", ") || "None"}</p>
            <p className="font-bold">Total: ${selectedSeats.length * 15}.00</p>
          </div>
          <Button onClick={handleBooking} disabled={selectedSeats.length === 0}>
            Confirm Booking
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}