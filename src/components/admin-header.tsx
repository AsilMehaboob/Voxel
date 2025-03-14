"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabaseClient"
import { Film, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null)
  const supabaseClient = supabase
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)

      if (event === "SIGNED_OUT") {
        router.push("/login")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabaseClient, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Film className="h-5 w-5" />
          <span>Movie Admin</span>
        </Link>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/admin/movies" className="text-sm font-medium transition-colors hover:text-primary">
            Movies
          </Link>
          <Link
            href="/admin/theaters"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Theaters
          </Link>
          <Link
            href="/admin/showtimes"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Showtimes
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

