"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, MapPin, Tag, Film, CreditCard, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"

interface BookingDetails {
  id: number
  seat_id: string
  booking_time: string
  payment_status: string
  seat: {
    row: string
    number: number
    showtime: {
      show_time: string
      movie: {
        title: string
        genre: string
        duration: string
        image: string
      }
      theater: {
        name: string
        location: string
      }
    }
  }
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await createClient()
          .from("bookings")
          .select(
            `
            id,
            seat_id,
            booking_time,
            payment_status,
            seat:seats (
              row,
              number,
              showtime:showtimes (
                show_time,
                movie:movies (
                  title,
                  genre,
                  duration,
                  image
                ),
                theater:theaters (
                  name,
                  location
                )
              )
            )
          `,
          )
          .eq("user_id", user.id)

        if (error) {
          console.error("Error fetching bookings:", error)
        } else {
          setBookings(
            data.map((booking: any) => ({
              id: booking.id,
              seat_id: booking.seat_id,
              booking_time: booking.booking_time,
              payment_status: booking.payment_status,
              seat: {
                row: booking.seat.row,
                number: booking.seat.number,
                showtime: {
                  show_time: booking.seat.showtime.show_time,
                  movie: {
                    title: booking.seat.showtime.movie.title,
                    genre: booking.seat.showtime.movie.genre,
                    duration: booking.seat.showtime.movie.duration,
                    image: booking.seat.showtime.movie.image,
                  },
                  theater: {
                    name: booking.seat.showtime.theater.name,
                    location: booking.seat.showtime.theater.location,
                  },
                },
              },
            })) || [],
          )
        }
      } catch (error) {
        console.error("Error in fetchBookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  const filteredBookings =
    activeTab === "all" ? bookings : bookings.filter((booking) => booking.payment_status === activeTab)

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const downloadTicket = (booking: BookingDetails) => {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    })

    // Set background color
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 0, 210, 297, "F")

    // Add header
    doc.setFillColor(30, 41, 59) // slate-800
    doc.rect(0, 0, 148, 25, "F")

    // Add title
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("MOVIE TICKET", 10, 15)

    // Add booking ID as a "ticket number"
    doc.setFontSize(10)
    doc.text(`TICKET #${booking.id.toString().padStart(6, "0")}`, 100, 15)

    // Add movie title
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(booking.seat.showtime.movie.title, 10, 40, { maxWidth: 128 })

    // Add movie details section
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(10, 45, 138, 45)

    // Movie info
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.setFont("helvetica", "normal")

    // Create two columns for details
    const leftCol = 12
    const rightCol = 80
    let yPos = 55

    // Theater info
    doc.setFont("helvetica", "bold")
    doc.text("THEATER:", leftCol, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(booking.seat.showtime.theater.name, leftCol + 25, yPos)
    yPos += 8

    // Location
    doc.setFont("helvetica", "bold")
    doc.text("LOCATION:", leftCol, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(booking.seat.showtime.theater.location, leftCol + 25, yPos)
    yPos += 8

    // Date & Time
    doc.setFont("helvetica", "bold")
    doc.text("DATE & TIME:", leftCol, yPos)
    doc.setFont("helvetica", "normal")

    // Format date more nicely for the ticket
    const showDate = new Date(booking.seat.showtime.show_time)
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    }

    const formattedDate = showDate.toLocaleDateString("en-US", dateOptions)
    const formattedTime = showDate.toLocaleTimeString("en-US", timeOptions)

    doc.text(formattedDate, leftCol + 25, yPos)
    yPos += 6
    doc.text(formattedTime, leftCol + 25, yPos)
    yPos += 8

    // Genre
    doc.setFont("helvetica", "bold")
    doc.text("GENRE:", leftCol, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(booking.seat.showtime.movie.genre, leftCol + 25, yPos)
    yPos += 8

    // Duration
    doc.setFont("helvetica", "bold")
    doc.text("DURATION:", leftCol, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(booking.seat.showtime.movie.duration, leftCol + 25, yPos)
    yPos += 8

    // Seat information
    doc.setFont("helvetica", "bold")
    doc.text("SEAT:", leftCol, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(`${booking.seat.row}${booking.seat.number}`, leftCol + 25, yPos)
    yPos += 15

    // Add a separator
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(10, yPos - 5, 138, yPos - 5)

    // Add a ticket stub with tear line
    doc.setDrawColor(150, 150, 150)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(0, yPos + 5, 148, yPos + 5)

    // Add stub content
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("ADMIT ONE", 60, yPos)

    yPos += 10
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Seat: ${booking.seat.row}${booking.seat.number}`, 60, yPos)

    yPos += 7
    doc.text(`Time: ${formattedTime}`, 60, yPos)

    // Add a simple barcode-like graphic (for visual effect)
    yPos += 15
    const barcodeY = yPos
    doc.setFillColor(0, 0, 0)

    // Generate a pseudo-barcode based on booking ID
    const barcodeStart = 30
    const barcodeWidth = 88
    const barcodeDigits = booking.id.toString().padStart(8, "0").split("")

    barcodeDigits.forEach((digit, index) => {
      const digitWidth = 3 + (Number.parseInt(digit) % 3)
      const xPos = barcodeStart + index * 10
      if (index % 2 === 0) {
        doc.rect(xPos, barcodeY, digitWidth, 15, "F")
      } else {
        doc.rect(xPos, barcodeY, digitWidth, 10, "F")
      }
    })

    // Add booking reference at the bottom
    yPos += 25
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Booking Reference: ${booking.id}`, 50, yPos)
    doc.text(`Booked on: ${formatDate(booking.booking_time)}`, 50, yPos + 4)

    // Add payment status
    const statusColors: Record<string, number[]> = {
      completed: [39, 174, 96],
      pending: [241, 196, 15],
      failed: [231, 76, 60],
    }

    const statusColor = statusColors[booking.payment_status] || [100, 100, 100]

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
    doc.circle(130, 40, 7, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    // Use first letter of status as icon
    const statusLetter = booking.payment_status.charAt(0).toUpperCase()
    doc.text(statusLetter, 128, 43)

    // Add a note at the bottom
    yPos += 15
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("Please arrive 15 minutes before showtime. This ticket is non-refundable.", 30, yPos)

    // Save the PDF with a descriptive filename
    const movieTitle = booking.seat.showtime.movie.title.replace(/[^a-zA-Z0-9]/g, "")
    doc.save(`${movieTitle}_Ticket_${booking.id}.pdf`)
  }

  const viewDetails = (bookingId: number) => {
    router.push(`/movies/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4">
                    <Skeleton className="h-64 w-full md:h-full rounded-none" />
                  </div>
                  <div className="p-6 md:w-3/4">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your movie tickets</p>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {filteredBookings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Film className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any {activeTab !== "all" ? activeTab : ""} bookings yet.
            </p>
            <Button onClick={() => router.push("/movies")}>Browse Movies</Button>
          </motion.div>
        ) : (
          <motion.div
            key="bookings-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4">
                        <div className="relative h-64 md:h-full">
                          <Image
                            src={booking.seat.showtime.movie.image || "/placeholder.svg"}
                            alt={booking.seat.showtime.movie.title}
                            width={300}
                            height={450}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        </div>
                      </div>
                      <div className="p-6 md:w-3/4">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-2xl font-bold line-clamp-1">{booking.seat.showtime.movie.title}</h2>
                          <Badge
                            className={`${getStatusColor(booking.payment_status)} border px-3 py-1 text-xs font-medium`}
                          >
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.seat.showtime.movie.genre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.seat.showtime.movie.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="line-clamp-1">
                              {booking.seat.showtime.theater.name}, {booking.seat.showtime.theater.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Seat {booking.seat.row}
                              {booking.seat.number}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.seat.showtime.show_time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Booked on {formatDate(booking.booking_time)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => downloadTicket(booking)}>
                            Download Ticket
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyBookings

