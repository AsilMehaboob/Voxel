"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string | null; name: string | null }>({
    email: null,
    name: null,
  });

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser({
          email: data.user?.email || null, // Ensure null instead of undefined
          name: data.user?.user_metadata?.name || "User", // Default name if not available
        });
      }
    }

    // Fetch user when the page loads
    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Update user data when authentication state changes
        setUser({
          email: session.user.email ||null,
          name: session.user.user_metadata?.name || "User",
        });
      } else {
        // Handle logged-out state
        setUser({ email: null, name: null });
      }
    });

    // Cleanup on unmount
    return () => {
      authListener?.subscription.unsubscribe(); // Correct way to unsubscribe
    };
  }, []);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="border p-6 rounded-lg shadow-lg max-w-lg mx-auto">
        <p className="text-lg"><strong>Name:</strong> {user.name || "Not available"}</p>
        <p className="text-lg"><strong>Email:</strong> {user.email || "Not available"}</p>

        <div className="mt-6 flex flex-col gap-4">
          <Link href="/mybookings">
            <Button className="w-full">View Booking History</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
