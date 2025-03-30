import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { logout } from "@/app/login/actions"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          Voxel
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          {/* <Link href="#" className="text-sm font-medium hover:underline">
            Movies
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Theaters
          </Link> */}
          <Link href="/mybookings" className="text-sm font-medium hover:underline">
            My Bookings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="hidden md:flex">
            <User className="h-4 w-4" />
            <span className="sr-only">User account</span>
          </Button>
          <Button variant="outline" size="icon" className="hidden md:flex" onClick={logout} >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-sm font-medium hover:underline">
                  Home
                </Link>
                {/* <Link href="#" className="text-sm font-medium hover:underline">
                  Movies
                </Link>
                <Link href="#" className="text-sm font-medium hover:underline">
                  Theaters
                </Link> */}
                <Link href="#" className="text-sm font-medium hover:underline">
                  My Bookings
                </Link>
                <Button variant="outline" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
                <Button variant="outline" className="justify-start">
                  <LogOut onClick={logout} className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

