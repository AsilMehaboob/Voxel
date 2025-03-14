'use client'

import { AddMovieForm, AddTheaterForm, AddShowtimeForm } from '@/components/AdminForms'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AddMovieForm />
            <AddTheaterForm />
          </div>
          <div className="lg:col-span-1">
            <AddShowtimeForm />
          </div>
        </div>
      </div>
    </div>
  )
}